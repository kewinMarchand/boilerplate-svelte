import { error } from '@sveltejs/kit'

import { loadArticle } from '#lib/modules/blog/index.server'

import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ params }) => {
  const article = await loadArticle(params.slug)
  if (article.status === 'not-found') error(404, 'Page introuvable')
  return { article }
}
