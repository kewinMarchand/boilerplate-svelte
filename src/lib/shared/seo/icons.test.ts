import { buildIconLinks } from './icons'

describe('buildIconLinks', () => {
  it('garde les favicons du site sans icône saisie', () => {
    const links = buildIconLinks(null)

    expect(links).toContain('href="/favicon.ico"')
    expect(links).toContain('href="/favicon.svg"')
    expect(links).toContain('<link rel="apple-touch-icon" href="/apple-touch-icon.png" />')
  })

  it('pointe le favicon 32 px et l’icône Apple 180 px vers l’icône saisie, attributs échappés', () => {
    const links = buildIconLinks({
      png32: 'http://api/icon-32.png?a=1&b="2"',
      png180: 'http://api/icon-180.png',
      png192: 'http://api/icon-192.png',
      png512: 'http://api/icon-512.png',
    })

    expect(links).toContain(
      '<link rel="icon" type="image/png" sizes="32x32" href="http://api/icon-32.png?a=1&amp;b=&quot;2&quot;" />',
    )
    expect(links).toContain('<link rel="apple-touch-icon" href="http://api/icon-180.png" />')
    expect(links).not.toContain('favicon')
  })
})
