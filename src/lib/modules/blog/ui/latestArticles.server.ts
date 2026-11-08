import { findLatestArticles } from '../infrastructure/articleRepository'
import { ArticlesLoadError } from '../infrastructure/ArticlesLoadError'
import { BLOG_ARTICLES_DEPENDENCY } from './dependencies'

import type { Article } from '../domain/article'
import type { ServerLoadEvent } from '@sveltejs/kit'

const HOME_ARTICLES_COUNT = 3

const loadBlog = async ({ depends }: Pick<ServerLoadEvent, 'depends'>, limit?: number) => {
  depends(BLOG_ARTICLES_DEPENDENCY)

  try {
    const articles = await findLatestArticles()
    const blog: Article.Blog = { status: 'success', articles: articles.slice(0, limit) }
    return { blog }
  } catch {
    const blog: Article.Blog = { status: 'error', message: new ArticlesLoadError().message }
    return { blog }
  }
}

/** Grille de l'accueil : les trois articles les plus récents. */
export const loadLatestArticles = (event: Pick<ServerLoadEvent, 'depends'>) =>
  loadBlog(event, HOME_ARTICLES_COUNT)

/** Page `/blog` : tous les articles, du plus récent au plus ancien. */
export const loadArticles = (event: Pick<ServerLoadEvent, 'depends'>) => loadBlog(event)
