import type { Slide } from '#lib/modules/content/domain/slide'
import type { components } from '#lib/shared/api/client'

type SlideDto = components['schemas']['Slide']

export const toSlide = (dto: SlideDto): Slide.Entity => ({
  id: dto.slug,
  imageBasePath: `/images/slide-${dto.image}`,
  title: dto.title,
  text: dto.text,
})
