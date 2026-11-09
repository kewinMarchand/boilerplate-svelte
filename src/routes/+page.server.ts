import { dictionarySections } from '#lib/shared/i18n/index.server'

import { loadLatestArticles } from '#lib/modules/blog/index.server'
import { loadFeaturedProducts } from '#lib/modules/catalog/index.server'

import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async (event) => {
  const [articles, featured] = await Promise.all([
    loadLatestArticles(event),
    loadFeaturedProducts(),
  ])
  return {
    ...articles,
    ...featured,
    pageDictionary: dictionarySections(event.locals.locale, [
      'home',
      'catalog',
      'carousel',
      'blog',
    ]),
  }
}
