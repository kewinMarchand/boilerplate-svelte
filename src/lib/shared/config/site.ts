import { PUBLIC_SITE_URL } from '$app/env/public'

import type { AccessibilityAudit } from './accessibility'

export interface SiteConfig {
  name: string
  description: string
  url: string
  locale: string
  publisher: {
    name: string
    email: string
  }
  accessibility: AccessibilityAudit
}

export const SITE: SiteConfig = {
  name: 'Boilerplate Svelte',
  description:
    'Boilerplate SvelteKit avec Tailwind CSS, TanStack Query, superforms et zod, outillé pour la QA et les tests end-to-end.',
  url: PUBLIC_SITE_URL,
  locale: 'fr_FR',
  publisher: {
    name: 'Exemple SAS (société fictive)',
    email: 'contact@exemple.fr',
  },
  accessibility: { auditDate: null, complianceRate: null, auditor: null },
}
