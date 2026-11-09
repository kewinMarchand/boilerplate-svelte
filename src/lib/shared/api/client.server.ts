import { getRequestEvent } from '$app/server'

import { createApiClient } from './client'

/** Client de la requête en cours : `fetch` de SvelteKit, `X-Scenario` reçu relayé à l'API, `locale` telle quelle. */
export const requestApiClient = (locale?: string) => {
  const { fetch, request } = getRequestEvent()
  return createApiClient(fetch, request.headers.get('X-Scenario'), locale)
}

/**
 * Client de la requête en cours, avec la langue de la page (`locals.locale`, posée par `handle`) sur chaque
 * lecture, ou `locale` (sitemap, qui parcourt chaque langue). Site monolingue : appels inchangés, sans
 * paramètre de langue (section 29 bis).
 */
export const serverApiClient = ({ locale }: { locale?: string | undefined } = {}) => {
  const { locale: pageLocale, locales } = getRequestEvent().locals.locale
  return requestApiClient(locales.length > 1 ? (locale ?? pageLocale) : undefined)
}
