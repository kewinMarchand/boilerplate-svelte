import { expect, test } from '@playwright/test'

import type { Page } from '@playwright/test'

test.describe('Accueil', () => {
  test('affiche le hero, le carrousel et les articles', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByTestId('home-hero')).toBeVisible()
    await expect(page.getByTestId('home-carousel')).toBeVisible()
    await expect(page.getByTestId('carousel-slide')).toHaveCount(5)
    await expect(page.getByTestId('home-carousel-error')).toHaveCount(0)
    await expect(page.getByTestId('home-blog-card')).toHaveCount(3)
    await expect(page.getByTestId('home-blog-error')).toHaveCount(0)
    await expect(page.getByTestId('home-blog-empty')).toHaveCount(0)
  })

  test('l’image du hero est prioritaire et les articles sont dans le HTML initial', async ({
    request,
  }) => {
    const html = await (await request.get('/')).text()

    expect(html.match(/data-testid="home-blog-card"/g)).toHaveLength(3)
    expect(html).toMatch(/<img[^>]*src="\/images\/hero-1920\.webp"[^>]*fetchpriority="high"/)
    expect(html).not.toMatch(/<img[^>]*src="\/images\/hero-1920\.webp"[^>]*loading="lazy"/)
  })

  test('affiche les illustrations des articles servies par l’API', async ({ page }) => {
    await page.goto('/')
    const image = page.getByTestId('home-blog-card').first().locator('img')
    await image.scrollIntoViewIfNeeded()
    const apiOrigin = new URL(process.env.API_URL || 'http://localhost:8090').origin
    await expect(image).toHaveAttribute('src', new RegExp(`^${apiOrigin}/media/`))
    await expect
      .poll(() => image.evaluate((element: HTMLImageElement) => element.naturalWidth))
      .toBeGreaterThan(0)
  })
})

test.describe('Grille du blog', () => {
  const measureCards = async (page: Page) => {
    await page.goto('/')
    const cards = page.getByTestId('home-blog-card')
    await expect(cards).toHaveCount(3)
    const measure = async (index: number) => {
      const box = await cards.nth(index).boundingBox()
      expect(box).not.toBeNull()
      return box ?? { x: 0, y: 0, width: 0, height: 0 }
    }
    return [await measure(0), await measure(1), await measure(2)] as const
  }

  test('desktop : l’article à la une sur 8 colonnes, les deux autres empilés à droite', async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, 'Largeur pilotée explicitement.')
    await page.setViewportSize({ width: 1280, height: 900 })
    const [featured, second, third] = await measureCards(page)

    expect(featured.width).toBeGreaterThan(second.width * 1.8)
    expect(second.x).toBeCloseTo(third.x, 0)
    expect(second.x).toBeGreaterThan(featured.x + featured.width)
    expect(third.y).toBeGreaterThanOrEqual(second.y + second.height)
  })

  test('tablette : l’article à la une et les deux autres sur la même largeur, côte à côte', async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, 'Largeur pilotée explicitement.')
    await page.setViewportSize({ width: 768, height: 900 })
    const [featured, second, third] = await measureCards(page)

    expect(featured.width).toBeCloseTo(second.width, 0)
    expect(second.width).toBeCloseTo(third.width, 0)
    expect(second.x).toBeGreaterThan(featured.x + featured.width)
    expect(second.x).toBeCloseTo(third.x, 0)
    expect(third.y).toBeGreaterThanOrEqual(second.y + second.height)
  })

  test('mobile : les trois articles sur la même largeur, empilés', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'Viewport de l’appareil mobile.')
    const [featured, second, third] = await measureCards(page)

    expect(featured.width).toBeCloseTo(second.width, 0)
    expect(second.width).toBeCloseTo(third.width, 0)
    expect(featured.x).toBeCloseTo(third.x, 0)
    expect(second.y).toBeGreaterThanOrEqual(featured.y + featured.height)
    expect(third.y).toBeGreaterThanOrEqual(second.y + second.height)
  })

  test('l’image de l’article à la une annonce sa largeur au navigateur', async ({ request }) => {
    const html = await (await request.get('/')).text()
    const cards = html.split('data-testid="home-blog-card"').slice(1)

    expect(cards[0]).toContain('sizes="(min-width: 1024px) 66vw, 100vw"')
    expect(cards[1]).toContain('sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"')
  })
})

