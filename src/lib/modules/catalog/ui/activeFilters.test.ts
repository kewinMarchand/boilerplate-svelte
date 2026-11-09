import { en } from '#lib/shared/i18n/dictionaries/en'
import { fr } from '#lib/shared/i18n/dictionaries/fr'

import { parseCatalogQuery } from '../domain/catalogQuery'
import { listActiveFilters } from './activeFilters'

const parse = (search: string) => parseCatalogQuery(new URLSearchParams(search))

describe('filtres actifs', () => {
  it('liste une puce par filtre, chacune retirant le sien seulement', () => {
    const filters = listActiveFilters(parse('exposition=mi-ombre&taille=S&en_stock=1'), [], fr)
    expect(filters.map((filter) => filter.label)).toEqual(['Mi-ombre', 'Taille petite', 'En stock'])
    expect(filters[0]?.query.exposures).toEqual([])
    expect(filters[0]?.query.sizes).toEqual(['S'])
  })

  it('nomme la puce d’un attribut par les libellés des facettes, à défaut par ses codes', () => {
    const facets = [
      {
        code: 'feuillage',
        label: 'Feuillage',
        values: [{ value: 'caduc', label: 'Caduc', count: 2 }],
      },
    ]
    const filters = listActiveFilters(
      parse('attr-feuillage=caduc&attr-feuillage=persistant&tri=nom&page=3'),
      facets,
      fr,
    )
    expect(filters.map((filter) => filter.label)).toEqual([
      'Feuillage : Caduc',
      'Feuillage : persistant',
    ])
    expect(filters[0]?.query).toMatchObject({
      attributes: { feuillage: ['persistant'] },
      sort: 'nom',
      page: 1,
    })
  })

  it('nomme les puces dans la langue du dictionnaire', () => {
    const filters = listActiveFilters(parse('exposition=mi-ombre&taille=S&prix_min=10'), [], en)
    expect(filters.map((filter) => filter.label)).toEqual([
      'Partial shade',
      'Size small',
      'Min. price €10',
    ])
  })
})
