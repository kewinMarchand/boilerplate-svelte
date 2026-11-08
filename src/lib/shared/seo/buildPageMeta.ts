import { SITE } from '#lib/shared/config'
import { largestWebp } from '#lib/shared/ui/kit/image'

import type { Seo } from './seo'
import type { SiteIdentity } from '#lib/shared/config'

export const DEFAULT_SHARE_IMAGE: Seo.Image = {
  path: '/og-image.jpg',
  width: 1200,
  height: 630,
  alt: 'Jardin tropical, illustration du site',
}

export const absoluteUrl = (path: string) => new URL(path, SITE.url).href

export const buildBreadcrumbJsonLd = (items: Seo.BreadcrumbItem[]): Seo.JsonLd => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.label,
    item: absoluteUrl(item.path),
  })),
})

/** Logo de l'organisation : l'icône 512 px saisie dans l'admin, sinon celle du site. */
export const buildHomeJsonLd = ({
  name: siteName,
  icon,
}: Pick<SiteIdentity, 'name' | 'icon'>): Seo.JsonLd[] => [
  {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: siteName,
    url: absoluteUrl('/'),
    logo: icon?.png512 ?? absoluteUrl('/icon-512.png'),
    email: SITE.publisher.email,
  },
  {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteName,
    url: absoluteUrl('/'),
    inLanguage: 'fr-FR',
  },
]

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
): Seo.Meta => {
  const siteName = identity.name
  const image = input.image ?? defaultShareImage(identity)
  const breadcrumbJsonLd = input.breadcrumb ? [buildBreadcrumbJsonLd(input.breadcrumb)] : []

  return {
    title: input.metaTitle || (input.title ? `${input.title} · ${siteName}` : siteName),
    description: input.metaDescription || input.description,
    canonical: absoluteUrl(input.canonicalPath ?? input.path),
    robots: input.noindex ? 'noindex, follow' : 'index, follow',
    siteName,
    locale: SITE.locale,
    ogTitle: input.metaTitle || (input.title ?? siteName),
    image: { ...image, url: absoluteUrl(image.path) },
    jsonLd: [...breadcrumbJsonLd, ...(input.jsonLd ?? [])],
    prev: input.prevPath && absoluteUrl(input.prevPath),
    next: input.nextPath && absoluteUrl(input.nextPath),
    ogType: input.publishedTime ? 'article' : 'website',
    publishedTime: input.publishedTime,
  }
}
