import { browser } from '$app/env'

import { localeContext, localePrefix, unlocalizePath } from '#lib/shared/i18n'

import type { Reroute } from '@sveltejs/kit/hooks'

/**
 * Pages d'une langue autre que la langue par défaut sous son préfixe (`/en/produit/x` → route `/produit/x`).
 * Un préfixe qui ne désigne pas une telle langue reste dans l'adresse : aucune route, 404 (section 29 bis).
 * Serveur : langues lues dans l'API, seulement pour une adresse qui commence par un préfixe possible.
 * Navigateur : le préfixe du document en cours, que le serveur a déjà validé ; changer de langue recharge la page.
 */
export const reroute: Reroute = async ({ url, fetch }) => {
  const prefix = localePrefix(url.pathname)
  if (!prefix) return undefined
  if (browser) {
    const served =
      prefix === document.documentElement.lang && localePrefix(location.pathname) === prefix
    return served ? url.pathname.slice(prefix.length + 1) || '/' : undefined
  }
  // Import dynamique dans la branche serveur : le client API reste hors du JavaScript initial du navigateur
  const { loadSiteLocales } = await import('#lib/modules/content/index.locales')
  const locales = await loadSiteLocales(fetch)
  return unlocalizePath(url.pathname, localeContext(url.pathname, locales))
}
