import type { SiteIdentity } from '#lib/shared/config'

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
    }
  }
}

export {}
