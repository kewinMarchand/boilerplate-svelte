<script lang="ts">
  import { useDictionary, useLocale, usePageAlternates } from '#lib/shared/i18n'
  import { buildHomeJsonLd, buildPageMeta, SeoHead } from '#lib/shared/seo'

  import { BlogSection } from '#lib/modules/blog'
  import { FeaturedProducts } from '#lib/modules/catalog'

  import Hero from './Hero.svelte'

  import type { Article } from '#lib/modules/blog'
  import type { Catalog } from '#lib/modules/catalog'
  import type { SiteIdentity } from '#lib/shared/config'
  import type { Seo } from '#lib/shared/seo'

  interface Props {
    blog: Article.Blog
    featured: Catalog.Featured
    identity: SiteIdentity
    pageMeta: Seo.Override | undefined
  }

  const { blog, featured, identity, pageMeta }: Props = $props()

  const t = useDictionary()
  const locale = useLocale()
</script>

<SeoHead
  meta={buildPageMeta(
    {
      description: identity.tagline,
      metaTitle: pageMeta?.title,
      metaDescription: pageMeta?.description,
      path: '/',
      jsonLd: buildHomeJsonLd(identity, locale, t.language.tag),
    },
    identity,
    { locale, alternates: usePageAlternates() },
  )}
/>

<Hero name={identity.name} tagline={identity.tagline} />

<FeaturedProducts {featured} showPrice={identity.salesEnabled} />

<BlogSection {blog} />
