import { spawn } from 'node:child_process'
import { readFile } from 'node:fs/promises'
import { createServer } from 'node:http'
import { expect, test } from '@playwright/test'

import type { APIRequestContext } from '@playwright/test'
import type { ChildProcess } from 'node:child_process'
import type { Server } from 'node:http'

const API_URL = process.env.API_URL || 'http://localhost:8090'

const PAGE_METAS = {
  home: {
    title: 'Jardinerie tropicale : plantes rares livrées',
    description:
      'Plantes tropicales rares, conseils d’entretien et livraison soignée : la jardinerie en ligne des amateurs de feuillages.',
  },
  contact: { title: 'Nous écrire : une question sur vos plantes', description: '' },
}
const PRODUCT_META = {
  metaTitle: 'Monstera deliciosa : la plante à feuilles découpées',
  metaDescription:
    'Monstera deliciosa en pot : grandes feuilles découpées, croissance rapide, entretien facile à la mi-ombre.',
}
const ARTICLE_META = {
  metaTitle: 'Carrousel accessible : le guide sans dépendance',
  metaDescription:
    'Construire un carrousel accessible au clavier et au lecteur d’écran, sans bibliothèque, à partir du défilement natif.',
}

/**
 * API factice devant l'API réelle : elle relaie tout en ajoutant ce que l'admin aurait saisi (métadonnées, image de partage,
 * icône) et retire la rubrique du premier article. Le rendu est serveur : l'interception réseau de Playwright ne verrait pas
 * les appels.
 */
const startFakeApi = (port: number) => {
  const origin = `http://localhost:${port}`
  const patches: Record<string, (body: never) => unknown> = {
    '/api/site-identity': (identity: object) => ({
      ...identity,
      shareImage: {
        alt: 'Serre tropicale',
        width: 1200,
        height: 630,
        sources: [{ type: 'image/webp', srcset: `${origin}/share-1200.webp 1200w` }],
        src: `${origin}/share-1200.webp`,
      },
      icon: {
        png32: `${origin}/icon-32.png`,
        png180: `${origin}/icon-180.png`,
        png192: `${origin}/icon-192.png`,
        png512: `${origin}/icon-512.png`,
      },
    }),
    '/api/page-metas': (metas: { page: string }[]) =>
      metas.map((meta) => ({ ...meta, ...PAGE_METAS[meta.page as keyof typeof PAGE_METAS] })),
    '/api/products/monstera-deliciosa': (product: object) => ({ ...product, ...PRODUCT_META }),
    '/api/articles/un-carrousel-accessible-sans-dependance': (article: object) => ({
      ...article,
      ...ARTICLE_META,
    }),
    '/api/articles': (articles: object[]) =>
      articles.map((article, index) => (index === 0 ? { ...article, section: null } : article)),
  }

  return createServer(async (request, response) => {
    const url = request.url ?? '/'
    if (url.endsWith('.png') || url.endsWith('.webp')) {
      const file = url.endsWith('.webp') ? 'static/images/hero-1280.webp' : 'static/icon-192.png'
      response
        .writeHead(200, { 'content-type': url.endsWith('.webp') ? 'image/webp' : 'image/png' })
        .end(await readFile(file))
      return
    }
    const upstream = await fetch(`${API_URL}${url}`, {
      headers: { accept: request.headers.accept ?? 'application/json' },
    })
    const patch = patches[url]
    const body =
      patch && upstream.ok
        ? JSON.stringify(patch((await upstream.json()) as never))
        : Buffer.from(await upstream.arrayBuffer())
    response
      .writeHead(upstream.status, {
        'content-type': upstream.headers.get('content-type') ?? 'application/json',
      })
      .end(body)
  }).listen(port)
}

const headOf = async (request: APIRequestContext, url: string) => {
  const html = await (await request.get(url)).text()
  return {
    html,
    title: html.match(/<title>([^<]*)<\/title>/)?.[1] ?? '',
    meta: (attribute: string) =>
      html.match(new RegExp(`<meta ${attribute} content="([^"]*)"`))?.[1] ?? '',
  }
}

