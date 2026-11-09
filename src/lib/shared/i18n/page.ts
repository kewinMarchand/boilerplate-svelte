import { page } from '$app/state'

import { samePathInEveryLocale, unlocalizePath } from './locale'

import type { Dictionary } from './dictionaries/dictionary'
import type { LanguageAlternate, LocaleContext } from './locale'

/**
 * Libellés de la page : sections communes posées par le layout racine (`+layout.server.ts`, `dictionary`),
 * sections propres à la page posées par son `load` (`pageDictionary`). À lire pendant le rendu d'un composant
 * (`page` de `$app/state`).
 */
export const useDictionary = (): Dictionary =>
  // Contrat vérifié par les e2e de chaque page dans chaque langue : une page envoie les sections que lisent
  // ses composants, le layout celles de l'en-tête, du pied et de la page d'erreur
  ({ ...page.data.dictionary, ...page.data.pageDictionary }) as Dictionary

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
