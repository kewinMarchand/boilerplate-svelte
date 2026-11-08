<script lang="ts">
  import { CatalogView } from '#lib/modules/catalog'

  const { data } = $props()
</script>

<CatalogView
  query={data.query}
  result={data.result}
  salesEnabled={data.siteIdentity.salesEnabled}
/>
