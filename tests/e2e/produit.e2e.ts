import { expect, test } from '@playwright/test'

const PRODUCT = '/produit/monstera-deliciosa'

test.describe('Fiche produit', () => {
  test('s’ouvre depuis une carte du catalogue', async ({ page }) => {
    await page.goto('/catalogue')

    const card = page.getByTestId('catalog-product').first()
    const name = (await card.locator('h2').textContent()) ?? ''
    await card.getByTestId('catalog-product-link').click()

    await expect(page).toHaveURL(/\/produit\/[a-z0-9-]+$/)
    await expect(page.getByTestId('product-title')).toHaveText(name)
  })

  test('affiche le nom, le prix, la description, les caractéristiques, l’image de l’API et le chemin de sa catégorie', async ({
    page,
  }) => {
    await page.goto(PRODUCT)

    await expect(page.getByTestId('product-title')).toHaveText('Monstera deliciosa')
    await expect(page.getByTestId('product-price')).toHaveText(/34,90\s€/)
    const description = page.getByTestId('product-description').locator('p')
    await expect(description).toHaveCount(2)
    await expect(description.first()).toContainText('Grandes feuilles vert profond')
    await expect(page.getByTestId('product-page').locator('dd').first()).toHaveText('Mi-ombre')
    const image = page.getByTestId('product-page').locator('img').first()
    await expect(image).toHaveAttribute('fetchpriority', 'high')
    await expect
      .poll(() => image.evaluate((element: HTMLImageElement) => element.naturalWidth))
      .toBeGreaterThan(0)
    const breadcrumb = page.getByTestId('layout-breadcrumb')
    await expect(breadcrumb).toContainText('Feuillages')
    await expect(breadcrumb.getByRole('link', { name: 'Monstera', exact: true })).toHaveAttribute(
      'href',
      '/catalogue/plantes-interieur/feuillages/monstera',
    )
  })

  test('liste ses attributs avec leur unité', async ({ page }) => {
    await page.goto(PRODUCT)

    const attributes = page.getByTestId('product-attributes')
    await expect(attributes.locator('dt')).toHaveText(['Feuillage', 'Hauteur adulte'])
    await expect(attributes.locator('dd')).toHaveText(['Persistant', '300\u00a0cm'])
  })

  test('n’affiche pas de liste d’attributs pour un produit qui n’en a pas', async ({ page }) => {
    await page.goto('/produit/monstera-thai-constellation')

    await expect(page.getByTestId('product-title')).toBeVisible()
    await expect(page.getByTestId('product-attributes')).toHaveCount(0)
  })

  test('affiche une galerie : vignettes nommées, la première affichée', async ({ page }) => {
    await page.goto('/produit/strelitzia-reginae')

    const gallery = page.getByTestId('product-gallery')
    const thumbs = gallery.getByTestId('product-gallery-thumb')
    await expect(thumbs).toHaveCount(4)
    await expect(thumbs.first()).toHaveAccessibleName("Voir l'image 1 sur 4")
    await expect(thumbs.first()).toHaveAttribute('aria-current', 'true')
    await expect(gallery.locator('img').first()).toHaveAttribute('fetchpriority', 'high')
    await expect(thumbs.first().locator('img')).toHaveAttribute('loading', 'lazy')
  })

  test('change l’image affichée au clic sur une vignette', async ({ page }) => {
    await page.goto(PRODUCT)
    const gallery = page.getByTestId('product-gallery')
    const displayed = gallery.locator('img').first()
    const thumbs = gallery.getByRole('button')
    const before = await displayed.getAttribute('src')

    await thumbs.nth(2).click()

    await expect(thumbs.nth(2)).toHaveAttribute('aria-current', 'true')
    await expect(thumbs.first()).not.toHaveAttribute('aria-current')
    await expect(displayed).not.toHaveAttribute('src', before ?? '')
    await expect(displayed).toHaveAttribute(
      'src',
      (await thumbs.nth(2).locator('img').getAttribute('src')) ?? '',
    )
  })

  test('passe d’une vignette à l’autre avec les flèches du clavier', async ({ page }) => {
    await page.goto(PRODUCT)
    const thumbs = page.getByTestId('product-gallery').getByRole('button')

    await thumbs.first().focus()
    await page.keyboard.press('ArrowRight')
    await expect(thumbs.nth(1)).toBeFocused()
    await expect(thumbs.nth(1)).toHaveAttribute('aria-current', 'true')

    await page.keyboard.press('ArrowLeft')
    await page.keyboard.press('ArrowLeft')
    await expect(thumbs.nth(2)).toBeFocused()
    await expect(thumbs.nth(2)).toHaveAttribute('aria-current', 'true')
  })

  test('n’a pas de galerie sans images supplémentaires', async ({ page }) => {
    await page.goto('/produit/monstera-thai-constellation')

    await expect(page.getByTestId('product-title')).toBeVisible()
    await expect(page.getByTestId('product-gallery')).toHaveCount(0)
    await expect(page.getByTestId('product-page').locator('img').first()).toHaveAttribute(
      'fetchpriority',
      'high',
    )
  })

  test('expose ses données structurées de produit', async ({ page }) => {
    await page.goto(PRODUCT)

    const data = (await page.locator('script[type="application/ld+json"]').allTextContents()).map(
      (text) =>
        JSON.parse(text) as { '@type': string; description?: string; offers?: { price: string } },
    )
    expect(data.map((item) => item['@type'])).toEqual(
      expect.arrayContaining(['Product', 'BreadcrumbList']),
    )
    const product = data.find((item) => item['@type'] === 'Product')
    expect(product?.offers?.price).toBe('34.90')
    expect(product?.description).toMatch(/^Grandes feuilles vert profond.+aide à grimper\.$/)
  })

  test('propose les autres produits de sa catégorie, sans lui-même', async ({ page }) => {
    await page.goto(PRODUCT)

    const similar = page.getByTestId('product-similar')
    await expect(similar.getByRole('heading', { level: 2 })).toHaveText('Produits similaires')
    const links = similar.getByTestId('carousel-slide-link')
    await expect(links).toHaveCount(2)
    await expect(links).toHaveText(['Monstera adansonii', 'Monstera Thai Constellation'])
    await expect(similar).not.toContainText('Monstera deliciosa')
    const name = ((await links.first().textContent()) ?? '').trim()
    await links.first().click()

    await expect(page).toHaveURL(/\/produit\/monstera-/)
    await expect(page.getByTestId('product-title')).toHaveText(name)
  })

  test('répond 404 pour un produit inconnu', async ({ page }) => {
    const response = await page.goto('/produit/produit-inconnu')

    expect(response?.status()).toBe(404)
  })
})

test.describe('Fiche produit sans JavaScript', () => {
  test.use({ javaScriptEnabled: false })

  test('les vignettes de la galerie sont des liens vers l’image en grand', async ({ page }) => {
    await page.goto(PRODUCT)
    const thumbs = page.getByTestId('product-gallery-thumb')

    await expect(thumbs).toHaveCount(3)
    await expect(page.getByTestId('product-gallery').getByRole('button')).toHaveCount(0)
    for (const thumb of await thumbs.all()) {
      await expect(thumb).toHaveAttribute('href', /^https?:\/\/.+\.webp$/)
    }
  })
})
