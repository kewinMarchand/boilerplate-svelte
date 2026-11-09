import { defineEnvVars } from '@sveltejs/kit/env'
import { z } from 'zod'

const flag = z.enum(['0', '1']).default('0')
const optionalUrl = z
  .union([z.literal(''), z.url()])
  .optional()
  .transform((value) => value || undefined)
const optionalText = z
  .string()
  .optional()
  .transform((value) => value || undefined)

export const variables = defineEnvVars({
  API_URL: {
    public: true,
    schema: z
      .union([z.literal(''), z.url()])
      .optional()
      .transform((value) => value || 'http://localhost:8090'),
    description:
      'Origine de l’API (8090 API Platform par défaut, 8091 Hono), lue par le serveur et le navigateur',
  },
  API_SCENARIO: {
    public: true,
    schema: optionalText,
    description:
      'Scénario de l’API (X-Scenario) fixé pour tous les appels du site, serveur et navigateur (bilingual pour l’e2e bilingue). Vide en production',
  },
  PUBLIC_SITE_URL: {
    public: true,
    schema: z.url().default('http://localhost:5173'),
    description: 'URL publique du site, pour les URL canoniques, Open Graph et le sitemap',
  },
  MAINTENANCE: {
    schema: flag,
    description: 'À 1, toutes les pages répondent 503 avec la page de maintenance statique',
  },
  PUBLIC_MATOMO_URL: {
    public: true,
    schema: optionalUrl,
    description: 'URL de l’instance Matomo. Vide : aucune mesure d’audience, aucun script',
  },
  PUBLIC_MATOMO_SITE_ID: {
    public: true,
    schema: optionalText,
    description: 'Identifiant du site dans Matomo',
  },
  GLITCHTIP_DSN: {
    schema: optionalUrl,
    description: 'DSN GlitchTip du serveur. Vide : aucun suivi des erreurs côté serveur',
  },
  PUBLIC_GLITCHTIP_DSN: {
    public: true,
    schema: optionalUrl,
    description: 'DSN GlitchTip du navigateur. Vide : aucun SDK chargé, aucune requête',
  },
  PUBLIC_GLITCHTIP_ENVIRONMENT: {
    public: true,
    schema: optionalText,
    description: 'Environnement déclaré à GlitchTip (défaut : development ou production)',
  },
  DEV_ROUTES: {
    schema: flag,
    description: 'À 1, expose les routes de développement (charte graphique, erreur de test)',
  },
})
