import { toCategory, toListing, toProductDetail, toProductsQuery } from './catalogTranslation'

import type { Catalog } from '#lib/modules/catalog/domain/catalog'

const QUERY: Catalog.Query = {
  exposures: [],
  sizes: [],
  priceMin: undefined,
  priceMax: undefined,
  inStock: false,
  attributes: {},
  sort: 'pertinence',
  view: 'grille',
  page: 1,
}

describe('toProductsQuery', () => {
  it('n’envoie que la pagination sans filtre ni tri', () => {
    expect(toProductsQuery([], QUERY)).toEqual({ page: 1, itemsPerPage: 12 })
  })

  it('traduit catégorie, filtres, prix en centimes et tri', () => {
    expect(
      toProductsQuery(['plantes-interieur', 'feuillages'], {
        ...QUERY,
        exposures: ['soleil', 'ombre'],
        sizes: ['M'],
        priceMin: 10,
        priceMax: 49.9,
        inStock: true,
        sort: 'prix-desc',
        page: 2,
      }),
    ).toEqual({
      category: 'feuillages',
      'exposure[]': ['soleil', 'ombre'],
      'size[]': ['M'],
      priceMin: 1000,
      priceMax: 4990,
      inStock: true,
      'order[price]': 'desc',
      page: 2,
      itemsPerPage: 12,
    })
    expect(toProductsQuery([], { ...QUERY, sort: 'nom' })).toMatchObject({ 'order[name]': 'asc' })
  })

  it('traduit les attributs cochés en `attributes[<code>][]` et omet ceux sans valeur', () => {
    expect(
      toProductsQuery([], {
        ...QUERY,
        attributes: { feuillage: ['persistant', 'caduc'], couleur: [] },
      }),
    ).toEqual({ attributes: { feuillage: ['persistant', 'caduc'] }, page: 1, itemsPerPage: 12 })
  })
})

const LANGUAGES = { locale: 'fr', locales: ['fr'] }

describe('toCategory', () => {
  it('ajoute la description éditoriale du site à chaque catégorie', () => {
    const category = toCategory(
      {
        slug: 'plantes-aquatiques',
        name: 'Plantes aquatiques',
        parent: null,
        children: [
          {
            slug: 'nenuphars',
            name: 'Nénuphars',
            parent: 'plantes-aquatiques',
            children: [],
            alternates: [],
          },
        ],
        alternates: [],
      },
      'fr',
    )

    expect(category.description).toMatch(/^Plantes aquatiques pour bassins/)
    expect(category.children[0]?.description).toMatch(/^Nénuphars blancs/)
  })

  it('prend la description dans la langue de la réponse, par le slug français de la catégorie', () => {
    const category = toCategory(
      {
        slug: 'aquatic-plants',
        name: 'Aquatic plants',
        parent: null,
        children: [],
        alternates: [
          { locale: 'fr', slug: 'plantes-aquatiques' },
          { locale: 'en', slug: 'aquatic-plants' },
        ],
      },
      'en',
    )

    expect(category.description).toMatch(/^Aquatic plants for ponds/)
    expect(category.alternates).toHaveLength(2)
  })
})

describe('toListing', () => {
  it('traduit identifiants, prix, sous-catégories et facettes dans l’ordre du domaine', () => {
    const listing = toListing(
      [
        {
          id: 7,
          slug: 'kentia',
          name: 'Kentia',
          categorySlug: 'palmiers',
          price: 5990,
          exposure: 'mi-ombre',
          size: 'L',
          inStock: true,
          image: null,
          attributes: [],
        },
      ],
      {
        totalItems: 1,
        exposure: [
          { value: 'ombre', count: 0 },
          { value: 'mi-ombre', count: 1 },
        ],
        size: [{ value: 'L', count: 1 }],
        category: [{ slug: 'palmiers', name: 'Palmiers', count: 1 }],
        attributes: [
          {
            code: 'feuillage',
            label: 'Feuillage',
            values: [
              { value: 'persistant', label: 'Persistant', count: 1 },
              { value: 'caduc', label: 'Caduc', count: 0 },
            ],
          },
        ],
      },
      1,
      {
        chain: [],
        slugs: ['plantes-exterieur'],
        categories: [],
        languages: LANGUAGES,
        language: 'fr',
      },
    )

    expect(listing.products[0]).toMatchObject({ id: '7', price: 5990 })
    expect(listing.children).toEqual([
      {
        slug: 'palmiers',
        name: 'Palmiers',
        path: '/catalogue/plantes-exterieur/palmiers',
        count: 1,
      },
    ])
    expect(listing.facets.exposure).toEqual([
      { value: 'soleil', count: 0 },
      { value: 'mi-ombre', count: 1 },
      { value: 'ombre', count: 0 },
    ])
    expect(listing.facets.attributes).toEqual([
      {
        code: 'feuillage',
        label: 'Feuillage',
        values: [
          { value: 'persistant', label: 'Persistant', count: 1 },
          { value: 'caduc', label: 'Caduc', count: 0 },
        ],
      },
    ])
  })

  it('garde au moins une page quand il n’y a aucun résultat', () => {
    const listing = toListing(
      [],
      { totalItems: 0, exposure: [], size: [], category: [], attributes: [] },
      1,
      { chain: [], slugs: [], categories: [], languages: LANGUAGES, language: 'fr' },
    )

    expect(listing.totalPages).toBe(1)
  })

  it('calcule le nombre de pages à partir du total des facettes', () => {
    const listing = toListing(
      [],
      { totalItems: 25, exposure: [], size: [], category: [], attributes: [] },
      3,
      { chain: [], slugs: [], categories: [], languages: LANGUAGES, language: 'fr' },
    )

    expect(listing).toMatchObject({ total: 25, page: 3, totalPages: 3 })
  })
})

