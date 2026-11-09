<script lang="ts">
  import { tick } from 'svelte'

  import { format, useDictionary } from '#lib/shared/i18n'
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
  const t = useDictionary()
  const price = (cents: number) => formatPrice(cents, t.language.tag)

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

<PageHeader title={t.cart.title} description={t.cart.description} seo={{ noindex: true }} />
<noscript><p>{t.cart.noScript}</p></noscript>

<!-- Le panier n'existe que dans le navigateur : il est lu après l'hydratation. -->
{#if cart.hydrated}
  {#if cart.lines.length === 0}
    <p bind:this={empty} tabindex="-1" data-testid="cart-empty">
      {t.cart.empty}
      <a href={resolveHref(CATALOG_PATH)} class="bui-link">{t.cart.browseCatalog}</a>
    </p>
  {:else}
    <ul bind:this={list} class="grid gap-4">
      {#each cart.lines as line, index (line.slug)}
        <li class="cart-line" data-testid="cart-line">
          <a href={resolveHref(productHref(line.slug))} class="bui-link font-semibold">
            {line.name}
          </a>
          <span>{format(t.cart.unitPrice, { price: price(line.price) })}</span>
          <label class="bui-field">
            <span class="bui-field__label">{format(t.cart.quantityOf, { name: line.name })}</span>
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
          <span class="font-semibold">{price(line.price * line.quantity)}</span>
          <Button
            variant="outline"
            aria-label={format(t.cart.removeItem, { name: line.name })}
            onclick={() => remove(line.slug, index)}
            data-testid="cart-remove"
          >
            {t.cart.remove}
          </Button>
        </li>
      {/each}
    </ul>
    <p class="mt-6 mb-2 text-title font-semibold">
      {t.cart.total} <span data-testid="cart-total">{price(totalPrice(cart.lines))}</span>
    </p>
    <p>{t.cart.soon}</p>
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
