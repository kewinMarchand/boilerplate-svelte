import { findLatestArticles, findSections } from '../infrastructure/articleRepository'
import { loadArticles, loadLatestArticles } from './latestArticles.server'

import type { Article } from '../domain/article'

vi.mock('../infrastructure/articleRepository', () => ({
  findLatestArticles: vi.fn(),
  findSections: vi.fn(),
}))

const article = (id: number): Article.Entity => ({
  id: String(id),
  slug: `article-${id}`,
  title: `Article ${id}`,
  excerpt: 'Extrait',
  image: null,
  publishedAt: '2026-10-01',
  section: null,
})

const SECTIONS = [{ slug: 'conseils', name: 'Conseils' }]

const event = { depends: vi.fn(), url: new URL('http://localhost/blog') }

describe('chargement des articles', () => {
  beforeEach(() => {
    vi.mocked(findLatestArticles).mockResolvedValue([1, 2, 3, 4].map(article))
    vi.mocked(findSections).mockResolvedValue(SECTIONS)
  })

  it('limite la grille de l’accueil aux trois plus récents', async () => {
    const { blog } = await loadLatestArticles(event)

    expect(blog.status === 'success' && blog.articles.map(({ id }) => id)).toEqual(['1', '2', '3'])
  })

  it('renvoie tous les articles pour la page du blog', async () => {
    const { blog } = await loadArticles(event)

    expect(blog.status === 'success' && blog.articles).toHaveLength(4)
  })

  it('filtre la page du blog par la rubrique de l’URL et renvoie les rubriques', async () => {
    const page = await loadArticles({
      ...event,
      url: new URL('http://localhost/blog?rubrique=conseils'),
    })

    expect(findLatestArticles).toHaveBeenLastCalledWith('conseils')
    expect(page.activeSection).toBe('conseils')
    expect(page.sections).toEqual(SECTIONS)
  })

  it('garde la liste sans filtre si les rubriques ne se chargent pas', async () => {
    vi.mocked(findSections).mockRejectedValue(new Error('500'))
    const page = await loadArticles(event)

    expect(findLatestArticles).toHaveBeenLastCalledWith(undefined)
    expect(page.sections).toEqual([])
    expect(page.blog.status).toBe('success')
  })

  it('renvoie un message d’erreur si l’API ne répond pas', async () => {
    vi.mocked(findLatestArticles).mockRejectedValue(new Error('500'))

    expect((await loadArticles(event)).blog.status).toBe('error')
  })
})
