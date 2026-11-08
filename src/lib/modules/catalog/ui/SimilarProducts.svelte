<script lang="ts">
  import { ImageCarousel } from '#lib/shared/ui/carousel'

  import { productHref } from '../domain/catalog'
  import { formatPrice } from '../domain/price'

  import type { Catalog } from '../domain/catalog'

  interface Props {
    products: Catalog.Product[]
    showPrice: boolean
  }

  const { products, showPrice }: Props = $props()

  const titleId = $props.id()
  const slides = $derived(
    products.map((product) => ({
      id: product.id,
      title: product.name,
      ...(showPrice && { text: formatPrice(product.price) }),
      image: product.image,
      href: productHref(product.slug),
    })),
  )
</script>

<section aria-labelledby={titleId} class="mt-12" data-testid="product-similar">
  <h2 id={titleId} class="section-title">Produits similaires</h2>
  <ImageCarousel {slides} label="Produits similaires" />
</section>
