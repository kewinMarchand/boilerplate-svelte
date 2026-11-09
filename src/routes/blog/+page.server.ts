import { dictionarySections } from '#lib/shared/i18n/index.server'

import { loadArticles } from '#lib/modules/blog/index.server'

import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async (event) => ({
  ...(await loadArticles(event)),
  pageDictionary: dictionarySections(event.locals.locale, ['blog']),
})
