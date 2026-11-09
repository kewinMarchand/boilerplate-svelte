import type { LanguageAlternate, LocaleContext } from '#lib/shared/i18n'
import type { AppPath } from '#lib/shared/routing'

export declare namespace Seo {
  type JsonLd = Record<string, unknown>

  interface BreadcrumbItem {
    label: string
    path: AppPath
  }

  interface Image {
    path: string
    width: number
    height: number
    alt: string
  }

  /** Titre et description administrés (page fixe, produit, article) : vides, la page garde les siens. */
  interface Override {
    title: string
    description: string
  }

  interface Input {
    title?: string | undefined
    description: string
    metaTitle?: string | undefined
    metaDescription?: string | undefined
    path: string
    canonicalPath?: string | undefined
    noindex?: boolean | undefined
    image?: Image | undefined
    breadcrumb?: BreadcrumbItem[] | undefined
    jsonLd?: JsonLd[] | undefined
    prevPath?: string | undefined
    nextPath?: string | undefined
    /** Page d'article : `og:type` article et date de publication (AAAA-MM-JJ). */
    publishedTime?: string | undefined
  }

  /** Langue de la page et la page dans chaque langue (chemins sans préfixe). */
  interface Languages {
    locale: LocaleContext
    alternates: LanguageAlternate[]
  }

  interface Meta {
    title: string
    description: string
    canonical: string
    robots: string
    siteName: string
    locale: string
    /** `og:locale:alternate`, vide sur un site monolingue. */
    alternateLocales: string[]
    /** `<link rel="alternate" hreflang>`, `x-default` compris ; vide sur un site monolingue. */
    hreflang: { hreflang: string; href: string }[]
    ogTitle: string
    image: Image & { url: string }
    jsonLd: JsonLd[]
    prev: string | undefined
    next: string | undefined
    ogType: 'website' | 'article'
    publishedTime: string | undefined
  }
}
