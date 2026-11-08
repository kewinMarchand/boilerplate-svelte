<script lang="ts">
  import { AddToCartButton } from '#lib/modules/cart'
  import { ProductView } from '#lib/modules/catalog'
  import { InquiryLink } from '#lib/modules/contact'

  const { data } = $props()
</script>

<ProductView
  product={data.product}
  similarProducts={data.similarProducts}
  salesEnabled={data.siteIdentity.salesEnabled}
>
  {#snippet purchase(product)}
    {#if data.siteIdentity.salesEnabled}
      <AddToCartButton
        item={{ slug: product.slug, name: product.name, price: product.price }}
        isAvailable={product.inStock}
      />
    {:else}
      <InquiryLink slug={product.slug} name={product.name} />
    {/if}
  {/snippet}
</ProductView>
