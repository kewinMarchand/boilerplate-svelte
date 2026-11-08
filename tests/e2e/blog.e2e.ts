import { expect, test } from '@playwright/test'

test.describe('Liste des articles', () => {
  test('affiche les articles de l’API, du plus récent au plus ancien, rendus côté serveur', async ({
    page,
    request,
  }) => {
    const html = await (await request.get('/blog')).text()
    expect(html.match(/data-testid="blog-card"/g)).toHaveLength(3)

    await page.goto('/blog')

    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Blog')
    await expect(page.getByTestId('layout-breadcrumb').getByRole('listitem')).toHaveText([
      'Accueil',
      'Blog',
    ])
    const cards = page.getByTestId('blog-list').getByTestId('blog-card')
    await expect(cards).toHaveCount(3)
    await expect(cards.first().getByRole('heading', { level: 2 })).toHaveText(
      'Le mode accessibilité renforcée',
    )
    await expect(cards.first().locator('time')).toHaveAttribute('datetime', '2026-10-01')
    await expect(page.getByTestId('blog-empty')).toHaveCount(0)
    await expect(page.getByTestId('blog-error')).toHaveCount(0)
  })

  test('les cartes portent leur rubrique en sur-titre, sur la liste et sur l’accueil', async ({
    page,
  }) => {
    await page.goto('/blog')
    await expect(page.getByTestId('blog-card').getByTestId('article-section')).toHaveText([
      'Actualités',
      'Conseils',
      'Conseils',
    ])

    await page.goto('/')
    await expect(
      page.getByTestId('home-blog-card').first().getByTestId('article-section'),
    ).toHaveText('Actualités')
  })

  test('filtre les articles par rubrique, état dans l’URL', async ({ page }) => {
    await page.goto('/blog')
    const nav = page.getByRole('navigation', { name: 'Rubriques' })
    const links = nav.getByTestId('blog-section-link')

    await expect(links).toHaveText(['Toutes', 'Conseils', 'Actualités'])
    await expect(links.first()).toHaveAttribute('aria-current', 'page')

    await links.nth(1).click()

    await expect(page).toHaveURL(/\/blog\?rubrique=conseils$/)
    await expect(page.getByTestId('blog-card')).toHaveCount(2)
    await expect(links.nth(1)).toHaveAttribute('aria-current', 'page')
    await expect(links.first()).not.toHaveAttribute('aria-current')

    await links.first().click()
    await expect(page).toHaveURL(/\/blog$/)
    await expect(page.getByTestId('blog-card')).toHaveCount(3)
  })

  test('une rubrique inconnue donne la liste vide', async ({ page }) => {
    await page.goto('/blog?rubrique=inconnue')

    await expect(page.getByTestId('blog-empty')).toBeVisible()
    await expect(page.getByTestId('blog-section-link')).toHaveCount(3)
  })

  test('une carte ouvre sa fiche', async ({ page }) => {
    await page.goto('/blog')

    const card = page.getByTestId('blog-card').nth(1)
    const title = (await card.getByRole('heading', { level: 2 }).textContent())?.trim() ?? ''
    await card.getByRole('link').click()

    await expect(page).toHaveURL(/\/blog\/[a-z0-9-]+$/)
    await expect(page.getByTestId('article-title')).toHaveText(title)
  })

  test('expose les données structurées Blog et BreadcrumbList', async ({ page }) => {
    await page.goto('/blog')

    const data = (await page.locator('script[type="application/ld+json"]').allTextContents()).map(
      (text) => JSON.parse(text) as { '@type': string; blogPost?: unknown[] },
    )
    expect(data.map((item) => item['@type'])).toEqual(
      expect.arrayContaining(['Blog', 'BreadcrumbList']),
    )
    expect(data.find((item) => item['@type'] === 'Blog')?.blogPost).toHaveLength(3)
  })
})

test.describe('Liste des articles, API sans données (X-Scenario: empty)', () => {
  test.use({ extraHTTPHeaders: { 'X-Scenario': 'empty' } })

  test('affiche un message amical', async ({ page }) => {
    await page.goto('/blog')

    await expect(page.getByTestId('blog-empty')).toBeVisible()
    await expect(page.getByTestId('blog-list')).toHaveCount(0)
    await expect(page.getByTestId('blog-error')).toHaveCount(0)
  })

  test('n’affiche pas de filtre sans rubrique', async ({ page }) => {
    await page.goto('/blog')

    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Blog')
    await expect(page.getByRole('navigation', { name: 'Rubriques' })).toHaveCount(0)
  })
})

test.describe('Liste des articles, API en erreur (X-Scenario: error)', () => {
  test.use({ extraHTTPHeaders: { 'X-Scenario': 'error' } })

  test('affiche le message d’erreur et un bouton de relance', async ({ page }) => {
    await page.goto('/blog')

    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Blog')
    await expect(page.getByTestId('blog-error')).toBeVisible()
    await expect(page.getByTestId('blog-retry')).toBeVisible()
    await expect(page.getByTestId('blog-list')).toHaveCount(0)
  })
})
