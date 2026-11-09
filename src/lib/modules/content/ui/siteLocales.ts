import { FALLBACK_IDENTITY } from '#lib/shared/config'

import { findSiteLocales } from '../infrastructure/siteLocalesRepository'

const LOCALES_TIMEOUT_MS = 2000

/**
 * API en erreur, ou sans réponse en 2 secondes (arrêtée pendant une maintenance) : les langues du repli
 * (le français seul), aucun préfixe de langue n'est reconnu.
 */
export const loadSiteLocales = (fetch: typeof globalThis.fetch): Promise<string[]> =>
  Promise.race([
    findSiteLocales(fetch),
    new Promise<string[]>((resolve) =>
      setTimeout(resolve, LOCALES_TIMEOUT_MS, FALLBACK_IDENTITY.locales),
    ),
  ]).catch(() => FALLBACK_IDENTITY.locales)
