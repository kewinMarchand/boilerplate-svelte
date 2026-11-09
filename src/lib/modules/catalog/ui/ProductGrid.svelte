<script lang="ts">
  import { useDictionary } from '#lib/shared/i18n'
  import { Alert, Button, Icon, Skeleton } from '#lib/shared/ui/kit'

  import ProductCard from './ProductCard.svelte'

  import type { Catalog } from '../domain/catalog'
  import type { Snippet } from 'svelte'

  interface Props {
    status: Catalog.Status
    products: Catalog.Product[]
    view: Catalog.View
    salesEnabled: boolean
    onRetry: () => void
    clearAction: Snippet
  }

  const { status, products, view, salesEnabled, onRetry, clearAction }: Props = $props()

  const t = useDictionary()

  const EAGER_COUNT = 4
</script>

{#if status === 'pending'}
  <div class="catalog-grid" role="status" aria-label={t.catalog.loading}>
    {#each [1, 2, 3, 4] as key (key)}
      <Skeleton height="320px" />
    {/each}
  </div>
{:else if status === 'error'}
  <div class="flex flex-col items-start gap-3">
    <Alert variant="error" data-testid="catalog-error">{t.catalog.loadError}</Alert>
    <Button variant="outline" onclick={onRetry} data-testid="catalog-retry"
      ><Icon name="rotate-cw" />{t.catalog.retry}
    </Button>
  </div>
{:else if products.length === 0}
  <div class="flex flex-col items-start gap-4" data-testid="catalog-empty">
    <Alert variant="info">{t.catalog.empty}</Alert>
    {@render clearAction()}
  </div>
{:else}
  <ul class="catalog-grid" data-view={view}>
    {#each products as product, index (product.id)}
      <li>
        <ProductCard
          {product}
          showPrice={salesEnabled}
          eager={index < EAGER_COUNT}
          priority={index === 0}
          fetchPriority={index === 0 ? 'high' : index < EAGER_COUNT ? 'low' : 'auto'}
        />
      </li>
    {/each}
  </ul>
{/if}