describe('toProductDetail', () => {
  it('ne garde aucun paragraphe d’une description vide', () => {
    const detail = toProductDetail({
      id: 1,
      slug: 'palmier-nain',
      name: 'Palmier nain',
      categorySlug: 'palmiers',
      price: 4490,
      exposure: 'soleil',
      size: 'M',
      inStock: true,
      image: null,
      categoryPath: [{ slug: 'palmiers', name: 'Palmiers' }],
      description: '',
      attributes: [],
      gallery: [],
      metaTitle: '',
      metaDescription: '',
      alternates: [],
    })

    expect(detail.description).toEqual([])
  })

  it('découpe la description en paragraphes aux lignes vides', () => {
    const detail = toProductDetail({
      id: 1,
      slug: 'palmier-nain',
      name: 'Palmier nain',
      categorySlug: 'palmiers',
      price: 4490,
      exposure: 'soleil',
      size: 'M',
      inStock: true,
      image: null,
      categoryPath: [{ slug: 'palmiers', name: 'Palmiers' }],
      description: 'Rustique.\n\n  \nRésiste au vent,\naux embruns.',
      attributes: [],
      gallery: [],
      metaTitle: '',
      metaDescription: '',
      alternates: [],
    })

    expect(detail.description).toEqual(['Rustique.', 'Résiste au vent,\naux embruns.'])
  })

  it('affiche le libellé de la valeur et garde l’unité', () => {
    const detail = toProductDetail({
      id: 1,
      slug: 'palmier-de-chine',
      name: 'Palmier de Chine',
      categorySlug: 'palmiers',
      price: 4490,
      exposure: 'soleil',
      size: 'L',
      inStock: true,
      image: null,
      categoryPath: [{ slug: 'palmiers', name: 'Palmiers' }],
      description: '',
      attributes: [
        {
          code: 'feuillage',
          label: 'Feuillage',
          type: 'choice',
          value: 'persistant',
          valueLabel: 'Persistant',
          unit: null,
        },
        {
          code: 'hauteur-adulte',
          label: 'Hauteur adulte',
          type: 'number',
          value: '1200',
          valueLabel: '1200',
          unit: 'cm',
        },
      ],
      gallery: [],
      metaTitle: '',
      metaDescription: '',
      alternates: [],
    })

    expect(detail.attributes).toEqual([
      { code: 'feuillage', label: 'Feuillage', value: 'Persistant', unit: null },
      { code: 'hauteur-adulte', label: 'Hauteur adulte', value: '1200', unit: 'cm' },
    ])
  })
  it('garde la galerie dans l’ordre et les métadonnées saisies', () => {
    const image = (name: string) => ({
      alt: name,
      width: 800,
      height: 800,
      sources: [{ type: 'image/webp' as const, srcset: `http://api/${name}-800.webp 800w` }],
      src: `http://api/${name}-800.webp`,
    })
    const detail = toProductDetail({
      id: 1,
      slug: 'palmier-nain',
      name: 'Palmier nain',
      categorySlug: 'palmiers',
      price: 4490,
      exposure: 'soleil',
      size: 'M',
      inStock: true,
      image: image('principale'),
      categoryPath: [{ slug: 'palmiers', name: 'Palmiers' }],
      description: '',
      attributes: [],
      gallery: [image('feuille'), image('tronc')],
      metaTitle: 'Palmier nain : rustique et compact',
      metaDescription: 'Un palmier qui tient sur un balcon.',
      alternates: [
        { locale: 'fr', slug: 'palmier-nain' },
        { locale: 'en', slug: 'dwarf-palm' },
      ],
    })

    expect(detail.gallery.map(({ alt }) => alt)).toEqual(['feuille', 'tronc'])
    expect(detail.metaTitle).toBe('Palmier nain : rustique et compact')
    expect(detail.metaDescription).toBe('Un palmier qui tient sur un balcon.')
    expect(detail.alternates).toEqual([
      { locale: 'fr', path: '/produit/palmier-nain' },
      { locale: 'en', path: '/produit/dwarf-palm' },
    ])
  })
})
