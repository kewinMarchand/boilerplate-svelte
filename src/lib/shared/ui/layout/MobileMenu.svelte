<script lang="ts">
  import {
    CATALOG_NAVIGATION,
    isActivePath,
    MAIN_NAVIGATION,
    navigationLabel,
  } from '#lib/shared/config'
  import { format, useDictionary, usePagePath } from '#lib/shared/i18n'
  import { resolveHref } from '#lib/shared/routing'
  import { Button, Drawer, Icon } from '#lib/shared/ui/kit'

  import { useDrillDown } from './hooks/useDrillDown.svelte'

  import type { NavigationNode } from '#lib/shared/config'

  interface Props {
    nodes: NavigationNode[]
  }

  const { nodes }: Props = $props()
  const t = useDictionary()

  let open = $state(false)
  let heading = $state<HTMLElement | null>(null)
  const drill = useDrillDown(() => heading?.focus())

  const catalogNode = $derived<NavigationNode>({
    id: 'catalogue',
    label: navigationLabel(CATALOG_NAVIGATION, t),
    path: CATALOG_NAVIGATION.href,
    children: nodes,
  })

  $effect(() => {
    if (!open) drill.reset()
  })

  const close = () => {
    open = false
  }
</script>

<Drawer
  bind:open
  title={t.layout.menu}
  closeLabel={t.layout.close}
  triggerClass="bui-button bui-button--nav bui-button--icon"
  triggerLabel={t.layout.menu}
  triggerTestId="layout-mobile-menu-toggle"
  panelTestId="layout-mobile-menu"
>
  {#snippet trigger()}
    <Icon name="menu" />
  {/snippet}

  <nav aria-label={t.layout.mobileMenu}>
    {#if drill.current}
      {@const current = drill.current}
      <Button
        variant="ghost"
        icon="chevron-left"
        class="mb-2"
        data-testid="layout-mobile-menu-back"
        onclick={drill.back}
      >
        {format(t.layout.back, { parent: drill.parentLabel ?? t.layout.menu })}
      </Button>
      <h2 class="mb-2 text-title font-semibold" tabindex="-1" bind:this={heading}>
        {current.label}
      </h2>
      <ul class="flex flex-col">
        <li>
          <a href={resolveHref(current.path)} class="mobile-menu-item" onclick={close}>
            {t.layout.wholeCategory}
          </a>
        </li>
        {#each current.children as node (node.id)}
          <li>
            {#if node.children.length > 0}
              <button type="button" class="mobile-menu-item" onclick={() => drill.open(node)}>
                {node.label}
                <Icon name="chevron-right" />
              </button>
            {:else}
              <a href={resolveHref(node.path)} class="mobile-menu-item" onclick={close}
                >{node.label}</a
              >
            {/if}
          </li>
        {/each}
      </ul>
    {:else}
      <h2 class="sr-only" tabindex="-1" bind:this={heading}>{t.layout.navigation}</h2>
      <ul class="flex flex-col">
        {#each MAIN_NAVIGATION as item (item.href)}
          <li>
            <a
              href={resolveHref(item.href)}
              class="mobile-menu-item"
              aria-current={isActivePath(usePagePath(), item.href) ? 'page' : undefined}
              onclick={close}>{navigationLabel(item, t)}</a
            >
          </li>
        {/each}
        <li>
          <button type="button" class="mobile-menu-item" onclick={() => drill.open(catalogNode)}>
            {navigationLabel(CATALOG_NAVIGATION, t)}
            <Icon name="chevron-right" />
          </button>
        </li>
      </ul>
    {/if}
  </nav>
</Drawer>