test.describe('Accueil, API en erreur (X-Scenario: error)', () => {
  test.use({ extraHTTPHeaders: { 'X-Scenario': 'error' } })

  test('affiche l’erreur du carrousel à la place des diapositives', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByTestId('home-carousel-error')).toBeVisible()
    await expect(page.getByTestId('home-carousel')).toHaveCount(0)
  })
})

test.describe('Accueil, API sans données (X-Scenario: empty)', () => {
  test.use({ extraHTTPHeaders: { 'X-Scenario': 'empty' } })

  test('retire la section du carrousel', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByTestId('home-hero')).toBeVisible()
    await expect(page.getByTestId('home-carousel')).toHaveCount(0)
    await expect(page.getByTestId('home-carousel-error')).toHaveCount(0)
  })
})

test.describe('Carrousel', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('.carousel-viewport')).toHaveAttribute('data-embla-ready', '')
    await page.getByTestId('home-carousel').scrollIntoViewIfNeeded()
  })

  test('Précédent est désactivé au début et Suivant fait avancer', async ({ page }) => {
    const previous = page.getByTestId('carousel-prev')
    const firstDot = page.getByTestId('carousel-dot').first()

    await expect(previous).toBeDisabled()
    await expect(firstDot).toHaveAttribute('aria-current', 'true')

    await page.getByTestId('carousel-next').click()

    await expect(previous).toBeEnabled()
    await expect(firstDot).not.toHaveAttribute('aria-current')
    await expect(page.getByTestId('carousel-dot').nth(1)).toHaveAttribute('aria-current', 'true')
  })

  test('se fait glisser à la souris', async ({ page }) => {
    const viewport = await page.locator('.carousel-viewport').boundingBox()
    expect(viewport).not.toBeNull()
    const y = (viewport?.y ?? 0) + (viewport?.height ?? 0) / 3
    const startX = (viewport?.x ?? 0) + (viewport?.width ?? 0) * 0.8

    await page.mouse.move(startX, y)
    await page.mouse.down()
    await page.mouse.move(startX - 150, y, { steps: 8 })
    await page.mouse.move(startX - 300, y, { steps: 8 })
    await page.mouse.up()

    await expect(page.getByTestId('carousel-prev')).toBeEnabled()
    // Le geste part d'une diapositive cliquable : il fait défiler sans ouvrir la fiche
    await expect(page).toHaveURL('/')
  })

  test('une diapositive ouvre la fiche de son produit', async ({ page }) => {
    const name = (
      (await page.getByTestId('carousel-slide-link').first().textContent()) ?? ''
    ).trim()
    await page.getByTestId('carousel-slide').first().click()

    await expect(page).toHaveURL(/\/produit\/[a-z0-9-]+$/)
    await expect(page.getByTestId('product-title')).toHaveText(name)
  })

  test('les diapositives débordent du conteneur sans faire défiler la page', async ({ page }) => {
    const section = await page.getByTestId('home-carousel').boundingBox()
    const lastSlide = await page.getByTestId('carousel-slide').last().boundingBox()
    expect(section).not.toBeNull()
    expect(lastSlide).not.toBeNull()

    const sectionRight = (section?.x ?? 0) + (section?.width ?? 0)
    expect((lastSlide?.x ?? 0) + (lastSlide?.width ?? 0)).toBeGreaterThan(sectionRight)
    const beyondSection = {
      x: sectionRight + 4,
      y: (lastSlide?.y ?? 0) + (lastSlide?.height ?? 0) / 3,
    }
    const slideVisibleBeyond = await page.evaluate(
      ({ x, y }) =>
        document.elementFromPoint(x, y)?.closest('[data-testid="carousel-slide"]') != null,
      beyondSection,
    )
    expect(slideVisibleBeyond).toBe(true)
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    )
    expect(overflow).toBeLessThanOrEqual(0)
  })
})

test.describe('Carrousel sans JavaScript', () => {
  test.use({ javaScriptEnabled: false })

  test('la piste défile nativement', async ({ page }) => {
    await page.goto('/')
    const viewport = page.locator('.carousel-viewport')

    await expect(viewport).not.toHaveAttribute('data-embla-ready')
    await expect(viewport).toHaveCSS('overflow-x', 'auto')
    await viewport.hover()
    await page.mouse.wheel(600, 0)
    await expect(page.getByTestId('carousel-slide').first()).not.toBeInViewport({ ratio: 0.99 })
  })
})
