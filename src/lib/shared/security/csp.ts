import { createHash } from 'node:crypto'

import { buildCsp, CSP_REPORT_PATH, defaultDirectives } from '@kewinmarchand/csp'

import type { Directives } from '@kewinmarchand/csp'

export interface SiteOrigins {
  /** API appelée par le navigateur (tâches, contact), qui sert aussi les images et l'audio des contenus. */
  apiUrl: string
  /** Instance Matomo, quand la mesure d'audience est activée : script, appels et pixel de suivi. */
  matomoUrl?: string | undefined
  /** DSN GlitchTip du navigateur, quand le suivi des erreurs est activé : envoi des erreurs. */
  glitchtipDsn?: string | undefined
  /** Contenu des blocs <style> en ligne servis par la page (couleurs de marque), autorisés par empreinte. */
  inlineStyles?: string[] | undefined
}

const originOf = (address: string) => new URL(address).origin

/** En-tête Report-Only du site : seules les origines que le site charge réellement, selon ses variables. */
export const siteCsp = ({ apiUrl, matomoUrl, glitchtipDsn, inlineStyles = [] }: SiteOrigins) => {
  const extra: Directives = { 'img-src': [originOf(apiUrl)], 'media-src': [originOf(apiUrl)] }
  if (matomoUrl) {
    const matomo = originOf(matomoUrl)
    Object.assign(extra, {
      'script-src': [matomo],
      'connect-src': [matomo],
      'img-src': [...(extra['img-src'] ?? []), matomo],
    })
  }
  if (glitchtipDsn) {
    extra['connect-src'] = [...(extra['connect-src'] ?? []), originOf(glitchtipDsn)]
  }
  const csp = buildCsp(defaultDirectives({ apiOrigin: apiUrl, extra }), {
    reportUri: CSP_REPORT_PATH,
  })
  if (inlineStyles.length === 0) return csp
  // `style-src-elem` plutôt que `style-src` : une empreinte y annulerait `'unsafe-inline'` pour les attributs `style`
  const hashes = inlineStyles.map(
    (style) => `'sha256-${createHash('sha256').update(style).digest('base64')}'`,
  )
  return `${csp}; style-src-elem 'self' ${hashes.join(' ')}`
}
