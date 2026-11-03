import { findSlides } from '../infrastructure/slideRepository'
import { loadFeaturedSlides } from './featuredSlides.server'

vi.mock('../infrastructure/slideRepository', () => ({ findSlides: vi.fn() }))

const SLIDE = {
  id: 'heliconia',
  imageBasePath: '/images/slide-1',
  title: 'Heliconia',
  text: 'Rouge.',
}

describe('loadFeaturedSlides', () => {
  it('renvoie les diapositives de l’API', async () => {
    vi.mocked(findSlides).mockResolvedValueOnce([SLIDE])

    expect(await loadFeaturedSlides()).toEqual({ slides: { status: 'success', slides: [SLIDE] } })
  })

  it('transforme un échec du dépôt en message d’erreur affichable', async () => {
    vi.mocked(findSlides).mockRejectedValueOnce(new Error('panne'))

    expect(await loadFeaturedSlides()).toEqual({
      slides: { status: 'error', message: 'Impossible de charger le carrousel pour le moment.' },
    })
  })
})
