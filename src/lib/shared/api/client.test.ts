import { querySerializer } from './client'

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
