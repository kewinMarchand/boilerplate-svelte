import { SITE } from '#lib/shared/config'
import { localizePath, ogLocale } from '#lib/shared/i18n'
import { largestWebp } from '#lib/shared/ui/kit/image'

import type { Seo } from './seo'
import type { SiteIdentity } from '#lib/shared/config'
import type { LocaleContext } from '#lib/shared/i18n'

export const DEFAULT_SHARE_IMAGE: Seo.Image = {
  path: '/og-image.jpg',
  width: 1200,
  height: 630,
  alt: 'Jardin tropical, illustration du site',
}

export const absoluteUrl = (path: string) => new URL(path, SITE.url).href

/** Adresse absolue d'un chemin sans préfixe, dans la langue de la page. */
export const localizedUrl = (path: string, { locale, defaultLocale }: LocaleContext) =>
  absoluteUrl(localizePath(path, locale, defaultLocale))

export const buildBreadcrumbJsonLd = (
  items: Seo.BreadcrumbItem[],
  locale: LocaleContext,
): Seo.JsonLd => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.label,
    item: localizedUrl(item.path, locale),
  })),
})

/** Logo de l'organisation : l'icône 512 px saisie dans l'admin, sinon celle du site. */
export const buildHomeJsonLd = (
  { name: siteName, icon }: Pick<SiteIdentity, 'name' | 'icon'>,
  locale: LocaleContext,
  languageTag: string,
): Seo.JsonLd[] => [
  {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: siteName,
    url: localizedUrl('/', locale),
    logo: icon?.png512 ?? absoluteUrl('/icon-512.png'),
    email: SITE.publisher.email,
  },
  {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteName,
    url: localizedUrl('/', locale),
    inLanguage: languageTag,
  },
]

/** `hreflang` de chaque langue où la page existe, plus `x-default` vers la langue par défaut (site multilingue). */
const buildHreflang = ({ locale, alternates }: Seo.Languages) => {
  if (locale.locales.length < 2) return []
  const links = alternates.map((alternate) => ({
    hreflang: alternate.locale,
    href: localizedUrl(alternate.path, { ...locale, locale: alternate.locale }),
  }))
  const fallback = links.find((link) => link.hreflang === locale.defaultLocale)
  return fallback ? [...links, { ...fallback, hreflang: 'x-default' }] : links
}

/** Image de partage par défaut : celle de l'identité du site si l'admin en a saisi une, sinon celle du site. */
const defaultShareImage = ({
  name,
  shareImage,
}: Pick<SiteIdentity, 'name' | 'shareImage'>): Seo.Image =>
  shareImage
    ? {
        path: largestWebp(shareImage),
        width: shareImage.width,
        height: shareImage.height,
        alt: shareImage.alt || name,
      }
    : DEFAULT_SHARE_IMAGE

export const buildPageMeta = (
  input: Seo.Input,
  identity: Pick<SiteIdentity, 'name' | 'shareImage'>,
  languages: Seo.Languages,
): Seo.Meta => {
  const { locale } = languages
  const siteName = identity.name
  const image = input.image ?? defaultShareImage(identity)
  const breadcrumbJsonLd = input.breadcrumb ? [buildBreadcrumbJsonLd(input.breadcrumb, locale)] : []
  const hreflang = buildHreflang(languages)

  return {
    title: input.metaTitle || (input.title ? `${input.title} · ${siteName}` : siteName),
    description: input.metaDescription || input.description,
    canonical: localizedUrl(input.canonicalPath ?? input.path, locale),
    robots: input.noindex ? 'noindex, follow' : 'index, follow',
    siteName,
    locale: ogLocale(locale.locale),
    alternateLocales: hreflang
      .map((link) => link.hreflang)
      .filter((code) => code !== 'x-default' && code !== locale.locale)
      .map(ogLocale),
    hreflang,
    ogTitle: input.metaTitle || (input.title ?? siteName),
    image: { ...image, url: absoluteUrl(image.path) },
    jsonLd: [...breadcrumbJsonLd, ...(input.jsonLd ?? [])],
    prev: input.prevPath && localizedUrl(input.prevPath, locale),
    next: input.nextPath && localizedUrl(input.nextPath, locale),
    ogType: input.publishedTime ? 'article' : 'website',
    publishedTime: input.publishedTime,
  }
}
