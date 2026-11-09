import { createApiClient, querySerializer } from './client'

describe('querySerializer', () => {
  it('répète la clé de chaque valeur, objets de listes compris', () => {
    expect(
      decodeURIComponent(
        querySerializer({
          'exposure[]': ['soleil', 'ombre'],
          attributes: { feuillage: ['persistant', 'caduc'] },
          page: 2,
        }),
      ),
    ).toBe(
      'exposure[]=soleil&exposure[]=ombre&attributes[feuillage][]=persistant&attributes[feuillage][]=caduc&page=2',
    )
  })
})

describe('createApiClient', () => {
  const fakeFetch = () => {
    const requests: Request[] = []
    const fetch = vi.fn(async (request: Request) => {
      requests.push(request)
      return Response.json([])
    })
    return { fetch: fetch as unknown as typeof globalThis.fetch, requests }
  }

  it('passe la langue de la page à chaque lecture, pas à un envoi', async () => {
    const { fetch, requests } = fakeFetch()
    const client = createApiClient(fetch, null, 'en')

    await client.GET('/api/tasks')
    await client.POST('/api/contact_messages', {
      body: { name: 'Ada', email: 'ada@exemple.fr', message: 'Bonjour à tous', product: null },
    })

    expect(new URL(requests[0]!.url).searchParams.get('locale')).toBe('en')
    expect(new URL(requests[1]!.url).searchParams.has('locale')).toBe(false)
  })

  it('n’ajoute aucun paramètre sans langue', async () => {
    const { fetch, requests } = fakeFetch()

    await createApiClient(fetch).GET('/api/tasks')

    expect(new URL(requests[0]!.url).search).toBe('')
  })
})
