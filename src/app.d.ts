import type { SiteIdentity } from '#lib/shared/config'
import type { Dictionary, LanguageAlternate, LocaleContext } from '#lib/shared/i18n'
import type { Seo } from '#lib/shared/seo'

declare global {
  namespace App {
    interface Error {
      message: string
    }
    interface Locals {
      siteIdentity: SiteIdentity
      /** Langue de la page, posée par `handle` depuis l'adresse et les langues de l'identité. */
      locale: LocaleContext
    }
    interface PageData {
      siteIdentity: SiteIdentity
      /** Titre et description administrés des pages fixes, par chemin de route. */
      pageMetas: Partial<Record<string, Seo.Override>>
      locale: LocaleContext
      /** Libellés de la langue de la page, seul dictionnaire envoyé au navigateur. */
      dictionary: Dictionary
      /** Page détaillée : l'élément dans chaque langue où il existe (sélecteur de langue, hreflang). */
      alternates?: LanguageAlternate[] | undefined
    }
  }
}

export {}
