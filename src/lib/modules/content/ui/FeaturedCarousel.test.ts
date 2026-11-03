import { render, screen } from '@testing-library/svelte'

import FeaturedCarousel from './FeaturedCarousel.svelte'

// Embla demande matchMedia, absent de jsdom : la piste reste celle du rendu sans JavaScript
vi.mock('embla-carousel-svelte', () => ({ default: () => {} }))

const SLIDES = [
  { id: 'heliconia', imageBasePath: '/images/slide-1', title: 'Heliconia', text: 'Rouge.' },
  { id: 'anthurium', imageBasePath: '/images/slide-2', title: 'Anthurium', text: 'Vernissé.' },
]

describe('FeaturedCarousel', () => {
  it("affiche le message d'erreur à la place du carrousel", () => {
    render(FeaturedCarousel, { slides: { status: 'error', message: 'Oups' } })

    expect(screen.getByTestId('home-carousel-error')).toHaveTextContent('Oups')
    expect(screen.queryByTestId('home-carousel')).not.toBeInTheDocument()
  })

  it("n'affiche pas la section sans diapositive", () => {
    render(FeaturedCarousel, { slides: { status: 'success', slides: [] } })

    expect(screen.queryByTestId('home-carousel')).not.toBeInTheDocument()
    expect(screen.queryByTestId('home-carousel-error')).not.toBeInTheDocument()
  })

  it('affiche chaque diapositive dans le carrousel', () => {
    render(FeaturedCarousel, { slides: { status: 'success', slides: SLIDES } })

    expect(screen.getByTestId('home-carousel')).toBeInTheDocument()
    expect(screen.getAllByTestId('carousel-slide')).toHaveLength(2)
    expect(screen.queryByTestId('home-carousel-error')).not.toBeInTheDocument()
  })
})
