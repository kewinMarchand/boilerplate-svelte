<script lang="ts">
  import { CATALOG_NAVIGATION, navigationLabel } from '#lib/shared/config'
  import { format, useDictionary, useLocale } from '#lib/shared/i18n'
  import { resolveHref } from '#lib/shared/routing'
  import { localizedUrl } from '#lib/shared/seo'
  import { useIsDesktop } from '#lib/shared/ui/hooks'
  import { Button, Chip, Drawer, Icon, largestWebp } from '#lib/shared/ui/kit'
  import { PageHeader } from '#lib/shared/ui/layout'

  import {
    clearFilters,
    countActiveFilters,
    isFiltered,
    serializeCatalogQuery,
  } from '../domain/catalogQuery'
  import { CATALOG_ROOT_PATH, categoryTrail } from '../domain/categoryPath'
  import ActiveFilters from './ActiveFilters.svelte'
  import CatalogFilters from './CatalogFilters.svelte'
  import CatalogToolbar from './CatalogToolbar.svelte'
  import { catalogHref, useCatalogNavigation } from './hooks/useCatalogNavigation.svelte'
  import Pagination from './Pagination.svelte'
  import ProductGrid from './ProductGrid.svelte'

  import type { Catalog } from '../domain/catalog'
  import type { Seo } from '#lib/shared/seo'

  interface Props {
    query: Catalog.Query
    result: Catalog.Result
    /** `false` : ni prix, ni filtre, ni tri par prix (vente en ligne coupée). */
    salesEnabled: boolean
  }

  const { query, result, salesEnabled }: Props = $props()

  const t = useDictionary()
  const locale = useLocale()
  const catalogLabel = navigationLabel(CATALOG_NAVIGATION, t)

  const listing = $derived(result.status === 'success' ? result.listing : undefined)
  const chain = $derived(listing?.chain ?? [])
  const current = $derived(chain.at(-1))
  const path = $derived(current?.path ?? CATALOG_ROOT_PATH)
  const title = $derived(current?.name ?? catalogLabel)
  const parents = $derived<Seo.BreadcrumbItem[]>(
    current ? [{ label: catalogLabel, path: CATALOG_ROOT_PATH }, ...categoryTrail(chain)] : [],
  )
  const firstImage = $derived(listing?.products[0]?.image)
  const seo = $derived<Omit<Seo.Input, 'title' | 'description' | 'path' | 'breadcrumb'>>({
    noindex: isFiltered(query),
    canonicalPath: query.page >= 2 ? `${path}?page=${query.page}` : path,
    prevPath:
      query.page > 1
        ? `${path}${serializeCatalogQuery({ ...query, page: query.page - 1 })}`
        : undefined,
    nextPath:
      listing && query.page < listing.totalPages
        ? `${path}${serializeCatalogQuery({ ...query, page: query.page + 1 })}`
        : undefined,
    image: firstImage
      ? {
          path: largestWebp(firstImage),
          width: firstImage.width,
          height: firstImage.height,
          alt: firstImage.alt,
        }
      : undefined,
    jsonLd: listing && [
      {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        itemListElement: listing.products.map((product, index) => ({
          '@type': 'ListItem',
          position: (listing.page - 1) * listing.products.length + index + 1,
          name: product.name,
          url: localizedUrl(`${path}#${product.slug}`, locale),
        })),
      },
    ],
  })

  const navigation = useCatalogNavigation(
    () => path,
    () => query,
  )
  const isDesktop = useIsDesktop()
  let filtersOpen = $state(false)

  const status = $derived<Catalog.Status>(navigation.pending ? 'pending' : result.status)
  const activeCount = $derived(countActiveFilters(query))
</script>

<PageHeader {title} description={listing?.description ?? t.catalog.description} {parents} {seo} />

{#snippet clearAction()}
  <Button
    href={catalogHref(path, clearFilters(query))}
    variant="outline"
    data-testid="catalog-clear-filters"
  >
    {t.catalog.clearFilters}
  </Button>
{/snippet}

{#if listing && listing.children.length > 0}
  <nav aria-label={t.catalog.subcategories} class="mb-6">
    <ul class="bui-chip-list">
      {#each listing.children as child (child.slug)}
        <li><Chip href={resolveHref(child.path)}>{child.name} ({child.count})</Chip></li>
      {/each}
    </ul>
  </nav>
{/if}

<div class="catalog-layout">
  {#if listing && isDesktop.current}
    <aside aria-labelledby="catalog-filters-title" class="catalog-aside">
      <h2 id="catalog-filters-title" class="mb-4 text-title font-semibold">
        {t.catalog.filters}
      </h2>
      <CatalogFilters {query} {listing} {salesEnabled} onsubmit={navigation.submitForm} />
    </aside>
  {/if}

  <div class="min-w-0">
    {#snippet filterButton()}
      {#if listing}
        <Drawer
          bind:open={filtersOpen}
          title={t.catalog.filters}
          closeLabel={t.layout.close}
          side="start"
          triggerClass="bui-button bui-button--outline hidden js:max-lg:inline-flex"
          triggerTestId="catalog-filters-open"
        >
          {#snippet trigger()}
            <Icon name="sliders-horizontal" />
            {t.catalog.filterButton}{activeCount > 0 ? ` (${activeCount})` : ''}
          {/snippet}
          <CatalogFilters {query} {listing} {salesEnabled} onsubmit={navigation.submitForm} />
          <Button class="mt-6 w-full" onclick={() => (filtersOpen = false)}>
            {format(t.catalog.showProducts, { total: listing.total })}
          </Button>
        </Drawer>
      {/if}
    {/snippet}

    <CatalogToolbar
      {path}
      {query}
      total={listing?.total ?? 0}
      {salesEnabled}
      onSortChange={(sort) => navigation.update({ sort })}
      {filterButton}
    />
    <ActiveFilters
      {path}
      {query}
      attributeFacets={listing?.facets.attributes ?? []}
      {clearAction}
    />
    <ProductGrid
      {status}
      products={listing?.products ?? []}
      view={query.view}
      {salesEnabled}
      onRetry={navigation.retry}
      {clearAction}
    />
    {#if listing}
      <Pagination {path} {query} totalPages={listing.totalPages} />
    {/if}
  </div>
</div>
