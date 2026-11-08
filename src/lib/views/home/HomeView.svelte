<script lang="ts">
  import { buildHomeJsonLd, buildPageMeta, SeoHead } from '#lib/shared/seo'

  import { BlogSection } from '#lib/modules/blog'
  import { FeaturedProducts } from '#lib/modules/catalog'

  import Hero from './Hero.svelte'

  import type { Article } from '#lib/modules/blog'
  import type { Catalog } from '#lib/modules/catalog'
  import type { SiteIdentity } from '#lib/shared/config'

  interface Props {
    blog: Article.Blog
    featured: Catalog.Featured
    identity: SiteIdentity
  }

  const { blog, featured, identity }: Props = $props()
</script>

<SeoHead
  meta={buildPageMeta(
    { description: identity.tagline, path: '/', jsonLd: buildHomeJsonLd(identity.name) },
    identity.name,
  )}
/>

<Hero name={identity.name} tagline={identity.tagline} />

<FeaturedProducts {featured} />

<BlogSection {blog} />
