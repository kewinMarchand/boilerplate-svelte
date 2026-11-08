import { FALLBACK_IDENTITY } from '#lib/shared/config'

import { findSiteIdentity } from '../infrastructure/siteIdentityRepository'
import { loadSiteIdentity } from './siteIdentity.server'

vi.mock('../infrastructure/siteIdentityRepository', () => ({ findSiteIdentity: vi.fn() }))

describe('loadSiteIdentity', () => {
  it('renvoie l’identité lue dans l’API', async () => {
    const identity = { ...FALLBACK_IDENTITY, name: 'Oraki' }
    vi.mocked(findSiteIdentity).mockResolvedValueOnce(identity)

    expect(await loadSiteIdentity()).toEqual(identity)
  })

  it('retombe sur la configuration du site si l’API ne répond pas', async () => {
    vi.mocked(findSiteIdentity).mockRejectedValueOnce(new Error('panne'))

    expect(await loadSiteIdentity()).toEqual(FALLBACK_IDENTITY)
  })

  it('garde la vente en ligne active dans le repli', () => {
    expect(FALLBACK_IDENTITY.salesEnabled).toBe(true)
  })
})
