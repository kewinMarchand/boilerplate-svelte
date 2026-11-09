import { ApiError } from '#lib/shared/api/client'
import { requestApiClient } from '#lib/shared/api/client.server'

import { toSiteIdentity } from './http/siteIdentityTranslation'

import type { SiteIdentity } from '../domain/siteIdentity'

/**
 * Lue avant de connaître les langues du site : `locale` est la langue demandée par l'adresse (`/en/...`),
 * que l'API ignore si elle ne l'a pas activée ; aucune sans préfixe (langue par défaut).
 */
export const findSiteIdentity = async (locale: string | undefined): Promise<SiteIdentity> => {
  const { data, response } = await requestApiClient(locale).GET('/api/site-identity')
  if (!data) throw new ApiError(response)
  return toSiteIdentity(data)
}
