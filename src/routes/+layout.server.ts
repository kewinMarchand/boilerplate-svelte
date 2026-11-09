import { dictionarySections } from '#lib/shared/i18n/index.server'

import { getCategoryMenu } from '#lib/modules/catalog/index.server'
import { loadPageMetas } from '#lib/modules/content/index.server'

import type { LayoutServerLoad } from './$types'

/** Sections lues par l'en-tête (lien du panier compris), le pied, la page d'erreur et les composants partagés. */
const LAYOUT_SECTIONS = [
  'language',
  'nav',
  'compliance',
  'ui',
  'layout',
  'a11yMode',
  'colorScheme',
  'errors',
  'cart',
] as const

export const load: LayoutServerLoad = async ({ locals }) => {
  const [categoryMenu, pageMetas] = await Promise.all([getCategoryMenu(), loadPageMetas()])
  return {
    categoryMenu,
    pageMetas,
    siteIdentity: locals.siteIdentity,
    locale: locals.locale,
    dictionary: dictionarySections(locals.locale, LAYOUT_SECTIONS),
  }
}
