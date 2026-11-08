import { ApiError } from '#lib/shared/api/client'
import { serverApiClient } from '#lib/shared/api/client.server'

import { toPageMetas } from './http/pageMetasTranslation'

import type { PageMetas } from '../domain/pageMetas'

export const findPageMetas = async (): Promise<PageMetas> => {
  const { data, response } = await serverApiClient().GET('/api/page-metas')
  if (!data) throw new ApiError(response)
  return toPageMetas(data)
}
