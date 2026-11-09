import { page } from '$app/state'

import { samePathInEveryLocale, unlocalizePath } from './locale'

import type { Dictionary } from './dictionaries/dictionary'
import type { LanguageAlternate, LocaleContext } from './locale'

/**
 * Langue et libellés de la page, posés par le layout racine (`+layout.server.ts`) : le navigateur reçoit le
 * dictionnaire de la page dans ses données. À lire pendant le rendu d'un composant (`page` de `$app/state`).
 */
export const useDictionary = (): Dictionary => page.data.dictionary

export const useLocale = (): LocaleContext => page.data.locale

/** Chemin de la page sans préfixe de langue (`/en/catalogue` → `/catalogue`) : menu actif, fil d'Ariane, canonique. */
export const usePagePath = (): LanguageAlternate['path'] =>
  `/${unlocalizePath(page.url.pathname, page.data.locale).replace(/^\/+/, '')}`

/**
 * La page dans chaque langue : `alternates` des données d'une page détaillée (produit, article, catégorie),
 * sinon le même chemin partout (pages fixes) ; aucune sur une page d'erreur (le sélecteur mène aux accueils).
 */
export const usePageAlternates = (): LanguageAlternate[] => {
  if (page.error) return []
  return page.data.alternates ?? samePathInEveryLocale(page.data.locale, usePagePath())
}
