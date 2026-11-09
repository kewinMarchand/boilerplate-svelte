import type { AppPath } from '#lib/shared/routing'
import type { ImageView } from '#lib/shared/ui/kit'

export declare namespace Article {
  type Id = string

  /** Rubrique ou format, listes administrées dans l'API. */
  interface Term {
    slug: string
    name: string
  }

  interface Audio {
    src: string
    type: string
    durationSeconds: number
  }

  interface Entity {
    id: Id
    slug: string
    title: string
    excerpt: string
    image: ImageView | null
    publishedAt: string
    section: Term | null
  }

  type Blog = { status: 'success'; articles: Entity[] } | { status: 'error'; message: string }

  /** Page `/blog` : les articles, filtrés ou non par rubrique, et les rubriques du filtre. */
  interface BlogPage {
    blog: Blog
    sections: Term[]
    activeSection: string | undefined
  }

  type Status = 'pending' | 'error' | 'success'

  /** Fiche : l'article et son texte en HTML, converti par l'API depuis le Markdown saisi dans l'admin. */
  interface Detail extends Entity {
    html: string
    format: Term | null
    audio: Audio | null
    /** Intervenant de l'audio, vide s'il n'y en a pas. */
    speaker: string
    /** Titre et description pour les moteurs de recherche, vides si l'admin n'en a pas saisi. */
    metaTitle: string
    metaDescription: string
    /** La fiche dans chaque langue où l'article existe ; vide sur un site monolingue. */
    alternates: Alternate[]
  }

  /** Chemin d'un élément dans une langue, sans préfixe de langue (sélecteur, hreflang, sitemap). */
  interface Alternate {
    locale: string
    path: AppPath
  }

  type Load =
    | { status: 'success'; article: Detail }
    | { status: 'not-found' }
    | { status: 'error'; message: string }

  /** Ce qu'affiche la fiche : l'article, ou le message d'erreur de l'API. */
  type Page = Exclude<Load, { status: 'not-found' }>
}

export const articleHref = (slug: string): AppPath => `/blog/${slug}`

/** Paramètre d'URL du filtre par rubrique de `/blog`. */
export const SECTION_PARAM = 'rubrique'

export const blogSectionHref = (slug?: string): AppPath =>
  slug ? `/blog?${SECTION_PARAM}=${encodeURIComponent(slug)}` : '/blog'
