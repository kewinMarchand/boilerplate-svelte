<script lang="ts">
  import { BLOG_NAVIGATION, navigationLabel } from '#lib/shared/config'
  import { useDictionary, useLocale } from '#lib/shared/i18n'
  import { resolveHref } from '#lib/shared/routing'
  import { localizedUrl } from '#lib/shared/seo'
  import { Alert, Button, Chip, Icon, Skeleton } from '#lib/shared/ui/kit'
  import { PageHeader } from '#lib/shared/ui/layout'

  import { articleHref, blogSectionHref } from '../domain/article'
  import BlogCard from './BlogCard.svelte'
  import { useBlogRetry } from './hooks/useBlogRetry.svelte'

  import type { Article } from '../domain/article'

  type Props = Article.BlogPage

  const { blog, sections, activeSection }: Props = $props()

  const t = useDictionary()
  const locale = useLocale()
  const blogLabel = navigationLabel(BLOG_NAVIGATION, t)
  const sectionLinks = $derived([{ slug: undefined, name: t.blog.allSections }, ...sections])

  const blogRetry = useBlogRetry(() => blog)

  const seo = $derived({
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'Blog',
        name: blogLabel,
        url: localizedUrl(BLOG_NAVIGATION.href, locale),
        inLanguage: t.language.tag,
        blogPost: (blog.status === 'success' ? blog.articles : []).map((article) => ({
          '@type': 'BlogPosting',
          headline: article.title,
          datePublished: article.publishedAt,
          url: localizedUrl(articleHref(article.slug), locale),
        })),
      },
    ],
  })
</script>

<PageHeader title={blogLabel} description={t.blog.description} {seo} />

{#if sections.length > 0}
  <nav aria-label={t.blog.sections} class="mb-6">
    <ul class="bui-chip-list">
      {#each sectionLinks as link (link.slug ?? '')}
        <li>
          <Chip
            href={resolveHref(blogSectionHref(link.slug))}
            aria-current={link.slug === activeSection ? 'page' : undefined}
            data-testid="blog-section-link">{link.name}</Chip
          >
        </li>
      {/each}
    </ul>
  </nav>
{/if}

<div aria-live="polite">
  {#if blogRetry.status === 'pending'}
    <div
      class="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
      role="status"
      aria-busy="true"
      aria-label={t.blog.loading}
      data-testid="blog-loading"
    >
      {#each [1, 2, 3] as key (key)}
        <Skeleton class="h-64" />
      {/each}
    </div>
  {:else if blog.status === 'error'}
    <div class="flex flex-col items-start gap-3">
      <Alert variant="error" data-testid="blog-error">{t.blog.loadError}</Alert>
      <Button variant="outline" onclick={() => void blogRetry.retry()} data-testid="blog-retry"
        ><Icon name="rotate-cw" />{t.blog.retry}
      </Button>
    </div>
  {:else if blog.articles.length === 0}
    <Alert variant="info" data-testid="blog-empty">{t.blog.empty}</Alert>
  {:else}
    <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3" data-testid="blog-list">
      {#each blog.articles as article (article.id)}
        <BlogCard {article} testId="blog-card" headingLevel={2} />
      {/each}
    </div>
  {/if}
</div>
