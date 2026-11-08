import type { Article } from '#lib/modules/blog/domain/article'
import type { components } from '#lib/shared/api/client'

type ArticleDto = components['schemas']['Article']
type ArticleDetailDto = components['schemas']['ArticleDetail']
type ArticleTermDto = components['schemas']['ArticleTerm']

const toTerm = (dto: ArticleTermDto): Article.Term => ({ slug: dto.slug, name: dto.name })

export const toArticle = (dto: ArticleDto): Article.Entity => ({
  id: String(dto.id),
  slug: dto.slug,
  title: dto.title,
  excerpt: dto.excerpt,
  image: dto.image,
  publishedAt: dto.publishedAt,
  section: dto.section && toTerm(dto.section),
})

export const toArticleDetail = (dto: ArticleDetailDto): Article.Detail => ({
  ...toArticle(dto),
  html: dto.html,
  format: dto.format && toTerm(dto.format),
  audio: dto.audio && {
    src: dto.audio.src,
    type: dto.audio.type,
    durationSeconds: dto.audio.durationSeconds,
  },
  speaker: dto.speaker,
  metaTitle: dto.metaTitle,
  metaDescription: dto.metaDescription,
})

export const toSections = (dtos: ArticleTermDto[]): Article.Term[] => dtos.map(toTerm)
