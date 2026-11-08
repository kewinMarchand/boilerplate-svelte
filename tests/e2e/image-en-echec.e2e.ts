import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

import { MODES } from './routes'
import { gotoHydrated, useMode } from './support'

import type { Page } from '@playwright/test'

const firstCard = (page: Page) => page.getByTestId('catalog-product').first()

/** Image de la première carte : son identifiant de média et la boîte de la carte, chargement normal. */
const loadNormally = async (page: Page) => {
  await gotoHydrated(page, '/catalogue')
  const image = firstCard(page).locator('img')
  await expect
    .poll(() => image.evaluate((element: HTMLImageElement) => element.naturalWidth))
    .toBeGreaterThan(0)
  const src = (await image.getAttribute('src')) ?? ''
  const media = /\/media\/([^/-]+)-/.exec(src)?.[1]
  expect(media).toBeTruthy()
  return { media: media ?? '', box: await firstCard(page).boundingBox() }
}

test.describe('Image en échec', () => {
  test('une image de l’API chargée ne porte pas la marque', async ({ page }) => {
    await loadNormally(page)

    await expect(firstCard(page).locator('picture')).not.toHaveAttribute('data-image-error')
    await expect(firstCard(page).locator('img')).toHaveCSS('opacity', '1')
  })

  for (const mode of MODES) {
    test(`une image de l’API en 404 laisse un fond de remplacement à dimensions gardées (${mode})`, async ({
      page,
    }) => {
      await useMode(page, mode)
      const { media, box } = await loadNormally(page)
      await page.route(`**/media/${media}-*`, (route) => route.fulfill({ status: 404 }))

      await gotoHydrated(page, '/catalogue')

      const picture = firstCard(page).locator('picture')
      await expect(picture).toHaveAttribute('data-image-error', '')
      await expect(picture.locator('img')).toHaveCSS('opacity', '0')
      expect(await firstCard(page).boundingBox()).toEqual(box)
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze()
      expect(results.violations).toEqual([])
    })
  }
})
