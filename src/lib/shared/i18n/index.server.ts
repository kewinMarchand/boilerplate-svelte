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
