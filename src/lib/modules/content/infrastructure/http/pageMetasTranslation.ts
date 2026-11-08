import type { PageMetas } from '#lib/modules/content/domain/pageMetas'
import type { components } from '#lib/shared/api/client'

type PageMetaDto = components['schemas']['PageMeta']

const PAGE_PATHS: Record<PageMetaDto['page'], string> = {
  home: '/',
  catalog: '/catalogue',
  blog: '/blog',
  contact: '/contact',
  sitemap: '/plan-du-site',
  'legal-notice': '/mentions-legales',
  privacy: '/donnees-personnelles',
  accessibility: '/accessibilite',
}

export const toPageMetas = (dtos: PageMetaDto[]): PageMetas =>
  Object.fromEntries(
    dtos.map((dto) => [PAGE_PATHS[dto.page], { title: dto.title, description: dto.description }]),
  )
