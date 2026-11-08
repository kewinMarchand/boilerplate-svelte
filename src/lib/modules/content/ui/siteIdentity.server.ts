import { FALLBACK_IDENTITY } from '#lib/shared/config'

import { findSiteIdentity } from '../infrastructure/siteIdentityRepository'

import type { SiteIdentity } from '../domain/siteIdentity'

/** API en erreur ou injoignable : la configuration du site sert de repli, la page reste servie. */
export const loadSiteIdentity = async (): Promise<SiteIdentity> => {
  try {
    return await findSiteIdentity()
  } catch {
    return FALLBACK_IDENTITY
  }
}
