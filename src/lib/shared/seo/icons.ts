import type { SiteIcon } from '#lib/shared/config'

const DEFAULT_ICON_LINKS = [
  '<link rel="icon" href="/favicon.ico" sizes="48x48" />',
  '<link rel="icon" href="/favicon.svg" type="image/svg+xml" />',
  '<link rel="apple-touch-icon" href="/apple-touch-icon.png" />',
].join('')

const escapeAttribute = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')

/** Balises des favicons de `<head>` : l'icône saisie dans l'admin, sinon les fichiers du site (section 8). */
export const buildIconLinks = (icon: SiteIcon | null) =>
  icon
    ? `<link rel="icon" type="image/png" sizes="32x32" href="${escapeAttribute(icon.png32)}" />` +
      `<link rel="apple-touch-icon" href="${escapeAttribute(icon.png180)}" />`
    : DEFAULT_ICON_LINKS
