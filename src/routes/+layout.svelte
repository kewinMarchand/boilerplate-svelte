<script lang="ts">
  import { onMount } from 'svelte'

  import { Providers } from '#lib/shared/providers'
  import { initImageFallback } from '#lib/shared/ui/kit'
  import { AppShell } from '#lib/shared/ui/layout'

  import { CartLink } from '#lib/modules/cart'

  const { data, children } = $props()

  onMount(() => initImageFallback())
</script>

<Providers>
  <AppShell categoryMenu={data.categoryMenu} identity={data.siteIdentity}>
    {#snippet cartLink()}
      {#if data.siteIdentity.salesEnabled}
        <CartLink />
      {/if}
    {/snippet}
    {@render children()}
  </AppShell>
</Providers>
