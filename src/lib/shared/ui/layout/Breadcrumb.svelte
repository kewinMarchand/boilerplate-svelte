<script lang="ts">
  import { useDictionary } from '#lib/shared/i18n'
  import { resolveHref } from '#lib/shared/routing'

  import type { Seo } from '#lib/shared/seo'

  interface Props {
    items: Seo.BreadcrumbItem[]
  }

  const { items }: Props = $props()
  const t = useDictionary()
</script>

<nav class="bui-breadcrumb mb-4" aria-label={t.layout.breadcrumb} data-testid="layout-breadcrumb">
  <ol class="bui-breadcrumb__list">
    {#each items as item, index (item.path)}
      <li class="bui-breadcrumb__item">
        {#if index === items.length - 1}
          <span class="bui-breadcrumb__current" aria-current="page">{item.label}</span>
        {:else}
          <a class="bui-link" href={resolveHref(item.path)}>{item.label}</a>
        {/if}
      </li>
    {/each}
  </ol>
</nav>
