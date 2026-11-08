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

/** Habillage du site, administré dans l'API (section 22 de la spec commune). */
export interface SiteIdentity {
  name: string
  tagline: string
  logo: ImageView | null
  defaultColorScheme: ColorScheme
  /** `null` : les jetons de boilerplates-ui restent tels quels. */
  theme: SiteTheme | null
}

/** Repli quand l'API ne répond pas : la configuration du site. */
export const FALLBACK_IDENTITY: SiteIdentity = {
  name: SITE.name,
  tagline: SITE.description,
  logo: null,
  defaultColorScheme: 'auto',
  theme: null,
}
