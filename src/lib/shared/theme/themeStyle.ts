import { THEME_COLOR_KEYS } from '#lib/shared/config'

import type { SiteTheme, ThemeColors } from '#lib/shared/config'

const declarations = (colors: ThemeColors) =>
  THEME_COLOR_KEYS.map((key) => `--bui-color-${key}:${colors[key]};`).join('')

/**
 * Feuille des couleurs de marque, mêmes sélecteurs que les jetons de boilerplates-ui précédés de `:root` : plus
 * spécifiques que les leurs, quel que soit l'ordre des feuilles. Jamais en mode renforcé, dont les couleurs AAA
 * restent celles de la bibliothèque.
 */
export const buildThemeCss = ({ light, dark }: SiteTheme) =>
  [
    `:root:not([data-a11y-mode="enhanced"]){${declarations(light)}}`,
    `:root[data-color-scheme="dark"]:not([data-a11y-mode="enhanced"]){${declarations(dark)}}`,
    `@media (prefers-color-scheme: dark){:root[data-color-scheme="auto"]:not([data-a11y-mode="enhanced"]){${declarations(dark)}}}`,
  ].join('')
