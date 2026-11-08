<script lang="ts">
  import { resolveHref } from '#lib/shared/routing'
  import { Button } from '#lib/shared/ui/kit'

  import { CART_PATH } from './cartPath'
  import { useCart } from './hooks/useCart.svelte'

  import type { Cart } from '../domain/cart'

  interface Props {
    item: Cart.Item
    isAvailable: boolean
  }

  const { item, isAvailable }: Props = $props()

  const cart = useCart()
  let isAdded = $state(false)

  const add = () => {
    cart.add(item)
    isAdded = true
  }
</script>

<!-- Absent sans JavaScript : le panier en dépend. -->
{#if cart.hydrated}
  <div class="mb-6">
    <Button disabled={!isAvailable} onclick={add} data-testid="add-to-cart">
      Ajouter au panier
    </Button>
    <p role="status" class="mt-2" data-testid="add-to-cart-status">
      {#if isAdded}
        {item.name} ajouté au panier.
        <a href={resolveHref(CART_PATH)} class="bui-link">Voir le panier</a>
      {/if}
    </p>
  </div>
{/if}
