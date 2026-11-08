import { error } from '@sveltejs/kit'

import { CATALOG_DEPENDENCY, loadCatalogPage } from '#lib/modules/catalog/index.server'

import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ params, url, depends, locals }) => {
  depends(CATALOG_DEPENDENCY)
  const page = await loadCatalogPage(
    params.slugs,
    url.searchParams,
    locals.siteIdentity.salesEnabled,
  )
  if (page.status === 'not-found') error(404, 'Page introuvable')
  return page
}
