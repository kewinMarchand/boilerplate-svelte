<script lang="ts">
  import { ProductView } from '#lib/modules/catalog'

  const { data } = $props()
</script>

<ProductView product={data.product} />
