<script lang="ts">
  import { largestWebp, ResponsiveImage } from '#lib/shared/ui/kit'

  import { useProductGallery } from './hooks/useProductGallery.svelte'

  import type { ImageView } from '#lib/shared/ui/kit'

  interface Props {
    /** Image principale puis images de la galerie, dans l'ordre. */
    images: ImageView[]
    sizes: string
  }

  const { images, sizes }: Props = $props()

  const THUMB_SIZES = '80px'
  const gallery = useProductGallery(() => images.length)
  const displayed = $derived(images[gallery.current] ?? images[0])
  const thumbLabel = (index: number) => `Voir l'image ${index + 1} sur ${images.length}`
</script>

<div data-testid="product-gallery">
  {#if displayed}
    {#key gallery.current}
      <ResponsiveImage
        image={displayed}
        {sizes}
        priority={gallery.current === 0}
        eager
        fallback
        pictureClass="rounded-md"
        class="aspect-square h-auto w-full rounded-md object-cover"
      />
    {/key}
  {/if}
  <ul class="mt-4 flex flex-wrap gap-2">
    {#each images as image, index (index)}
      <li>
        {#if gallery.hydrated}
          <button
            type="button"
            bind:this={gallery.thumbs[index]}
            class="gallery-thumb"
            aria-label={thumbLabel(index)}
            aria-current={index === gallery.current ? 'true' : undefined}
            onclick={() => gallery.select(index)}
            onkeydown={gallery.onKeydown}
            data-testid="product-gallery-thumb"
          >
            <ResponsiveImage
              image={{ ...image, alt: '' }}
              sizes={THUMB_SIZES}
              fallback
              pictureClass="h-full"
              class="size-full"
            />
          </button>
        {:else}
          <a
            href={largestWebp(image)}
            rel="external"
            class="gallery-thumb"
            aria-label={thumbLabel(index)}
            aria-current={index === 0 ? 'true' : undefined}
            data-testid="product-gallery-thumb"
          >
            <ResponsiveImage
              image={{ ...image, alt: '' }}
              sizes={THUMB_SIZES}
              fallback
              pictureClass="h-full"
              class="size-full"
            />
          </a>
        {/if}
      </li>
    {/each}
  </ul>
</div>

<style>
  .gallery-thumb {
    display: block;
    overflow: hidden;
    inline-size: 4.5rem;
    block-size: 4.5rem;
    border: 2px solid transparent;
    border-radius: var(--bui-radius-md);
  }

  .gallery-thumb[aria-current='true'] {
    border-color: var(--bui-color-primary);
  }

  .gallery-thumb :global(img) {
    object-fit: cover;
  }
</style>
