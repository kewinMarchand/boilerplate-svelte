import createClient, { createQuerySerializer } from 'openapi-fetch'
import { API_SCENARIO, API_URL } from '$app/env/public'

import type { paths } from './schema'

export type { components, operations } from './schema'

const defaultQuerySerializer = createQuerySerializer()

/** Objets de listes (`attributes[<code>][]`), que le sérialiseur d'openapi-fetch refuse, en clés répétées. */
export const querySerializer = (query: Record<string, unknown>) =>
  defaultQuerySerializer(
    Object.fromEntries(
      Object.entries(query).flatMap(([name, value]) =>
        value !== null && typeof value === 'object' && !Array.isArray(value)
          ? Object.entries(value).map(([key, values]) => [`${name}[${key}][]`, values])
          : [[name, value]],
      ),
    ),
  )

/**
 * Client typé de l'API. `X-Scenario` (error, empty, bilingual) n'a d'effet qu'en dev et en test côté API :
 * le relayer permet aux tests e2e de provoquer les états d'erreur et de liste vide. À défaut,
 * `API_SCENARIO` en fixe un pour tous les appels (site bilingue de l'e2e).
 */
export const createApiClient = (fetch: typeof globalThis.fetch, scenario?: string | null) => {
  const fixedScenario = scenario || API_SCENARIO
  return createClient<paths, 'application/json'>({
    baseUrl: API_URL,
    fetch,
    querySerializer,
    headers: fixedScenario ? { 'X-Scenario': fixedScenario } : {},
  })
}

export class ApiError extends Error {
  constructor(response: Response) {
    super(`Réponse ${response.status} de l'API (${response.url})`)
    this.name = 'ApiError'
  }
}
