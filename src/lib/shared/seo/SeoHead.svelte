<script lang="ts">
  import type { Seo } from './seo'

  interface Props {
    meta: Seo.Meta
  }

  const { meta }: Props = $props()

  const serializeJsonLd = (data: Seo.JsonLd) =>
    `<script type="application/ld+json">${JSON.stringify(data).replace(/</g, '\\u003c')}</` +
    'script>'
</script>

<svelte:head>
  <title>{meta.title}</title>
  <meta name="description" content={meta.description} />
  <meta name="application-name" content={meta.siteName} />
  <meta name="robots" content={meta.robots} />
  <link rel="canonical" href={meta.canonical} />
  {#each meta.hreflang as link (link.hreflang)}
    <link rel="alternate" hreflang={link.hreflang} href={link.href} />
  {/each}
  {#if meta.prev}
    <link rel="prev" href={meta.prev} />
  {/if}
  {#if meta.next}
    <link rel="next" href={meta.next} />
  {/if}
  <meta property="og:type" content={meta.ogType} />
  {#if meta.publishedTime}
    <meta property="article:published_time" content={meta.publishedTime} />
  {/if}
  <meta property="og:site_name" content={meta.siteName} />
  <meta property="og:title" content={meta.ogTitle} />
  <meta property="og:description" content={meta.description} />
  <meta property="og:url" content={meta.canonical} />
  <meta property="og:image" content={meta.image.url} />
  <meta property="og:image:width" content={String(meta.image.width)} />
  <meta property="og:image:height" content={String(meta.image.height)} />
  <meta property="og:image:alt" content={meta.image.alt} />
  <meta property="og:locale" content={meta.locale} />
  {#each meta.alternateLocales as alternate (alternate)}
    <meta property="og:locale:alternate" content={alternate} />
  {/each}
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={meta.ogTitle} />
  <meta name="twitter:description" content={meta.description} />
  <meta name="twitter:image" content={meta.image.url} />
  {#each meta.jsonLd as data, index (index)}
    <!-- eslint-disable-next-line svelte/no-at-html-tags -- JSON sérialisé et « < » échappé : aucune injection possible -->
    {@html serializeJsonLd(data)}
  {/each}
</svelte:head>
