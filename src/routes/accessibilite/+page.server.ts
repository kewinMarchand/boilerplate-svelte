import { error } from '@sveltejs/kit'

import { dictionarySections } from '#lib/shared/i18n/index.server'

import { loadLegalPage } from '#lib/modules/content/index.server'

import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ locals }) => {
  const legalPage = await loadLegalPage('accessibilite')
  if (legalPage.status === 'not-found') error(404, 'Page introuvable')
  return { legalPage, pageDictionary: dictionarySections(locals.locale, ['legal']) }
}
