<script lang="ts">
  import type { ImageView } from './image'

  interface Props {
    image: ImageView
    sizes: string
    priority?: boolean
    eager?: boolean
    fetchPriority?: 'high' | 'low' | 'auto'
    class?: string
  }

  const {
    image,
    sizes,
    priority = false,
    eager = false,
    fetchPriority = priority ? 'high' : 'auto',
    class: className,
  }: Props = $props()

  const preload = $derived(image.sources[0])
</script>

<svelte:head>
  {#if priority && preload}
    <link
      rel="preload"
      as="image"
      type={preload.type}
      imagesrcset={preload.srcset}
      imagesizes={sizes}
      fetchpriority="high"
    />
  {/if}
</svelte:head>

<picture>
  {#each image.sources as source (source.type)}
    <source type={source.type} srcset={source.srcset} {sizes} />
  {/each}
  <img
    src={image.src}
    alt={image.alt}
    width={image.width}
    height={image.height}
    loading={priority || eager ? 'eager' : 'lazy'}
    fetchpriority={fetchPriority}
    decoding={priority ? 'sync' : 'async'}
    class={className}
  />
</picture>
