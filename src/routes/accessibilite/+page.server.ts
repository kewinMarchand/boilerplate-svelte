import { error } from '@sveltejs/kit'

import { loadLegalPage } from '#lib/modules/content/index.server'

import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async () => {
  const legalPage = await loadLegalPage('accessibilite')
  if (legalPage.status === 'not-found') error(404, 'Page introuvable')
  return { legalPage }
}
