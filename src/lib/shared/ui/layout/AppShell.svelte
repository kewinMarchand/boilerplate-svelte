<script lang="ts">
  import { useDictionary } from '#lib/shared/i18n'
  import { useMatomo } from '#lib/shared/observability'

  import Footer from './Footer.svelte'
  import Header from './Header.svelte'

  import type { NavigationNode, SiteIdentity } from '#lib/shared/config'
  import type { Snippet } from 'svelte'

  import '#lib/shared/theme/theme.css'

  interface Props {
    categoryMenu: NavigationNode[]
    identity: SiteIdentity
    /** Lien du panier, fourni par la couche de routage : le socle n'importe pas de module. */
    cartLink: Snippet
    children: Snippet
  }

  const { categoryMenu, identity, cartLink, children }: Props = $props()

  useMatomo()
  const t = useDictionary()
</script>

<div class="flex min-h-screen flex-col">
  <a href="#main" class="skip-link">{t.layout.skipLink}</a>
  <Header {categoryMenu} {identity} {cartLink} />
  <main id="main" tabindex="-1" class="page-grid grow">
    {@render children()}
  </main>
  <Footer siteName={identity.name} />
</div>
