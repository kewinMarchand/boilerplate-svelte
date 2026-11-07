<script lang="ts">
  import { SITE } from '#lib/shared/config'
  import { buildHomeJsonLd, buildPageMeta, SeoHead } from '#lib/shared/seo'

  import { BlogSection } from '#lib/modules/blog'
  import { FeaturedProducts } from '#lib/modules/catalog'

  import Hero from './Hero.svelte'

  import type { Article } from '#lib/modules/blog'
  import type { Catalog } from '#lib/modules/catalog'

  interface Props {
    blog: Article.Blog
    featured: Catalog.Featured
  }

  const { blog, featured }: Props = $props()
</script>

<SeoHead
  meta={buildPageMeta({ description: SITE.description, path: '/', jsonLd: buildHomeJsonLd() })}
/>

<Hero />

<FeaturedProducts {featured} />

<BlogSection {blog} />
