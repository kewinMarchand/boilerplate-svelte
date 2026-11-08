<script lang="ts">
  import { Providers } from '#lib/shared/providers'
  import { AppShell } from '#lib/shared/ui/layout'

  import { CartLink } from '#lib/modules/cart'

  const { data, children } = $props()
</script>

<Providers>
  <AppShell categoryMenu={data.categoryMenu} identity={data.siteIdentity}>
    {#snippet cartLink()}
      <CartLink />
    {/snippet}
    {@render children()}
  </AppShell>
</Providers>
