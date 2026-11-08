<script lang="ts">
  import { AddToCartButton } from '#lib/modules/cart'
  import { ProductView } from '#lib/modules/catalog'

  const { data } = $props()
</script>

<ProductView product={data.product} similarProducts={data.similarProducts}>
  {#snippet purchase(product)}
    <AddToCartButton
      item={{ slug: product.slug, name: product.name, price: product.price }}
      isAvailable={product.inStock}
    />
  {/snippet}
</ProductView>
