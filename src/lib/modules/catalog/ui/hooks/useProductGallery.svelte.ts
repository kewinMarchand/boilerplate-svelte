import { onMount } from 'svelte'

const NEXT_KEYS: Record<string, number> = { ArrowRight: 1, ArrowLeft: -1 }

/** Image affichée de la galerie ; les vignettes ne deviennent des boutons qu'avec JavaScript. */
export const useProductGallery = (getCount: () => number) => {
  let current = $state(0)
  let hydrated = $state(false)
  const thumbs: HTMLButtonElement[] = $state([])

  onMount(() => {
    hydrated = true
  })

  return {
    get current() {
      return current
    },
    get hydrated() {
      return hydrated
    },
    thumbs,
    select(index: number) {
      current = index
    },
    /** Flèches gauche et droite : vignette voisine, en boucle, affichée et focalisée. */
    onKeydown(event: KeyboardEvent) {
      const step = NEXT_KEYS[event.key]
      if (step === undefined) return
      event.preventDefault()
      const count = getCount()
      current = (current + step + count) % count
      thumbs[current]?.focus()
    },
  }
}
