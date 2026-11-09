/**
 * Entrée légère des langues du site, pour le hook universel `reroute` : l'index public, importé par les vues,
 * ferait entrer le client API dans leur JavaScript.
 */
export { loadSiteLocales } from './ui/siteLocales'
