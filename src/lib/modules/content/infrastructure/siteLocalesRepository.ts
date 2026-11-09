import { ApiError, createApiClient } from '#lib/shared/api/client'

import { toSiteIdentity } from './http/siteIdentityTranslation'

/**
 * Langues du site, lues par le hook universel `reroute` avant la requête de page, avec son `fetch` : sans
 * `getRequestEvent`, donc hors de `client.server`.
 */
export const findSiteLocales = async (fetch: typeof globalThis.fetch): Promise<string[]> => {
  const { data, response } = await createApiClient(fetch).GET('/api/site-identity')
  if (!data) throw new ApiError(response)
  return toSiteIdentity(data).locales
}
