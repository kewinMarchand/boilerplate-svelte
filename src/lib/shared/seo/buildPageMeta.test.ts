import { buildHomeJsonLd, buildPageMeta, DEFAULT_SHARE_IMAGE } from './buildPageMeta'

const IDENTITY = { name: 'Boilerplate', shareImage: null }
const INPUT = { title: 'Contact', description: 'Écrivez-nous.', path: '/contact' }
const MONOLINGUAL = {
  locale: { locale: 'fr', defaultLocale: 'fr', locales: ['fr'] },
  alternates: [{ locale: 'fr', path: '/contact' as const }],
}
const BILINGUAL = {
  locale: { locale: 'en', defaultLocale: 'fr', locales: ['fr', 'en'] },
  alternates: [
    { locale: 'fr', path: '/produit/monstera' as const },
    { locale: 'en', path: '/produit/swiss-cheese-plant' as const },
  ],
}

describe('buildPageMeta', () => {
  it('garde le titre, la description et l’image du site sans métadonnées saisies', () => {
    const meta = buildPageMeta(
      { ...INPUT, metaTitle: '', metaDescription: '' },
      IDENTITY,
      MONOLINGUAL,
    )

    expect(meta.title).toBe('Contact · Boilerplate')
    expect(meta.ogTitle).toBe('Contact')
    expect(meta.description).toBe('Écrivez-nous.')
    expect(meta.image.path).toBe(DEFAULT_SHARE_IMAGE.path)
  })

  it('prend le titre et la description saisis dans l’admin', () => {
    const meta = buildPageMeta(
      { ...INPUT, metaTitle: 'Nous contacter', metaDescription: 'Une question ? Écrivez-nous.' },
      IDENTITY,
      MONOLINGUAL,
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

    const meta = buildPageMeta(INPUT, { ...IDENTITY, shareImage }, MONOLINGUAL)
    expect(meta.image).toMatchObject({
      url: 'http://api/share-1200.webp',
      alt: 'Boilerplate',
      width: 1200,
    })

    const own = { path: '/produit.webp', width: 800, height: 800, alt: 'Produit' }
    expect(
      buildPageMeta({ ...INPUT, image: own }, { ...IDENTITY, shareImage }, MONOLINGUAL).image.path,
    ).toBe('/produit.webp')
  })
})

describe('buildPageMeta, langues', () => {
  it('n’ajoute ni hreflang ni og:locale:alternate sur un site monolingue', () => {
    const meta = buildPageMeta(INPUT, IDENTITY, MONOLINGUAL)

    expect(meta.canonical).toBe('http://localhost:5173/contact')
    expect(meta.locale).toBe('fr_FR')
    expect(meta.hreflang).toEqual([])
    expect(meta.alternateLocales).toEqual([])
  })

  it('donne la canonique préfixée, chaque langue et x-default vers la langue par défaut', () => {
    const meta = buildPageMeta(
      { ...INPUT, path: '/produit/swiss-cheese-plant' },
      IDENTITY,
      BILINGUAL,
    )

    expect(meta.canonical).toBe('http://localhost:5173/en/produit/swiss-cheese-plant')
    expect(meta.locale).toBe('en_US')
    expect(meta.alternateLocales).toEqual(['fr_FR'])
    expect(meta.hreflang).toEqual([
      { hreflang: 'fr', href: 'http://localhost:5173/produit/monstera' },
      { hreflang: 'en', href: 'http://localhost:5173/en/produit/swiss-cheese-plant' },
      { hreflang: 'x-default', href: 'http://localhost:5173/produit/monstera' },
    ])
  })
})

describe('buildHomeJsonLd', () => {
  it('prend le logo du site sans icône saisie', () => {
    expect(
      buildHomeJsonLd({ name: 'Boilerplate', icon: null }, MONOLINGUAL.locale, 'fr-FR')[0]?.logo,
    ).toBe('http://localhost:5173/icon-512.png')
  })

  it('prend l’icône 512 px saisie dans l’admin', () => {
    const icon = {
      png32: 'http://api/icon-32.png',
      png180: 'http://api/icon-180.png',
      png192: 'http://api/icon-192.png',
      png512: 'http://api/icon-512.png',
    }

    expect(
      buildHomeJsonLd({ name: 'Boilerplate', icon }, MONOLINGUAL.locale, 'fr-FR')[0]?.logo,
    ).toBe('http://api/icon-512.png')
  })
})
