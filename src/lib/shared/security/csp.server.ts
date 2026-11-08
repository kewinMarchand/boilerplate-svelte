import { dev } from '$app/env'
import { API_URL, PUBLIC_GLITCHTIP_DSN, PUBLIC_MATOMO_URL } from '$app/env/public'

import { cspReportRoute, startupLine } from '@kewinmarchand/csp'

import { siteCsp } from './csp'

export { CSP_HEADER } from '@kewinmarchand/csp'

export const buildSiteCsp = (inlineStyles: string[]) =>
  siteCsp({
    apiUrl: API_URL,
    matomoUrl: PUBLIC_MATOMO_URL,
    glitchtipDsn: PUBLIC_GLITCHTIP_DSN,
    inlineStyles,
  })

/** Route POST /api/csp-report : 204 et une ligne sur la sortie standard, 400 ou 413. */
export const cspReportHandler = cspReportRoute()

/** Ligne de démarrage, pour retrouver le bon fichier de log chez l'hébergeur. */
export const announceStartup = () =>
  process.stdout.write(`${startupLine('boilerplate-svelte', dev ? 'development' : 'production')}\n`)
