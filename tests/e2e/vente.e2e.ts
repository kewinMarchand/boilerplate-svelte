import { spawn } from 'node:child_process'
import { createServer } from 'node:http'
import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

import { MODES } from './routes'
import { gotoHydrated, useMode } from './support'

import type { Page } from '@playwright/test'
import type { ChildProcess } from 'node:child_process'
import type { Server } from 'node:http'
import type { AddressInfo } from 'node:net'

const API_URL = process.env.API_URL || 'http://localhost:8090'
const PRODUCT = { slug: 'monstera-deliciosa', name: 'Monstera deliciosa' }
const OUT_OF_STOCK = 'monstera-thai-constellation'
const INQUIRY_NAME = `Demande de renseignement sur ${PRODUCT.name}`

const fillContactForm = async (page: Page) => {
  await page.getByTestId('contact-name').fill('Ada')
  await page.getByTestId('contact-email').fill('ada@exemple.fr')
  await page.getByTestId('contact-message').fill('Ce produit est-il livré en pot ?')
}

const expectNoViolations = async (page: Page) => {
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze()
  expect(results.violations).toEqual([])
}

test.describe('Vente en ligne active (fixtures)', () => {
  test('la fiche garde le bouton d’ajout au panier, sans lien de demande', async ({ page }) => {
    await gotoHydrated(page, `/produit/${PRODUCT.slug}`)

    await expect(page.getByTestId('product-price')).toBeVisible()
    await expect(page.getByTestId('add-to-cart')).toBeVisible()
    await expect(page.getByTestId('product-inquiry')).toHaveCount(0)
  })

  test('une demande de renseignement passe aussi quand la vente est active', async ({ page }) => {
    await gotoHydrated(page, `/contact?produit=${PRODUCT.slug}`)
    await expect(page.getByTestId('contact-product')).toContainText(
      `Votre demande concerne : ${PRODUCT.name}`,
    )
    await expect(page.getByTestId('contact-product').getByRole('link')).toHaveAttribute(
      'href',
      `/produit/${PRODUCT.slug}`,
    )
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /\/contact$/)

    await fillContactForm(page)
    const request = page.waitForRequest((sent) => sent.method() === 'POST')
    await page.getByTestId('contact-submit').click()

    expect((await request).postData()).toContain(PRODUCT.slug)
    await expect(page.getByTestId('contact-success')).toContainText(
      'Votre demande de renseignement a bien été envoyée.',
    )
  })

  test('un produit inconnu donne le formulaire de contact simple', async ({ page }) => {
    await page.goto('/contact?produit=produit-inconnu')

    await expect(page.getByTestId('contact-name')).toBeVisible()
    await expect(page.getByTestId('contact-product')).toHaveCount(0)
  })
})

/**
 * API factice devant l'API réelle : identité avec la vente en ligne coupée, messages de contact enregistrés ici (rien
 * n'est écrit dans l'API partagée), tout le reste relayé. Le rendu est serveur : l'interception réseau de Playwright ne
 * verrait pas ces appels. Ports libres choisis par le système, pour ne gêner aucun autre serveur de test.
 */
const startFakeApi = (contactBodies: unknown[]) =>
  new Promise<Server>((resolve) => {
    const server = createServer(async (request, response) => {
      const url = request.url ?? '/'
      if (url === '/api/contact_messages' && request.method === 'POST') {
        const chunks: Buffer[] = []
        for await (const chunk of request) chunks.push(Buffer.from(chunk))
        const body: object = JSON.parse(Buffer.concat(chunks).toString())
        contactBodies.push(body)
        response
          .writeHead(201, { 'content-type': 'application/json' })
          .end(JSON.stringify({ id: 1, ...body }))
        return
      }
      const upstream = await fetch(`${API_URL}${url}`, {
        headers: { accept: request.headers.accept ?? 'application/json' },
      })
      const text = await upstream.text()
      const body =
        url === '/api/site-identity' && upstream.ok
          ? JSON.stringify({ ...JSON.parse(text), salesEnabled: false })
          : text
      response
        .writeHead(upstream.status, {
          'content-type': upstream.headers.get('content-type') ?? 'application/json',
        })
        .end(body)
    })
    server.listen(0, () => resolve(server))
  })

const freePort = () =>
  new Promise<number>((resolve) => {
    const probe = createServer().listen(0, () => {
      const { port } = probe.address() as AddressInfo
      probe.close(() => resolve(port))
    })
  })

