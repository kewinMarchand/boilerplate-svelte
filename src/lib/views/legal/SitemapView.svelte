<script lang="ts">
  import { ALL_NAVIGATION, CATALOG_NAVIGATION, navigationLabel } from '#lib/shared/config'
  import { useDictionary } from '#lib/shared/i18n'
  import { resolveHref } from '#lib/shared/routing'
  import { PageHeader } from '#lib/shared/ui/layout'

  import SitemapTree from './SitemapTree.svelte'

  import type { NavigationNode } from '#lib/shared/config'

  interface Props {
    categories: NavigationNode[]
  }

  const { categories }: Props = $props()
  const t = useDictionary()
</script>

<PageHeader title={t.legal.sitemapTitle} description={t.legal.sitemapDescription} />

<div class="prose-legal">
  <ul data-testid="legal-sitemap">
    {#each ALL_NAVIGATION as item (item.href)}
      <li>
        <a href={resolveHref(item.href)}>{navigationLabel(item, t)}</a>
        {#if item.href === CATALOG_NAVIGATION.href}
          <SitemapTree nodes={categories} />
        {/if}
      </li>
    {/each}
  </ul>
</div>
