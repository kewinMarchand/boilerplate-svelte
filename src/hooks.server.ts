import { MAINTENANCE } from '$app/env/private'

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

import { MAINTENANCE_HTML, MAINTENANCE_RETRY_AFTER_SECONDS } from '#lib/views/errors'

import type { Handle, HandleServerError, ServerInit } from '@sveltejs/kit/hooks'

export const init: ServerInit = () => {
  announceStartup()
  return initServerErrorReporting()
}

// Mode renforcé et thème posés avant le premier rendu, dans une seule balise (sections 4 et 20 de la spec commune).
const BOOT_SCRIPT = `<script>${A11Y_MODE_SCRIPT}${COLOR_SCHEME_SCRIPT}</script>`

export const handle: Handle = async ({ event, resolve }) => {
  if (MAINTENANCE === '1') {
    return new Response(MAINTENANCE_HTML, {
      status: 503,
      headers: {
        'content-type': 'text/html; charset=utf-8',
        'retry-after': String(MAINTENANCE_RETRY_AFTER_SECONDS),
      },
    })
  }

  // Identité lue une fois par requête : `<html>` et `<head>` en dépendent, le layout la reçoit par `locals`
  const identity = await loadSiteIdentity()
  event.locals.siteIdentity = identity
  const themeCss = identity.theme ? buildThemeCss(identity.theme) : ''

  const response = await resolve(event, {
    preload: ({ type }) => type === 'css',
    transformPageChunk: ({ html }) =>
      html
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
