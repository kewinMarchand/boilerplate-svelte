import type { ImageView } from '#lib/shared/ui/kit'

export declare namespace Carousel {
  interface Slide {
    id: string
    image: ImageView | null
    title: string
    text: string
  }
}
