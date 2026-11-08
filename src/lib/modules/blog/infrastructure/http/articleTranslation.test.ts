import { toArticle, toArticleDetail, toSections } from './articleTranslation'

const ARTICLE = {
  id: 2,
  slug: 'un-carrousel-accessible',
  title: 'Un carrousel accessible',
  excerpt: 'Extrait.',
  image: null,
  publishedAt: '2026-09-22',
  section: { slug: 'conseils', name: 'Conseils' },
  format: null,
  audio: null,
  speaker: '',
}

describe('traduction des articles', () => {
  it('garde la rubrique de la carte, ou null', () => {
    expect(toArticle(ARTICLE).section).toEqual({ slug: 'conseils', name: 'Conseils' })
    expect(toArticle({ ...ARTICLE, section: null }).section).toBeNull()
  })

  it('traduit format, audio, intervenant et métadonnées de la fiche', () => {
    const detail = toArticleDetail({
      ...ARTICLE,
      html: '<p>Texte.</p>',
      format: { slug: 'guide', name: 'Guide' },
      audio: { src: 'http://api/media/bip.mp3', type: 'audio/mpeg', durationSeconds: 4 },
      speaker: 'Présenté par Hina Teriierooiterai',
      metaTitle: 'Carrousel accessible : le guide',
      metaDescription: 'Un carrousel sans dépendance.',
    })

    expect(detail).toMatchObject({
      format: { slug: 'guide', name: 'Guide' },
      audio: { src: 'http://api/media/bip.mp3', type: 'audio/mpeg', durationSeconds: 4 },
      speaker: 'Présenté par Hina Teriierooiterai',
      metaTitle: 'Carrousel accessible : le guide',
      metaDescription: 'Un carrousel sans dépendance.',
    })
  })

  it('laisse format et audio à null quand l’article n’en a pas', () => {
    const detail = toArticleDetail({ ...ARTICLE, html: '', metaTitle: '', metaDescription: '' })

    expect(detail.format).toBeNull()
    expect(detail.audio).toBeNull()
  })

  it('liste les rubriques dans l’ordre de l’API', () => {
    expect(
      toSections([
        { slug: 'conseils', name: 'Conseils' },
        { slug: 'actualites', name: 'Actualités' },
      ]).map(({ slug }) => slug),
    ).toEqual(['conseils', 'actualites'])
  })
})