test.describe('Vente en ligne coupée (API factice)', () => {
  test.describe.configure({ mode: 'serial' })

  const contactBodies: unknown[] = []
  let app: ChildProcess | undefined
  let api: Server | undefined
  let appUrl = ''

  test.beforeAll(async () => {
    api = await startFakeApi(contactBodies)
    const appPort = await freePort()
    appUrl = `http://localhost:${appPort}`
    app = spawn('node', ['build'], {
      env: {
        ...process.env,
        PORT: String(appPort),
        PUBLIC_SITE_URL: appUrl,
        API_URL: `http://localhost:${(api.address() as AddressInfo).port}`,
      },
      stdio: 'ignore',
    })
    await expect
      .poll(async () => (await fetch(appUrl).catch(() => null))?.status, { timeout: 15_000 })
      .toBe(200)
  })

  test.beforeEach(async ({ page }) => {
    // Origine figée au build (port de Playwright) : SvelteKit refuse un POST d'une autre origine (403). Chromium ne laisse
    // pas réécrire l'en-tête Origin d'une requête : le POST est rejoué par Playwright avec l'origine du build.
    const builtOrigin = test.info().project.use.baseURL ?? ''
    await page.route(`${appUrl}/contact**`, async (route) => {
      if (route.request().method() !== 'POST') return route.continue()
      const headers = { ...route.request().headers(), origin: builtOrigin }
      return route.fulfill({ response: await route.fetch({ headers }) })
    })
  })

  test.afterAll(() => {
    app?.kill()
    api?.close()
  })

  test('le catalogue n’affiche ni prix, ni filtre, ni tri par prix', async ({ page }) => {
    await gotoHydrated(page, `${appUrl}/catalogue`)

    await expect(page.getByTestId('catalog-product').first()).toBeVisible()
    await expect(page.getByTestId('catalog-product-price')).toHaveCount(0)
    await expect(page.getByTestId('catalog-filter-price-min')).toHaveCount(0)
    await expect(page.getByTestId('catalog-filter-price-max')).toHaveCount(0)
    const sorts = await page
      .getByTestId('catalog-sort')
      .locator('option')
      .evaluateAll((options) => options.map((option) => (option as HTMLOptionElement).value))
    expect(sorts).toEqual(['pertinence', 'nom'])
  })

  test('le catalogue ignore les paramètres de prix de l’URL', async ({ page }) => {
    await page.goto(`${appUrl}/catalogue?prix_min=1000&tri=prix-desc`)

    await expect(page.getByTestId('catalog-sort')).toHaveValue('pertinence')
    await expect(page.getByTestId('catalog-active-filters')).toHaveCount(0)
    await expect(page.getByTestId('catalog-empty')).toHaveCount(0)
  })

  test('l’accueil et la fiche n’affichent aucun prix', async ({ page }) => {
    await page.goto(appUrl)
    await expect(page.getByTestId('home-carousel')).not.toContainText('€')

    await page.goto(`${appUrl}/produit/${PRODUCT.slug}`)
    await expect(page.getByTestId('product-title')).toHaveText(PRODUCT.name)
    await expect(page.getByTestId('product-price')).toHaveCount(0)
    await expect(page.getByTestId('product-similar')).not.toContainText('€')
    const jsonLd = (await page.locator('script[type="application/ld+json"]').allTextContents()).map(
      (text) => JSON.parse(text),
    )
    const product = jsonLd.find((data) => data['@type'] === 'Product')
    expect(product).toBeDefined()
    expect(product).not.toHaveProperty('offers')
  })

  test('aucun lien du panier, /panier en 404, le panier stocké reste intact', async ({ page }) => {
    const stored = JSON.stringify([{ ...PRODUCT, price: 3490, quantity: 2 }])
    await page.addInitScript((value) => localStorage.setItem('panier', value), stored)
    await gotoHydrated(page, `${appUrl}/produit/${PRODUCT.slug}`)

    await expect(page.getByTestId('cart-link')).toHaveCount(0)
    await expect(page.getByTestId('add-to-cart')).toHaveCount(0)
    expect((await page.goto(`${appUrl}/panier`))?.status()).toBe(404)
    expect(await page.evaluate(() => localStorage.getItem('panier'))).toBe(stored)
  })

  test('la fiche propose une demande de renseignement, même en rupture de stock', async ({
    page,
    request,
  }) => {
    await gotoHydrated(page, `${appUrl}/produit/${PRODUCT.slug}`)
    const inquiry = page.getByTestId('product-inquiry')

    await expect(inquiry).toHaveAccessibleName(INQUIRY_NAME)
    await expect(inquiry).toHaveAttribute('href', `/contact?produit=${PRODUCT.slug}`)
    expect((await inquiry.boundingBox())?.height).toBeGreaterThanOrEqual(44)

    await page.goto(`${appUrl}/produit/${OUT_OF_STOCK}`)
    await expect(page.getByTestId('product-inquiry')).toBeVisible()

    // Sans JavaScript : le lien est dans le HTML servi
    const html = await (await request.get(`${appUrl}/produit/${PRODUCT.slug}`)).text()
    expect(html).toContain('data-testid="product-inquiry"')
  })

  test('la demande de renseignement part avec le produit', async ({ page }) => {
    await gotoHydrated(page, `${appUrl}/produit/${PRODUCT.slug}`)
    await page.getByTestId('product-inquiry').click()

    await expect(page).toHaveURL(`${appUrl}/contact?produit=${PRODUCT.slug}`)
    await expect(page.getByTestId('contact-product')).toContainText(PRODUCT.name)

    await fillContactForm(page)
    const request = page.waitForRequest((sent) => sent.method() === 'POST')
    await page.getByTestId('contact-submit').click()

    expect((await request).postData()).toContain(PRODUCT.slug)
    await expect(page.getByTestId('contact-success')).toContainText(
      'Votre demande de renseignement a bien été envoyée.',
    )
    expect(contactBodies.at(-1)).toMatchObject({ product: PRODUCT.slug })
  })

  for (const mode of MODES) {
    for (const path of [`/produit/${PRODUCT.slug}`, `/contact?produit=${PRODUCT.slug}`]) {
      test(`mode ${mode} : ${path} sans violation axe`, async ({ page }) => {
        await useMode(page, mode)
        await gotoHydrated(page, `${appUrl}${path}`)

        await expectNoViolations(page)
      })
    }
  }
})
