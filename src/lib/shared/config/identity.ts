import { SITE } from './site'

import type { ColorScheme } from '#lib/shared/ui/color-scheme'
import type { ImageView } from '#lib/shared/ui/kit'

export const THEME_COLOR_KEYS = [
  'primary',
  'primary-dark',
  'on-primary',
  'primary-surface-subtle',
  'primary-surface',
  'primary-surface-strong',
  'secondary',
  'secondary-dark',
  'on-secondary',
  'secondary-surface-subtle',
  'secondary-surface',
  'secondary-surface-strong',
] as const

export type ThemeColors = Record<(typeof THEME_COLOR_KEYS)[number], string>

/** Couleurs de marque saisies dans l'admin, calculées par l'API pour le clair et le sombre. */
export interface SiteTheme {
  light: ThemeColors
  dark: ThemeColors
}

/** Favicons en PNG tirés de l'icône saisie dans l'admin, adresses absolues. */
export interface SiteIcon {
  png32: string
  png180: string
  png192: string
  png512: string
}

/** Habillage du site, administré dans l'API (sections 22 et 26 de la spec commune). */
export interface SiteIdentity {
  name: string
  tagline: string
  logo: ImageView | null
  /** `null` : `og-image.jpg` du site reste l'image de partage par défaut. */
  shareImage: ImageView | null
  /** `null` : les favicons du site restent. */
  icon: SiteIcon | null
  defaultColorScheme: ColorScheme
  /** `null` : les jetons de boilerplates-ui restent tels quels. */
  theme: SiteTheme | null
  /** `false` : ni prix ni panier, chaque produit propose une demande de renseignement (section 27). */
  salesEnabled: boolean
  /** Langues du site, la première est la langue par défaut (section 29). */
  locales: string[]
}

/** Repli quand l'API ne répond pas : la configuration du site. */
export const FALLBACK_IDENTITY: SiteIdentity = {
  name: SITE.name,
  tagline: SITE.description,
  logo: null,
  shareImage: null,
  icon: null,
  defaultColorScheme: 'auto',
  theme: null,
  salesEnabled: true,
  locales: ['fr'],
}
