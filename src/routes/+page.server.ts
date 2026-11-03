import { loadLatestArticles } from '#lib/modules/blog/index.server'
import { loadFeaturedSlides } from '#lib/modules/content/index.server'

import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async (event) => {
  const [articles, slides] = await Promise.all([loadLatestArticles(event), loadFeaturedSlides()])
  return { ...articles, ...slides }
}