test.describe('Contenus saisis dans l’admin (API factice)', () => {
  test.describe.configure({ mode: 'serial' })

  let app: ChildProcess | undefined
  let api: Server | undefined
  let appUrl = ''
  let apiOrigin = ''

  test.beforeAll(async () => {
    const offset = test.info().project.name === 'mobile' ? 2 : 0
    const appPort = 3136 + offset
    const apiPort = 3137 + offset
    appUrl = `http://localhost:${appPort}`
    apiOrigin = `http://localhost:${apiPort}`
    api = startFakeApi(apiPort)
    app = spawn('node', ['build'], {
      env: { ...process.env, PORT: String(appPort), PUBLIC_SITE_URL: appUrl, API_URL: apiOrigin },
      stdio: 'ignore',
    })
    await expect
      .poll(async () => (await fetch(appUrl).catch(() => null))?.status, { timeout: 15_000 })
      .toBe(200)
  })

  test.afterAll(() => {
    app?.kill()
    api?.close()
  })

  test('les pages fixes prennent le titre et la description saisis', async ({ request }) => {
    const home = await headOf(request, appUrl)
    expect(home.title).toBe(PAGE_METAS.home.title)
    expect(home.meta('name="description"')).toBe(PAGE_METAS.home.description)
    expect(home.meta('property="og:title"')).toBe(PAGE_METAS.home.title)
    expect(home.meta('property="og:description"')).toBe(PAGE_METAS.home.description)

    const contact = await headOf(request, `${appUrl}/contact`)
    expect(contact.title).toBe(PAGE_METAS.contact.title)
    expect(contact.meta('name="description"')).toMatch(/^Démo de formulaire/)
  })

  test('la fiche produit et la fiche article prennent leurs métadonnées saisies', async ({
    request,
  }) => {
    const product = await headOf(request, `${appUrl}/produit/monstera-deliciosa`)
    expect(product.title).toBe(PRODUCT_META.metaTitle)
    expect(product.meta('name="description"')).toBe(PRODUCT_META.metaDescription)
    expect(product.meta('property="og:title"')).toBe(PRODUCT_META.metaTitle)

    const article = await headOf(request, `${appUrl}/blog/un-carrousel-accessible-sans-dependance`)
    expect(article.title).toBe(ARTICLE_META.metaTitle)
    expect(article.meta('name="description"')).toBe(ARTICLE_META.metaDescription)
    expect(article.meta('property="og:description"')).toBe(ARTICLE_META.metaDescription)
  })

  test('titres et descriptions servis restent dans les longueurs du référencement', async ({
    request,
  }) => {
    for (const path of [
      '/',
      '/contact',
      '/produit/monstera-deliciosa',
      '/blog/un-carrousel-accessible-sans-dependance',
    ]) {
      const { title, meta } = await headOf(request, `${appUrl}${path}`)
      expect(title.length, path).toBeLessThanOrEqual(60)
      expect(meta('name="description"').length, path).toBeLessThanOrEqual(160)
    }
  })

  test('l’image de partage saisie remplace celle du site, pas celle d’une fiche', async ({
    request,
  }) => {
    const contact = await headOf(request, `${appUrl}/contact`)
    expect(contact.meta('property="og:image"')).toBe(`${apiOrigin}/share-1200.webp`)
    expect(contact.meta('name="twitter:image"')).toBe(`${apiOrigin}/share-1200.webp`)
    expect(contact.meta('property="og:image:alt"')).toBe('Serre tropicale')

    const product = await headOf(request, `${appUrl}/produit/monstera-deliciosa`)
    expect(product.meta('property="og:image"')).not.toContain('share-1200')
  })

  test('les favicons, les icônes du manifeste et le logo Organization pointent vers l’icône saisie', async ({
    request,
  }) => {
    const { html } = await headOf(request, `${appUrl}/contact`)
    expect(html).toContain(
      `<link rel="icon" type="image/png" sizes="32x32" href="${apiOrigin}/icon-32.png"`,
    )
    expect(html).toContain(`<link rel="apple-touch-icon" href="${apiOrigin}/icon-180.png"`)
    expect(html).not.toContain('/favicon.svg')

    const home = await (await request.get(appUrl)).text()
    expect(home).toContain(`"@type":"Organization"`)
    expect(home).toContain(`"logo":"${apiOrigin}/icon-512.png"`)

    const manifest = await (await request.get(`${appUrl}/manifest.webmanifest`)).json()
    expect(manifest.icons.map(({ src }: { src: string }) => src)).toEqual([
      `${apiOrigin}/icon-192.png`,
      `${apiOrigin}/icon-512.png`,
    ])
  })

  test('une carte d’article sans rubrique n’a pas de sur-titre', async ({ page }) => {
    await page.goto(`${appUrl}/blog`)
    const cards = page.getByTestId('blog-card')

    await expect(cards).toHaveCount(3)
    await expect(cards.first().getByTestId('article-section')).toHaveCount(0)
    await expect(cards.nth(1).getByTestId('article-section')).toHaveText('Conseils')
  })
})
