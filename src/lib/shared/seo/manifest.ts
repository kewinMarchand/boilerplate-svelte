import type { SiteIdentity } from '#lib/shared/config'

/** Couleur principale de boilerplates-ui, quand aucune couleur de marque n'est saisie. */
const DEFAULT_THEME_COLOR = '#1d4ed8'

export const buildWebManifest = ({ name, theme }: SiteIdentity) => ({
  name,
  short_name: name,
  lang: 'fr',
  start_url: '/',
  display: 'standalone',
  theme_color: theme?.light.primary ?? DEFAULT_THEME_COLOR,
  background_color: '#ffffff',
  icons: [
    { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
    { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
  ],
})
