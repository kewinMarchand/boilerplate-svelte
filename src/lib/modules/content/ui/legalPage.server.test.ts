import { findLegalPage } from '../infrastructure/legalPageRepository'
import { loadLegalPage } from './legalPage.server'

vi.mock('../infrastructure/legalPageRepository', () => ({ findLegalPage: vi.fn() }))

const PAGE = { title: 'Mentions légales', introduction: '', sections: [] }

describe('loadLegalPage', () => {
  it('renvoie la page lue dans l’API', async () => {
    vi.mocked(findLegalPage).mockResolvedValueOnce(PAGE)

    expect(await loadLegalPage('mentions-legales')).toEqual({ status: 'success', page: PAGE })
    expect(findLegalPage).toHaveBeenCalledWith('mentions-legales')
  })

  it('déclare introuvable une page que l’API ne connaît pas', async () => {
    vi.mocked(findLegalPage).mockResolvedValueOnce(null)

    expect(await loadLegalPage('accessibilite')).toEqual({ status: 'not-found' })
  })

  it('transforme un échec du dépôt en message d’erreur affichable', async () => {
    vi.mocked(findLegalPage).mockRejectedValueOnce(new Error('panne'))

    expect(await loadLegalPage('donnees-personnelles')).toEqual({
      status: 'error',
      message: 'Impossible de charger cette page pour le moment. Réessayez dans quelques minutes.',
    })
  })
})
