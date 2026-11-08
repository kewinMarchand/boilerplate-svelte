import { expect, test } from '@playwright/test'

import { ROUTES } from './routes'

test.describe('SEO', () => {
  test('chaque route porte ses métadonnées, rendues côté serveur', async ({ request }) => {
    const titles = new Set<string>()

    for (const route of ROUTES) {
      const html = await (await request.get(route)).text()
      const meta = (pattern: RegExp) => html.match(pattern)?.[1]

      const title = meta(/<title>([^<]+)<\/title>/)
      expect(title, route).toBeTruthy()
      titles.add(title ?? '')

      const description = meta(/<meta name="description" content="([^"]+)"/) ?? ''
      expect(description.length, `${route} : ${description}`).toBeGreaterThanOrEqual(50)
      expect(description.length, route).toBeLessThanOrEqual(160)

      expect(meta(/<link rel="canonical" href="([^"]+)"/), route).toMatch(/^https?:\/\//)
      expect(meta(/<meta property="og:title" content="([^"]+)"/), route).toBeTruthy()
      expect(meta(/<meta property="og:description" content="([^"]+)"/), route).toBeTruthy()
      expect(meta(/<meta property="og:image" content="([^"]+)"/), route).toMatch(/^https?:\/\//)
      expect(html, route).toContain('<html lang="fr"')

      for (const [, json] of html.matchAll(
        /<script type="application\/ld\+json">(.*?)<\/script>/g,
      )) {
        expect(() => JSON.parse(json ?? ''), route).not.toThrow()
      }
    }

    expect(titles.size).toBe(ROUTES.length)
  })

  test('sans métadonnées saisies, les pages gardent leurs valeurs et les fichiers du site', async ({
    request,
  }) => {
    const html = await (await request.get('/produit/monstera-deliciosa')).text()
    expect(html).toMatch(/<title>Monstera deliciosa · [^<]+<\/title>/)
    expect(html).toContain('<meta property="og:title" content="Monstera deliciosa"')

    const contact = await (await request.get('/contact')).text()
    expect(contact).toMatch(/<title>Contact · [^<]+<\/title>/)
    expect(contact).toMatch(/<meta property="og:image" content="https?:\/\/[^"]+\/og-image\.jpg"/)
    expect(contact).toContain('<link rel="icon" href="/favicon.svg" type="image/svg+xml"')
    expect(contact).toContain('<link rel="apple-touch-icon" href="/apple-touch-icon.png"')
    expect(contact).not.toContain('sizes="32x32"')

    const manifest = await (await request.get('/manifest.webmanifest')).json()
    expect(manifest.icons.map(({ src }: { src: string }) => src)).toEqual([
      '/icon-192.png',
      '/icon-512.png',
    ])
  })

  test('la description saisie de la page blog est servie (fixtures)', async ({ request }) => {
    const html = await (await request.get('/blog')).text()
    const description =
      'Conseils et actualités du modèle : rendu serveur, accessibilité, composants sans dépendance.'

    expect(html).toContain(`<meta name="description" content="${description}"`)
    expect(html).toContain(`<meta property="og:description" content="${description}"`)
    expect(html).toMatch(/<title>Blog · [^<]+<\/title>/)
  })

  test('l’accueil déclare Organization et WebSite', async ({ request }) => {
    const html = await (await request.get('/')).text()
    expect(html).toContain('"@type":"Organization"')
    expect(html).toContain('"@type":"WebSite"')
    expect(html).toMatch(/"logo":"https?:\/\/[^"]+\/icon-512\.png"/)
  })

  test('une page filtrée est en noindex avec une canonique sans filtre', async ({ request }) => {
    const html = await (
      await request.get('/catalogue/plantes-interieur?exposition=soleil&page=1')
    ).text()
    expect(html).toContain('<meta name="robots" content="noindex, follow"')
    expect(html).toMatch(
      /<link rel="canonical" href="http:\/\/localhost:3120\/catalogue\/plantes-interieur"/,
    )
    expect(html).toContain('"@type":"ItemList"')
  })

  test('le sitemap liste chaque catégorie et robots.txt y renvoie', async ({ request }) => {
    const sitemap = await (await request.get('/sitemap.xml')).text()
    expect(sitemap).toContain('/catalogue/plantes-interieur/feuillages/monstera</loc>')
    expect(sitemap).not.toContain('charte-graphique')

    const robots = await (await request.get('/robots.txt')).text()
    expect(robots).toContain('Sitemap: http://localhost:3120/sitemap.xml')
  })
})
