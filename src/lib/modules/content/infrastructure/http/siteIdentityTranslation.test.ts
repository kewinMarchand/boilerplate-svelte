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

describe('toSiteIdentity', () => {
  it('garde la configuration du modèle : ni logo ni couleurs', () => {
    expect(
      toSiteIdentity({
        name: 'Boilerplate',
        tagline: 'Modèle de site.',
        logo: null,
        defaultColorScheme: 'auto',
        theme: null,
      }),
    ).toEqual({
      name: 'Boilerplate',
      tagline: 'Modèle de site.',
      logo: null,
      defaultColorScheme: 'auto',
      theme: null,
    })
  })

  it('traduit le logo, le thème par défaut et les jetons clair et sombre', () => {
    const dark = { ...TOKENS, primary: '#da8d6d' }

    expect(
      toSiteIdentity({
        name: 'Oraki',
        tagline: 'Plantes rares.',
        logo: LOGO,
        defaultColorScheme: 'dark',
        theme: { light: TOKENS, dark },
      }),
    ).toEqual({
      name: 'Oraki',
      tagline: 'Plantes rares.',
      logo: LOGO,
      defaultColorScheme: 'dark',
      theme: { light: TOKENS, dark },
    })
  })

  it('écarte un thème dont un jeton n’est pas une couleur #rrggbb', () => {
    const identity = toSiteIdentity({
      name: 'Oraki',
      tagline: '',
      logo: null,
      defaultColorScheme: 'auto',
      theme: { light: { ...TOKENS, primary: 'red}</style>' }, dark: TOKENS },
    })

    expect(identity.theme).toBeNull()
  })
})
