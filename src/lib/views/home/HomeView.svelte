<script lang="ts">
  import { SITE } from '#lib/shared/config'
  import { buildHomeJsonLd, buildPageMeta, SeoHead } from '#lib/shared/seo'

  import { BlogSection } from '#lib/modules/blog'
  import { FeaturedCarousel } from '#lib/modules/content'

  import Hero from './Hero.svelte'

  import type { Article } from '#lib/modules/blog'
  import type { Slide } from '#lib/modules/content'

  interface Props {
    blog: Article.Blog
    slides: Slide.Featured
  }

  const { blog, slides }: Props = $props()
</script>

<SeoHead
  meta={buildPageMeta({ description: SITE.description, path: '/', jsonLd: buildHomeJsonLd() })}
/>

<Hero />

<FeaturedCarousel {slides} />

<BlogSection {blog} />
