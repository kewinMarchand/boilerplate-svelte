<script lang="ts">
  import { useDictionary } from '#lib/shared/i18n'
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

  const t = useDictionary()
  const titleId = $props.id()
  const slides = $derived(
    featured.status === 'success'
      ? featured.products.map((product) => ({
          id: product.id,
          title: product.name,
          ...(showPrice && { text: formatPrice(product.price, t.language.tag) }),
          image: product.image,
          href: productHref(product.slug),
        }))
      : [],
  )
</script>

{#if featured.status === 'error'}
  <Alert variant="error" data-testid="home-carousel-error">{t.catalog.featuredError}</Alert>
{:else if slides.length}
  <section aria-labelledby={titleId} data-testid="home-carousel">
    <h2 id={titleId} class="section-title">{t.catalog.featured}</h2>
    <ImageCarousel {slides} label={t.catalog.featured} />
  </section>
{/if}
