import { THEME_COLOR_KEYS } from '#lib/shared/config'

import { buildThemeCss } from './themeStyle'

import type { ThemeColors } from '#lib/shared/config'

const colors = (value: string) =>
  Object.fromEntries(THEME_COLOR_KEYS.map((key) => [key, value])) as ThemeColors

describe('buildThemeCss', () => {
  const css = buildThemeCss({ light: colors('#c2410c'), dark: colors('#da8d6d') })

  it('redéfinit les douze jetons en clair, hors mode renforcé', () => {
    expect(css).toContain(':root:not([data-a11y-mode="enhanced"]){--bui-color-primary:#c2410c;')
    expect(css.match(/#c2410c/g)).toHaveLength(12)
  })

  it('redéfinit les jetons sombres pour le sombre forcé et pour « auto » en sombre', () => {
    expect(css).toContain(
      ':root[data-color-scheme="dark"]:not([data-a11y-mode="enhanced"]){--bui-color-primary:#da8d6d;',
    )
    expect(css).toContain(
      '@media (prefers-color-scheme: dark){:root[data-color-scheme="auto"]:not([data-a11y-mode="enhanced"]){--bui-color-primary:#da8d6d;',
    )
    expect(css.match(/#da8d6d/g)).toHaveLength(24)
  })
})
