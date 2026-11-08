<script lang="ts">
  import { resolve } from '$app/paths'
  import { page } from '$app/state'

  import { CATALOG_NAVIGATION, MAIN_NAVIGATION, SITE } from '#lib/shared/config'
  import { A11yModeToggle } from '#lib/shared/ui/a11y-mode'
  import { ColorSchemeToggle } from '#lib/shared/ui/color-scheme'

  import CategoryMenu from './CategoryMenu.svelte'
  import MobileMenu from './MobileMenu.svelte'
  import NavLink from './NavLink.svelte'

  import type { NavigationNode } from '#lib/shared/config'
  import type { Snippet } from 'svelte'

  interface Props {
    categoryMenu: NavigationNode[]
    cartLink: Snippet
  }

  const { categoryMenu, cartLink }: Props = $props()

  const [home, ...otherLinks] = MAIN_NAVIGATION
</script>

<header class="bg-primary text-on-primary">
  <div class="container-page header-bar">
    <a
      href={resolve('/')}
      class="logo-link min-w-0 grow"
      aria-current={page.url.pathname === '/' ? 'page' : undefined}
      data-testid="layout-logo"
    >
      <img src="/logo-mark.svg" alt="" width="40" height="40" />
      {SITE.name}
    </a>
    <nav aria-label="Navigation principale" class="js:max-lg:hidden">
      <ul class="flex flex-wrap gap-1">
        {#if home}
          <li><NavLink {...home} /></li>
        {/if}
        <li class="js:hidden"><NavLink {...CATALOG_NAVIGATION} /></li>
        <li class="hidden js:block"><CategoryMenu nodes={categoryMenu} /></li>
        {#each otherLinks as item (item.href)}
          <li><NavLink {...item} /></li>
        {/each}
      </ul>
    </nav>
    <div class="hidden js:max-lg:block">
      <MobileMenu nodes={categoryMenu} />
    </div>
    {@render cartLink()}
    <ColorSchemeToggle />
    <A11yModeToggle />
  </div>
</header>
