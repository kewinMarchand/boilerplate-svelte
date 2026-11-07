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

/** Chemins des fiches pour le sitemap ; aucun si l'API ne répond pas. */
export const listArticlePaths = async (): Promise<AppPath[]> =>
  (await findLatestArticles().catch(() => [])).map((article) => articleHref(article.slug))
