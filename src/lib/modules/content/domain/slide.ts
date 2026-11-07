import type { ImageView } from '#lib/shared/ui/kit'

export declare namespace Slide {
  interface Entity {
    id: string
    image: ImageView | null
    title: string
    text: string
  }

  type Featured = { status: 'success'; slides: Entity[] } | { status: 'error'; message: string }
}
