<script lang="ts">
  import { tick } from 'svelte'

  import { resolveHref } from '#lib/shared/routing'
  import { Button } from '#lib/shared/ui/kit'
  import { PageHeader } from '#lib/shared/ui/layout'

  import { MAX_QUANTITY, totalPrice } from '../domain/cart'
  import { formatPrice } from '../domain/price'
  import { useCart } from './hooks/useCart.svelte'

  import type { AppPath } from '#lib/shared/routing'

  const CATALOG_PATH: AppPath = '/catalogue'
  const productHref = (slug: string): AppPath => `/produit/${slug}`

  const cart = useCart()

  let list: HTMLUListElement | null = null
  let empty: HTMLParagraphElement | null = null

  // Sans cela, le focus retombe en haut de la page après un retrait
  const remove = async (slug: string, index: number) => {
    cart.remove(slug)
    await tick()
    const buttons = list?.querySelectorAll<HTMLButtonElement>(':scope > li button')
    const target = buttons?.[Math.min(index, cart.lines.length - 1)] ?? empty
    target?.focus()
  }

  const changeQuantity = (slug: string, event: Event & { currentTarget: HTMLInputElement }) => {
    const quantity = event.currentTarget.valueAsNumber
    if (!Number.isNaN(quantity)) cart.changeQuantity(slug, quantity)
  }
</script>

<PageHeader
  title="Panier"
  description="Votre panier : les produits choisis, leurs quantités et le total, gardés dans ce navigateur."
  seo={{ noindex: true }}
/>
<noscript><p>Le panier demande JavaScript.</p></noscript>

<!-- Le panier n'existe que dans le navigateur : il est lu après l'hydratation. -->
{#if cart.hydrated}
  {#if cart.lines.length === 0}
    <p bind:this={empty} tabindex="-1" data-testid="cart-empty">
      Votre panier est vide.
      <a href={resolveHref(CATALOG_PATH)} class="bui-link">Parcourir le catalogue</a>
    </p>
  {:else}
    <ul bind:this={list} class="grid gap-4">
      {#each cart.lines as line, index (line.slug)}
        <li class="cart-line" data-testid="cart-line">
          <a href={resolveHref(productHref(line.slug))} class="bui-link font-semibold">
            {line.name}
          </a>
          <span>{formatPrice(line.price)} l’unité</span>
          <label class="bui-field">
            <span class="bui-field__label">Quantité de {line.name}</span>
            <input
              type="number"
              min="1"
              max={MAX_QUANTITY}
              value={line.quantity}
              oninput={(event) => changeQuantity(line.slug, event)}
              class="bui-field__input"
              data-testid="cart-quantity"
            />
          </label>
          <span class="font-semibold">{formatPrice(line.price * line.quantity)}</span>
          <Button
            variant="outline"
            aria-label={`Retirer ${line.name}`}
            onclick={() => remove(line.slug, index)}
            data-testid="cart-remove"
          >
            Retirer
          </Button>
        </li>
      {/each}
    </ul>
    <p class="mt-6 mb-2 text-title font-semibold">
      Total : <span data-testid="cart-total">{formatPrice(totalPrice(cart.lines))}</span>
    </p>
    <p>La commande en ligne arrive bientôt.</p>
  {/if}
{/if}

<style>
  .cart-line {
    display: grid;
    gap: var(--bui-space-2);
    align-items: center;
    padding-block-end: var(--bui-space-4);
    border-block-end: 1px solid var(--bui-color-border);
  }

  @media (min-width: 768px) {
    .cart-line {
      grid-template-columns: minmax(0, 2fr) minmax(0, 1fr) 12rem minmax(0, 1fr) auto;
    }
  }
</style>
