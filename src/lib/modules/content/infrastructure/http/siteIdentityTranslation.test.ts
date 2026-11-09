import { toSiteIdentity } from './siteIdentityTranslation'

const TOKENS = {
  primary: '#c2410c',
  'primary-dark': '#923109',
  'on-primary': '#ffffff',
  'primary-surface-subtle': '#faf0ec',
  'primary-surface': '#f4ddd3',
  'primary-surface-strong': '#ebc2b1',
  secondary: '#0f766e',
  'secondary-dark': '#0b5852',
  'on-secondary': '#ffffff',
  'secondary-surface-subtle': '#ecf4f3',
  'secondary-surface': '#d4e6e5',
  'secondary-surface-strong': '#b2d3d1',
}

const LOGO = {
  alt: 'Oraki',
  width: 400,
  height: 120,
  sources: [{ type: 'image/webp' as const, srcset: '/logo-200.webp 200w, /logo-400.webp 400w' }],
  src: '/logo-400.webp',
}

const ICON = {
  png32: 'http://api/icon-32.png',
  png180: 'http://api/icon-180.png',
  png192: 'http://api/icon-192.png',
  png512: 'http://api/icon-512.png',
}

const SHARE_IMAGE = {
  alt: 'Serre tropicale',
  width: 1200,
  height: 630,
  sources: [{ type: 'image/webp' as const, srcset: 'http://api/share-1200.webp 1200w' }],
  src: 'http://api/share-1200.webp',
}

describe('toSiteIdentity', () => {
  it('garde la configuration du modèle : ni logo, ni image de partage, ni icône, ni couleurs', () => {
    expect(
      toSiteIdentity({
        name: 'Boilerplate',
        tagline: 'Modèle de site.',
        logo: null,
        shareImage: null,
        icon: null,
        defaultColorScheme: 'auto',
        theme: null,
        salesEnabled: true,
        locales: ['fr'],
      }),
    ).toEqual({
      name: 'Boilerplate',
      tagline: 'Modèle de site.',
      logo: null,
      shareImage: null,
      icon: null,
      defaultColorScheme: 'auto',
      theme: null,
      salesEnabled: true,
      locales: ['fr'],
    })
  })

  it('lit les langues du site, le français seul quand l’API ne les donne pas', () => {
    const dto = {
      name: 'Oraki',
      tagline: '',
      logo: null,
      shareImage: null,
      icon: null,
      defaultColorScheme: 'auto' as const,
      theme: null,
      salesEnabled: true,
    }

    expect(toSiteIdentity({ ...dto, locales: ['fr', 'en'] }).locales).toEqual(['fr', 'en'])
    // Une API antérieure aux langues (fausses API des e2e) n'envoie pas `locales`
    expect(toSiteIdentity(JSON.parse(JSON.stringify(dto))).locales).toEqual(['fr'])
  })

  it('traduit l’image de partage et les favicons', () => {
    const identity = toSiteIdentity({
      name: 'Oraki',
      tagline: '',
      logo: null,
      shareImage: SHARE_IMAGE,
      icon: ICON,
      defaultColorScheme: 'auto',
      theme: null,
      salesEnabled: true,
      locales: ['fr'],
    })

    expect(identity.shareImage).toEqual(SHARE_IMAGE)
    expect(identity.icon).toEqual(ICON)
  })

  it('traduit le logo, le thème par défaut et les jetons clair et sombre', () => {
    const dark = { ...TOKENS, primary: '#da8d6d' }

    expect(
      toSiteIdentity({
        name: 'Oraki',
        tagline: 'Plantes rares.',
        logo: LOGO,
        shareImage: null,
        icon: null,
        defaultColorScheme: 'dark',
        theme: { light: TOKENS, dark },
        salesEnabled: true,
        locales: ['fr'],
      }),
    ).toEqual({
      name: 'Oraki',
      tagline: 'Plantes rares.',
      logo: LOGO,
      shareImage: null,
      icon: null,
      defaultColorScheme: 'dark',
      theme: { light: TOKENS, dark },
      salesEnabled: true,
      locales: ['fr'],
    })
  })

  it('écarte un thème dont un jeton n’est pas une couleur #rrggbb', () => {
    const identity = toSiteIdentity({
      name: 'Oraki',
      tagline: '',
      logo: null,
      shareImage: null,
      icon: null,
      defaultColorScheme: 'auto',
      theme: { light: { ...TOKENS, primary: 'red}</style>' }, dark: TOKENS },
      salesEnabled: true,
      locales: ['fr'],
    })

    expect(identity.theme).toBeNull()
  })

  it.each([true, false])(
    'reprend la vente en ligne telle que l’API la donne (%s)',
    (salesEnabled) => {
      const identity = toSiteIdentity({
        name: 'Oraki',
        tagline: '',
        logo: null,
        shareImage: null,
        icon: null,
        defaultColorScheme: 'auto',
        theme: null,
        salesEnabled,
        locales: ['fr'],
      })

      expect(identity.salesEnabled).toBe(salesEnabled)
    },
  )
})
