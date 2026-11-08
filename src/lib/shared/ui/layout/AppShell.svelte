<script lang="ts">
  import { useMatomo } from '#lib/shared/observability'

  import Footer from './Footer.svelte'
  import Header from './Header.svelte'

  import type { NavigationNode } from '#lib/shared/config'
  import type { Snippet } from 'svelte'

  import '#lib/shared/theme/theme.css'

  interface Props {
    categoryMenu: NavigationNode[]
    /** Lien du panier, fourni par la couche de routage : le socle n'importe pas de module. */
    cartLink: Snippet
    children: Snippet
  }

  const { categoryMenu, cartLink, children }: Props = $props()

  useMatomo()
</script>

<div class="flex min-h-screen flex-col">
  <a href="#main" class="skip-link">Aller au contenu principal</a>
  <Header {categoryMenu} {cartLink} />
  <main id="main" tabindex="-1" class="page-grid grow">
    {@render children()}
  </main>
  <Footer />
</div>
