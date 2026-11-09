import { error } from '@sveltejs/kit'

import { dictionarySections } from '#lib/shared/i18n/index.server'

import { loadArticle } from '#lib/modules/blog/index.server'

import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ params, locals }) => {
  const article = await loadArticle(params.slug)
  if (article.status === 'not-found') error(404, 'Page introuvable')
  return {
    article,
    alternates: article.status === 'success' ? article.article.alternates : undefined,
    pageDictionary: dictionarySections(locals.locale, ['blog']),
  }
}
