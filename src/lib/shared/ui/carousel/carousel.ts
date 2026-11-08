import type { AppPath } from '#lib/shared/routing'
import type { ImageView } from '#lib/shared/ui/kit'

export declare namespace Carousel {
  interface Slide {
    id: string
    image: ImageView | null
    title: string
    /** Absent : aucune ligne sous le titre. */
    text?: string
    /** Destination de la diapositive : son titre devient un lien étiré sur toute la diapositive. */
    href?: AppPath
  }
}
