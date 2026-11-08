import { onMount } from 'svelte'

import { addItem, removeItem, setQuantity } from '#lib/modules/cart/domain/cart'
import {
  currentRawCart,
  parseCart,
  saveCart,
  subscribeToCart,
} from '#lib/modules/cart/infrastructure/cartStorage'

import type { Cart } from '#lib/modules/cart/domain/cart'

const update = (change: (lines: Cart.Line[]) => Cart.Line[]) =>
  saveCart(change(parseCart(currentRawCart())))

/** Panier du navigateur : vide au rendu serveur, lu au montage, partagé entre composants et onglets. */
export const useCart = () => {
  let raw = $state<string | null>(null)
  let hydrated = $state(false)
  const lines = $derived(parseCart(raw))

  onMount(() => {
    const refresh = () => {
      raw = currentRawCart()
    }
    refresh()
    hydrated = true
    return subscribeToCart(refresh)
  })

  return {
    get lines() {
      return lines
    },
    get hydrated() {
      return hydrated
    },
    add: (item: Cart.Item) => update((current) => addItem(current, item)),
    changeQuantity: (slug: string, quantity: number) =>
      update((current) => setQuantity(current, slug, quantity)),
    remove: (slug: string) => update((current) => removeItem(current, slug)),
  }
}
