import { SECTION_PARAM } from '../domain/article'
import { findLatestArticles, findSections } from '../infrastructure/articleRepository'
import { ArticlesLoadError } from '../infrastructure/ArticlesLoadError'
import { BLOG_ARTICLES_DEPENDENCY } from './dependencies'

import type { Article } from '../domain/article'
import type { ServerLoadEvent } from '@sveltejs/kit'

const HOME_ARTICLES_COUNT = 3

const loadBlog = async (
  { depends }: Pick<ServerLoadEvent, 'depends'>,
  { limit, section }: { limit?: number; section?: string | undefined } = {},
) => {
  depends(BLOG_ARTICLES_DEPENDENCY)

  try {
    const articles = await findLatestArticles(section)
    const blog: Article.Blog = { status: 'success', articles: articles.slice(0, limit) }
    return { blog }
  } catch {
    const blog: Article.Blog = { status: 'error', message: new ArticlesLoadError().message }
    return { blog }
  }
}

/** Grille de l'accueil : les trois articles les plus récents. */
export const loadLatestArticles = (event: Pick<ServerLoadEvent, 'depends'>) =>
  loadBlog(event, { limit: HOME_ARTICLES_COUNT })

/** Page `/blog` : tous les articles, du plus récent au plus ancien, filtrés par la rubrique de l'URL. */
export const loadArticles = async (
  event: Pick<ServerLoadEvent, 'depends' | 'url'>,
): Promise<Article.BlogPage> => {
  const activeSection = event.url.searchParams.get(SECTION_PARAM) || undefined
  const [{ blog }, sections] = await Promise.all([
    loadBlog(event, { section: activeSection }),
    // Sans rubriques lisibles, le filtre disparaît et la liste reste servie
    findSections().catch(() => []),
  ])
  return { blog, sections, activeSection }
}
