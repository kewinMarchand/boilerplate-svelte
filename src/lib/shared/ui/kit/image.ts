/** Forme de l'objet `image` du contrat de l'API : variantes AVIF puis WebP, adresses prêtes à poser. */
export interface ImageView {
  alt: string
  width: number
  height: number
  sources: { type: string; srcset: string }[]
  src: string
}

/** Image livrée par le site lui-même : `/images/hero` et ses variantes `/images/hero-640.avif`, etc. */
export const staticImage = (
  basePath: string,
  widths: number[],
  { width, height, alt }: Pick<ImageView, 'width' | 'height' | 'alt'>,
): ImageView => {
  const srcset = (format: string) =>
    widths.map((w) => `${basePath}-${w}.${format} ${w}w`).join(', ')
  return {
    alt,
    width,
    height,
    sources: [
      { type: 'image/avif', srcset: srcset('avif') },
      { type: 'image/webp', srcset: srcset('webp') },
    ],
    src: `${basePath}-${widths.at(-1)}.webp`,
  }
}

/** Adresse de la plus grande variante WebP, aux dimensions `width` × `height` de l'image (partage social). */
export const largestWebp = (image: ImageView) =>
  image.sources
    .find((source) => source.type === 'image/webp')
    ?.srcset.split(', ')
    .at(-1)
    ?.split(' ')[0] ?? image.src
