<script lang="ts">
  import { resolveHref } from '#lib/shared/routing'
  import { Button, Icon } from '#lib/shared/ui/kit'

  import { countItems } from '../domain/cart'
  import { CART_PATH } from './cartPath'
  import { useCart } from './hooks/useCart.svelte'

  const cart = useCart()
  const count = $derived(countItems(cart.lines))
</script>

<!-- Nom accessible « Panier, 3 articles » : texte visible et compléments masqués, sans aria-label (axe exige le texte affiché dans le nom). -->
<Button href={resolveHref(CART_PATH)} variant="nav" class="shrink-0" data-testid="cart-link">
  <Icon name="shopping-cart" />
  <span class="max-sm:sr-only">Panier</span>
  {#if count > 0}
    <span class="bui-visually-hidden">, </span>
    <span class="cart-count" data-testid="cart-count">{count}</span>
    <span class="bui-visually-hidden"> article{count > 1 ? 's' : ''}</span>
  {/if}
</Button>

<style>
  .cart-count {
    min-width: 1.5em;
    padding-inline: 0.35em;
    border-radius: 999px;
    background: var(--bui-color-on-primary);
    color: var(--bui-color-primary);
    font-size: var(--bui-font-size-body-sm);
    font-weight: var(--bui-font-weight-bold);
    line-height: 1.5;
    text-align: center;
  }
</style>
