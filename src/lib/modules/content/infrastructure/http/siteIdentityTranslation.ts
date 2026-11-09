import type { SiteIdentity } from '#lib/modules/content/domain/siteIdentity'
import type { components } from '#lib/shared/api/client'

type SiteIdentityDto = components['schemas']['SiteIdentity']
type ThemeTokensDto = components['schemas']['ThemeTokens']

// Les jetons sont injectés tels quels dans un bloc <style> : rien d'autre qu'une couleur #rrggbb n'y entre.
const isHexColors = (tokens: ThemeTokensDto) =>
  Object.values(tokens).every((value) => /^#[0-9a-f]{6}$/i.test(value))

export const toSiteIdentity = (dto: SiteIdentityDto): SiteIdentity => ({
  name: dto.name,
  tagline: dto.tagline,
  logo: dto.logo,
  shareImage: dto.shareImage,
  icon: dto.icon && {
    png32: dto.icon.png32,
    png180: dto.icon.png180,
    png192: dto.icon.png192,
    png512: dto.icon.png512,
  },
  defaultColorScheme: dto.defaultColorScheme,
  theme:
    dto.theme && isHexColors(dto.theme.light) && isHexColors(dto.theme.dark)
      ? { light: dto.theme.light, dark: dto.theme.dark }
      : null,
  salesEnabled: dto.salesEnabled,
  // Absente d'une API antérieure aux langues (section 29) : site monolingue en français
  locales: dto.locales ?? ['fr'],
})
