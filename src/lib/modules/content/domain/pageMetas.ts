import type { Seo } from '#lib/shared/seo'

/** Titre et description administrés des pages fixes, par chemin de route. */
export type PageMetas = Partial<Record<string, Seo.Override>>
