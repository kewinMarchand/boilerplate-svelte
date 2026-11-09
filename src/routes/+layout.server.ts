import { dictionaryFor } from '#lib/shared/i18n/index.server'

import { getCategoryMenu } from '#lib/modules/catalog/index.server'
import { loadPageMetas } from '#lib/modules/content/index.server'

import type { LayoutServerLoad } from './$types'

export const load: LayoutServerLoad = async ({ locals }) => {
  const [categoryMenu, pageMetas] = await Promise.all([getCategoryMenu(), loadPageMetas()])
  return {
    categoryMenu,
    pageMetas,
    siteIdentity: locals.siteIdentity,
    locale: locals.locale,
    dictionary: dictionaryFor(locals.locale),
  }
}
