import { FALLBACK_IDENTITY } from '#lib/shared/config'

import { findSiteIdentity } from '../infrastructure/siteIdentityRepository'

import type { SiteIdentity } from '../domain/siteIdentity'

/** API en erreur ou injoignable : la configuration du site sert de repli, la page reste servie. */
export const loadSiteIdentity = async (locale?: string): Promise<SiteIdentity> => {
  try {
    return await findSiteIdentity(locale)
  } catch {
    return FALLBACK_IDENTITY
  }
}
