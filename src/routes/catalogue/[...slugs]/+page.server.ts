import { error } from '@sveltejs/kit'

import { dictionarySections } from '#lib/shared/i18n/index.server'

import { CATALOG_DEPENDENCY, loadCatalogPage } from '#lib/modules/catalog/index.server'

import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ params, url, depends, locals }) => {
  depends(CATALOG_DEPENDENCY)
  const page = await loadCatalogPage(
    params.slugs,
    url.searchParams,
    locals.siteIdentity.salesEnabled,
    locals.locale,
  )
  if (page.status === 'not-found') error(404, 'Page introuvable')
  return { ...page, pageDictionary: dictionarySections(locals.locale, ['catalog']) }
}
