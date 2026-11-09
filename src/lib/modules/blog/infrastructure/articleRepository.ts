import { ApiError } from '#lib/shared/api/client'
import { serverApiClient } from '#lib/shared/api/client.server'

import { toArticle, toArticleDetail, toSections } from './http/articleTranslation'

import type { Article } from '../domain/article'

/**
 * `section` : slug de rubrique ; inconnu de l'API, la liste est vide. `locale` : une autre langue que celle
 * de la page (sitemap).
 */
export const findLatestArticles = async (
  section?: string,
  locale?: string,
): Promise<Article.Entity[]> => {
  const { data, response } = await serverApiClient({ locale }).GET('/api/articles', {
    params: { query: section ? { section } : {} },
  })
  if (!data) throw new ApiError(response)
  return data.map(toArticle)
}

export const findSections = async (): Promise<Article.Term[]> => {
  const { data, response } = await serverApiClient().GET('/api/article-sections')
  if (!data) throw new ApiError(response)
  return toSections(data)
}

/** `null` si l'API ne connaît pas l'article (404). */
export const findArticle = async (slug: string): Promise<Article.Detail | null> => {
  const { data, response } = await serverApiClient().GET('/api/articles/{slug}', {
    params: { path: { slug } },
  })
  if (response.status === 404) return null
  if (!data) throw new ApiError(response)
  return toArticleDetail(data)
}
