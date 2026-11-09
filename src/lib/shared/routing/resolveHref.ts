import { resolve } from '$app/paths'

import { localizePath, useLocale } from '#lib/shared/i18n'

import type { ResolvedPathname } from '$app/types'

export type AppPath = `/${string}`

// Les chemins viennent de la config ou des données : `resolve` ne peut pas les typer statiquement.
const resolvePathname = resolve as (pathname: string) => ResolvedPathname

/**
 * Seul point qui construit un lien interne : chemin sans préfixe de langue (`/catalogue`), préfixé par la
 * langue de la page, ou par `locale` (sélecteur de langue), sauf pour la langue par défaut (`/en/catalogue`).
 * À appeler pendant le rendu ou dans un gestionnaire d'événement.
 */
export const resolveHref = (path: AppPath, locale?: string): ResolvedPathname => {
  const context = useLocale()
  return resolvePathname(
    localizePath(path, locale ?? context.locale, context.defaultLocale).slice(1),
  )
}
