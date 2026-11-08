import type { SiteIdentity } from '#lib/shared/config'
import type { Seo } from '#lib/shared/seo'

declare global {
  namespace App {
    interface Error {
      message: string
    }
    interface Locals {
      siteIdentity: SiteIdentity
    }
    interface PageData {
      siteIdentity: SiteIdentity
      /** Titre et description administrés des pages fixes, par chemin de route. */
      pageMetas: Partial<Record<string, Seo.Override>>
    }
  }
}

export {}
