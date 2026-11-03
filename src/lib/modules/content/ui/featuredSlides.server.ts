import { findSlides } from '../infrastructure/slideRepository'
import { SlidesLoadError } from '../infrastructure/SlidesLoadError'

import type { Slide } from '../domain/slide'

export const loadFeaturedSlides = async () => {
  try {
    const slides: Slide.Featured = { status: 'success', slides: await findSlides() }
    return { slides }
  } catch {
    const slides: Slide.Featured = { status: 'error', message: new SlidesLoadError().message }
    return { slides }
  }
}
