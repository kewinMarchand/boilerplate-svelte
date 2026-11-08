import { toPageMetas } from './pageMetasTranslation'

describe('toPageMetas', () => {
  it('range le titre et la description de chaque page fixe sous le chemin de sa route', () => {
    expect(
      toPageMetas([
        { page: 'home', title: '', description: '' },
        { page: 'blog', title: 'Le blog', description: 'Conseils et actualités.' },
        { page: 'legal-notice', title: '', description: 'Éditeur et hébergeur.' },
      ]),
    ).toEqual({
      '/': { title: '', description: '' },
      '/blog': { title: 'Le blog', description: 'Conseils et actualités.' },
      '/mentions-legales': { title: '', description: 'Éditeur et hébergeur.' },
    })
  })
})
