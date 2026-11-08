import { expect, test } from '@playwright/test'

const ARTICLE = '/blog/un-carrousel-accessible-sans-dependance'

test.describe('Fiche article', () => {
  test('s’ouvre depuis une carte de l’accueil', async ({ page }) => {
    await page.goto('/')

    const card = page.getByTestId('home-blog-card').first()
    const title = (await card.locator('h3').textContent()) ?? ''
    await card.getByRole('link').click()

    await expect(page).toHaveURL(/\/blog\/[a-z0-9-]+$/)
    await expect(page.getByTestId('article-title')).toHaveText(title)
  })

  test('affiche le titre, la date, l’image de l’API et le texte rendu côté serveur', async ({
    page,
    request,
  }) => {
    const html = await (await request.get(ARTICLE)).text()
    expect(html).toContain('<h2>Partir du défilement natif</h2>')

    await page.goto(ARTICLE)
    await expect(page.getByTestId('article-title')).toHaveText(
      'Un carrousel accessible sans dépendance',
    )
    await expect(page.getByTestId('article-page').locator('time')).toHaveAttribute(
      'datetime',
      '2026-09-22',
    )
    await expect(page.getByTestId('article-body').locator('li')).toHaveCount(3)
    const image = page.getByTestId('article-page').locator('img').first()
    await expect(image).toHaveAttribute('fetchpriority', 'high')
    await expect
      .poll(() => image.evaluate((element: HTMLImageElement) => element.naturalWidth))
      .toBeGreaterThan(0)
  })

  test('le fil d’Ariane mène à la liste des articles', async ({ page }) => {
    await page.goto(ARTICLE)
    const breadcrumb = page.getByTestId('layout-breadcrumb')

    await expect(breadcrumb.getByRole('listitem')).toHaveText([
      'Accueil',
      'Blog',
      'Un carrousel accessible sans dépendance',
    ])
    await breadcrumb.getByRole('link', { name: 'Blog' }).click()

    await expect(page).toHaveURL(/\/blog$/)
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Blog')
  })

  test('le lien « Tous les articles » mène à la liste', async ({ page }) => {
    await page.goto(ARTICLE)
    await page.getByTestId('article-blog-link').click()

    await expect(page).toHaveURL(/\/blog$/)
    await expect(page.getByTestId('blog-list')).toBeVisible()
  })

  test('expose ses données structurées d’article', async ({ page }) => {
    await page.goto(ARTICLE)

    expect(await page.locator('meta[property="og:type"]').getAttribute('content')).toBe('article')
    const types = (await page.locator('script[type="application/ld+json"]').allTextContents()).map(
      (text) => (JSON.parse(text) as { '@type': string })['@type'],
    )
    expect(types).toEqual(expect.arrayContaining(['BlogPosting', 'BreadcrumbList']))
  })

  test('propose la version audio, avec sa durée et son intervenant, sans autolecture', async ({
    page,
  }) => {
    await page.goto(ARTICLE)
    const audio = page.getByTestId('article-audio')

    await expect(audio).toHaveAttribute('controls', '')
    await expect(audio).toHaveAttribute('preload', 'none')
    await expect(audio).not.toHaveAttribute('autoplay')
    await expect(audio.locator('source')).toHaveAttribute('src', /^https?:\/\/.+\.mp3$/)
    const figure = page.locator('figure', { has: audio })
    await expect(figure).toContainText('4 s')
    await expect(figure).toContainText('Présenté par Hina Teriierooiterai')
    expect(await audio.evaluate((element: HTMLAudioElement) => element.paused)).toBe(true)
  })

  test('affiche la rubrique et le format sous le titre', async ({ page }) => {
    await page.goto('/blog/pourquoi-rendre-le-contenu-cote-serveur')
    const article = page.getByTestId('article-page')

    await expect(article.getByTestId('article-section')).toHaveText('Conseils')
    await expect(article.getByTestId('article-format')).toHaveText('Guide')
    await expect(page.getByTestId('article-audio')).toHaveCount(0)
  })

  test('sans format ni audio, n’affiche que la rubrique', async ({ page }) => {
    await page.goto('/blog/le-mode-accessibilite-renforcee')
    const article = page.getByTestId('article-page')

    await expect(article.getByTestId('article-section')).toHaveText('Actualités')
    await expect(article.getByTestId('article-format')).toHaveCount(0)
    await expect(page.getByTestId('article-audio')).toHaveCount(0)
  })

  test('répond 404 pour un article inconnu', async ({ page }) => {
    const response = await page.goto('/blog/article-inconnu')

    expect(response?.status()).toBe(404)
  })
})
