import { en } from './dictionaries/en'
import { fr } from './dictionaries/fr'

import type { Dictionary } from './dictionaries/dictionary'
import type { LocaleContext } from './locale'

const DICTIONARIES: Record<string, Dictionary> = { fr, en }

/**
 * Dictionnaire de la langue de la page ; sans fichier de traduction, celui de la langue par défaut (le français à défaut). Module serveur : le
 * navigateur reçoit celui de la page dans les données du layout, aucun dans son JavaScript.
 */
export const dictionaryFor = ({ locale, defaultLocale }: LocaleContext): Dictionary =>
  DICTIONARIES[locale] ?? DICTIONARIES[defaultLocale] ?? fr

/**
 * Sections du dictionnaire de la page qui partent au navigateur : celles que lisent les composants rendus
 * (le layout envoie les sections communes, chaque page les siennes), jamais le dictionnaire entier.
 */
export const dictionarySections = <Section extends keyof Dictionary>(
  context: LocaleContext,
  sections: readonly Section[],
): Pick<Dictionary, Section> => {
  const dictionary = dictionaryFor(context)
  // Object.fromEntries perd le lien entre clé et valeur : chaque entrée vient pourtant de `dictionary`
  return Object.fromEntries(sections.map((section) => [section, dictionary[section]])) as Pick<
    Dictionary,
    Section
  >
}
