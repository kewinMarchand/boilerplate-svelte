import { MAINTENANCE } from '$app/env/private'

import { FALLBACK_LOCALE, localeContext, localePrefix } from '#lib/shared/i18n'
import {
  initServerErrorReporting,
  reportServerError,
  SCENARIO_HEADER,
  shouldReportError,
} from '#lib/shared/observability/index.server'
import { announceStartup, buildSiteCsp, CSP_HEADER } from '#lib/shared/security/index.server'
import { buildIconLinks } from '#lib/shared/seo/icons'
import { buildThemeCss } from '#lib/shared/theme/themeStyle'
import { A11Y_MODE_SCRIPT } from '#lib/shared/ui/a11y-mode'
import { COLOR_SCHEME_SCRIPT } from '#lib/shared/ui/color-scheme'

import { loadSiteIdentity } from '#lib/modules/content/index.server'

import { MAINTENANCE_RETRY_AFTER_SECONDS, maintenancePage } from '#lib/views/errors/index.server'

import type { Handle, HandleServerError, ServerInit } from '@sveltejs/kit/hooks'
import type { LocaleContext } from '#lib/shared/i18n'

export const init: ServerInit = () => {
  announceStartup()
  return initServerErrorReporting()
}

// Mode renforcé et thème posés avant le premier rendu, dans une seule balise (sections 4 et 20 de la spec commune).
const BOOT_SCRIPT = `<script>${A11Y_MODE_SCRIPT}${COLOR_SCHEME_SCRIPT}</script>`

/**
 * Préfixe de langue sous lequel la page est servie, lu par `reroute` dans le navigateur : sans lui, une 404
 * sous `/fr/...` (langue par défaut) serait prise à l'hydratation pour la route sans préfixe. Absent dans la
 * langue par défaut, donc sur tout site monolingue.
 */
const localePrefixAttribute = ({ locale, defaultLocale }: LocaleContext) =>
  locale === defaultLocale ? '' : ` data-locale-prefix="${locale}"`

const MAINTENANCE_LOCALES_TIMEOUT_MS = 2000

/** Langues du site pour la page de maintenance, `fr` si l'API, parfois arrêtée elle aussi, ne répond pas à temps. */
const maintenanceLocales = () =>
  Promise.race([
    loadSiteIdentity().then(({ locales }) => locales),
    new Promise<string[]>((resolve) =>
      setTimeout(resolve, MAINTENANCE_LOCALES_TIMEOUT_MS, [FALLBACK_LOCALE]),
    ),
  ])

export const handle: Handle = async ({ event, resolve }) => {
  if (MAINTENANCE === '1') {
    return new Response(maintenancePage(event.url.pathname, await maintenanceLocales()), {
      status: 503,
      headers: {
        'content-type': 'text/html; charset=utf-8',
        'retry-after': String(MAINTENANCE_RETRY_AFTER_SECONDS),
      },
    })
  }

  // Identité lue une fois par requête, dans la langue demandée par l'adresse : `<html>` et `<head>` en
  // dépendent, le layout la reçoit par `locals`, avec la langue de la page tirée de ses `locales`
  const identity = await loadSiteIdentity(localePrefix(event.url.pathname))
  event.locals.siteIdentity = identity
  event.locals.locale = localeContext(event.url.pathname, identity.locales)
  const themeCss = identity.theme ? buildThemeCss(identity.theme) : ''

  const response = await resolve(event, {
    preload: ({ type }) => type === 'css',
    transformPageChunk: ({ html }) =>
      html
        .replace('%lang%', event.locals.locale.locale)
        .replace(' %locale.prefix%', localePrefixAttribute(event.locals.locale))
        .replace('%color.scheme%', identity.defaultColorScheme)
        .replace('%site.icons%', buildIconLinks(identity.icon))
        .replace(
          '%boot.script%',
          themeCss ? `${BOOT_SCRIPT}<style>${themeCss}</style>` : BOOT_SCRIPT,
        ),
  })
  // CSP en mode Report-Only : rien n'est bloqué, chaque écart est signalé à /api/csp-report
  response.headers.set(CSP_HEADER, buildSiteCsp(themeCss ? [themeCss] : []))
  return response
}

export const handleError: HandleServerError = ({ kind, error, event }) => {
  if (kind === 'unknown') console.error(error)
  if (shouldReportError({ kind, scenario: event.request.headers.get(SCENARIO_HEADER) })) {
    reportServerError(error)
  }
  return { message: 'Une erreur est survenue.' }
}
