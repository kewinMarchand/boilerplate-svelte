import { findLatestArticles } from '../infrastructure/articleRepository'
import { loadArticles, loadLatestArticles } from './latestArticles.server'

import type { Article } from '../domain/article'

vi.mock('../infrastructure/articleRepository', () => ({ findLatestArticles: vi.fn() }))

const article = (id: number): Article.Entity => ({
  id: String(id),
  slug: `article-${id}`,
  title: `Article ${id}`,
  excerpt: 'Extrait',
  image: null,
  publishedAt: '2026-10-01',
})

const event = { depends: vi.fn() }

describe('chargement des articles', () => {
  beforeEach(() => {
    vi.mocked(findLatestArticles).mockResolvedValue([1, 2, 3, 4].map(article))
  })

  it('limite la grille de l’accueil aux trois plus récents', async () => {
    const { blog } = await loadLatestArticles(event)

    expect(blog.status === 'success' && blog.articles.map(({ id }) => id)).toEqual(['1', '2', '3'])
  })

  it('renvoie tous les articles pour la page du blog', async () => {
    const { blog } = await loadArticles(event)

    expect(blog.status === 'success' && blog.articles).toHaveLength(4)
  })

  it('renvoie un message d’erreur si l’API ne répond pas', async () => {
    vi.mocked(findLatestArticles).mockRejectedValue(new Error('500'))

    expect((await loadArticles(event)).blog.status).toBe('error')
  })
})
