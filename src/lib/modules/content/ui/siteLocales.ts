import { FALLBACK_IDENTITY } from '#lib/shared/config'

import { findSiteLocales } from '../infrastructure/siteLocalesRepository'

/** API en erreur : les langues du repli (le français seul), aucun préfixe de langue n'est reconnu. */
export const loadSiteLocales = (fetch: typeof globalThis.fetch): Promise<string[]> =>
  findSiteLocales(fetch).catch(() => FALLBACK_IDENTITY.locales)
