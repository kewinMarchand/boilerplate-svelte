import { buildHomeJsonLd, buildPageMeta, DEFAULT_SHARE_IMAGE } from './buildPageMeta'

const IDENTITY = { name: 'Boilerplate', shareImage: null }
const INPUT = { title: 'Contact', description: 'Écrivez-nous.', path: '/contact' }

describe('buildPageMeta', () => {
  it('garde le titre, la description et l’image du site sans métadonnées saisies', () => {
    const meta = buildPageMeta({ ...INPUT, metaTitle: '', metaDescription: '' }, IDENTITY)

    expect(meta.title).toBe('Contact · Boilerplate')
    expect(meta.ogTitle).toBe('Contact')
    expect(meta.description).toBe('Écrivez-nous.')
    expect(meta.image.path).toBe(DEFAULT_SHARE_IMAGE.path)
  })

  it('prend le titre et la description saisis dans l’admin', () => {
    const meta = buildPageMeta(
      { ...INPUT, metaTitle: 'Nous contacter', metaDescription: 'Une question ? Écrivez-nous.' },
      IDENTITY,
    )

    expect(meta.title).toBe('Nous contacter')
    expect(meta.ogTitle).toBe('Nous contacter')
    expect(meta.description).toBe('Une question ? Écrivez-nous.')
  })

  it('prend l’image de partage du site saisie quand la page n’a pas d’image propre', () => {
    const shareImage = {
      alt: '',
      width: 1200,
      height: 630,
      sources: [{ type: 'image/webp', srcset: 'http://api/share-1200.webp 1200w' }],
      src: 'http://api/share-1200.webp',
    }

    const meta = buildPageMeta(INPUT, { ...IDENTITY, shareImage })
    expect(meta.image).toMatchObject({
      url: 'http://api/share-1200.webp',
      alt: 'Boilerplate',
      width: 1200,
    })

    const own = { path: '/produit.webp', width: 800, height: 800, alt: 'Produit' }
    expect(buildPageMeta({ ...INPUT, image: own }, { ...IDENTITY, shareImage }).image.path).toBe(
      '/produit.webp',
    )
  })
})

describe('buildHomeJsonLd', () => {
  it('prend le logo du site sans icône saisie', () => {
    expect(buildHomeJsonLd({ name: 'Boilerplate', icon: null })[0]?.logo).toBe(
      'http://localhost:5173/icon-512.png',
    )
  })

  it('prend l’icône 512 px saisie dans l’admin', () => {
    const icon = {
      png32: 'http://api/icon-32.png',
      png180: 'http://api/icon-180.png',
      png192: 'http://api/icon-192.png',
      png512: 'http://api/icon-512.png',
    }

    expect(buildHomeJsonLd({ name: 'Boilerplate', icon })[0]?.logo).toBe('http://api/icon-512.png')
  })
})
