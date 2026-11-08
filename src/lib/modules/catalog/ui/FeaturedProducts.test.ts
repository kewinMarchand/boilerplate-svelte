import { render, screen } from '@testing-library/svelte'

import { Price } from '../domain/price'
import FeaturedProducts from './FeaturedProducts.svelte'

// Embla demande matchMedia, absent de jsdom : la piste reste celle du rendu sans JavaScript
vi.mock('embla-carousel-svelte', () => ({ default: () => {} }))

const product = (slug: string) => ({
  id: slug,
  slug,
  name: slug,
  categorySlug: 'heliconia',
  price: Price.fromCents(5490),
  exposure: 'soleil' as const,
  size: 'L' as const,
  inStock: true,
  image: null,
})

describe('FeaturedProducts', () => {
  it("affiche le message d'erreur à la place du carrousel", () => {
    render(FeaturedProducts, { featured: { status: 'error', message: 'Oups' }, showPrice: true })

    expect(screen.getByTestId('home-carousel-error')).toHaveTextContent('Oups')
    expect(screen.queryByTestId('home-carousel')).not.toBeInTheDocument()
  })

  it("n'affiche pas la section sans produit à la une", () => {
    render(FeaturedProducts, { featured: { status: 'success', products: [] }, showPrice: true })

    expect(screen.queryByTestId('home-carousel')).not.toBeInTheDocument()
    expect(screen.queryByTestId('home-carousel-error')).not.toBeInTheDocument()
  })

  it('affiche chaque produit, son prix et le lien de sa fiche', () => {
    render(FeaturedProducts, {
      featured: {
        status: 'success',
        products: [product('heliconia-rostrata'), product('anthurium-clarinervium')],
      },
      showPrice: true,
    })

    expect(screen.getAllByTestId('carousel-slide')).toHaveLength(2)
    expect(screen.getByRole('link', { name: 'heliconia-rostrata' })).toHaveAttribute(
      'href',
      '/produit/heliconia-rostrata',
    )
    expect(screen.getByTestId('home-carousel')).toHaveTextContent(/54,90\s€/)
  })

  it('n’affiche aucun prix quand la vente en ligne est coupée', () => {
    render(FeaturedProducts, {
      featured: { status: 'success', products: [product('heliconia-rostrata')] },
      showPrice: false,
    })

    expect(screen.getByTestId('home-carousel')).not.toHaveTextContent(/€/)
  })
})
