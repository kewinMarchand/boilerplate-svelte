import { findFeaturedProducts, findProduct } from '../infrastructure/catalogRepository'
import { loadFeaturedProducts, loadProduct, loadProductTranslations } from './products.server'

import type { Catalog } from '../domain/catalog'

vi.mock('../infrastructure/catalogRepository', () => ({
  findProduct: vi.fn(),
  findFeaturedProducts: vi.fn(),
  findAllProductSlugs: vi.fn(),
}))

describe('loadProduct', () => {
  it('distingue un produit inconnu d’une API en panne', async () => {
    vi.mocked(findProduct).mockResolvedValueOnce(null)
    expect(await loadProduct('inconnu')).toEqual({ status: 'not-found' })

    vi.mocked(findProduct).mockRejectedValueOnce(new Error('panne'))
    expect(await loadProduct('monstera')).toEqual({
      status: 'error',
      message: 'Impossible de charger ce produit pour le moment.',
    })
  })
})

describe('loadFeaturedProducts', () => {
  it('transforme un échec du dépôt en message d’erreur affichable', async () => {
    vi.mocked(findFeaturedProducts).mockRejectedValueOnce(new Error('panne'))

    expect(await loadFeaturedProducts()).toEqual({
      featured: { status: 'error', message: 'Impossible de charger le carrousel pour le moment.' },
    })
  })
})

describe('loadProductTranslations', () => {
  const product = (alternates: Catalog.Alternate[]) =>
    ({
      slug: 'monstera-deliciosa',
      name: 'Monstera deliciosa',
      alternates,
    }) as Catalog.ProductDetail

  it('ne demande rien sur un site monolingue', async () => {
    vi.mocked(findProduct).mockClear()

    expect(await loadProductTranslations(product([]), 'fr')).toEqual([])
    expect(findProduct).not.toHaveBeenCalled()
  })

  it('lit le nom dans chaque autre langue et omet celle que l’API ne sert pas', async () => {
    vi.mocked(findProduct).mockImplementation(async (slug, locale) =>
      locale === 'en'
        ? ({ slug, name: 'Swiss cheese plant' } as Catalog.ProductDetail)
        : Promise.reject(new Error('API muette')),
    )

    expect(
      await loadProductTranslations(
        product([
          { locale: 'fr', path: '/produit/monstera-deliciosa' },
          { locale: 'en', path: '/produit/swiss-cheese-plant' },
          { locale: 'de', path: '/produit/fensterblatt' },
        ]),
        'fr',
      ),
    ).toEqual([
      { locale: 'fr', slug: 'monstera-deliciosa', name: 'Monstera deliciosa' },
      { locale: 'en', slug: 'swiss-cheese-plant', name: 'Swiss cheese plant' },
    ])
    expect(findProduct).toHaveBeenCalledWith('swiss-cheese-plant', 'en')
  })
})
