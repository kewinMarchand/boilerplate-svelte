import { articleHref } from '../domain/article'
import { ArticleLoadError } from '../infrastructure/ArticleLoadError'
import { findArticle, findLatestArticles } from '../infrastructure/articleRepository'

import type { Article } from '../domain/article'
import type { AppPath } from '#lib/shared/routing'

export const loadArticle = async (slug: string): Promise<Article.Load> => {
  try {
    const article = await findArticle(slug)
    return article ? { status: 'success', article } : { status: 'not-found' }
  } catch {
    return { status: 'error', message: new ArticleLoadError().message }
  }
}

/** Fiches d'une langue pour le sitemap, associées d'une langue à l'autre par `key` ; aucune si l'API ne répond pas. */
export const listArticleEntries = async (
  locale: string,
): Promise<{ key: string; path: AppPath }[]> =>
  (await findLatestArticles(undefined, locale).catch(() => [])).map((article) => ({
    key: article.id,
    path: articleHref(article.slug),
  }))
