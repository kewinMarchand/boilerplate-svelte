<script lang="ts">
  import { ImageCarousel } from '#lib/shared/ui/carousel'
  import { Alert } from '#lib/shared/ui/kit'

  import { productHref } from '../domain/catalog'
  import { formatPrice } from '../domain/price'

  import type { Catalog } from '../domain/catalog'

  interface Props {
    featured: Catalog.Featured
    showPrice: boolean
  }

  const { featured, showPrice }: Props = $props()

  const titleId = $props.id()
  const slides = $derived(
    featured.status === 'success'
      ? featured.products.map((product) => ({
          id: product.id,
          title: product.name,
          ...(showPrice && { text: formatPrice(product.price) }),
          image: product.image,
          href: productHref(product.slug),
        }))
      : [],
  )
</script>

{#if featured.status === 'error'}
  <Alert variant="error" data-testid="home-carousel-error">{featured.message}</Alert>
{:else if slides.length}
  <section aria-labelledby={titleId} data-testid="home-carousel">
    <h2 id={titleId} class="section-title">À la une</h2>
    <ImageCarousel {slides} label="À la une" />
  </section>
{/if}
