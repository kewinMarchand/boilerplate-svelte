import '@testing-library/jest-dom/vitest'

vi.mock('$app/env/public', () => ({
  PUBLIC_SITE_URL: 'http://localhost:5173',
  API_URL: 'http://localhost:8090',
  API_SCENARIO: undefined,
  PUBLIC_GLITCHTIP_DSN: undefined,
  PUBLIC_MATOMO_URL: undefined,
  PUBLIC_MATOMO_SITE_ID: undefined,
  PUBLIC_GLITCHTIP_ENVIRONMENT: undefined,
}))
// Page française d'un site monolingue : langue et dictionnaire que les composants lisent dans `page.data`
vi.mock('$app/state', async () => {
  const { fr } = await import('#lib/shared/i18n/dictionaries/fr')
  return {
    page: {
      url: new URL('http://localhost/'),
      error: null,
      data: { dictionary: fr, locale: { locale: 'fr', defaultLocale: 'fr', locales: ['fr'] } },
    },
    navigating: { from: null, to: null },
  }
})
vi.mock('$app/env/private', () => ({
  MAINTENANCE: '0',
  DEV_ROUTES: '0',
  GLITCHTIP_DSN: undefined,
}))
