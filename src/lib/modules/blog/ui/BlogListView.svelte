<script lang="ts">
  import { BLOG_NAVIGATION } from '#lib/shared/config'
  import { absoluteUrl } from '#lib/shared/seo'
  import { Alert, Button, Icon, Skeleton } from '#lib/shared/ui/kit'
  import { PageHeader } from '#lib/shared/ui/layout'

  import { articleHref } from '../domain/article'
  import BlogCard from './BlogCard.svelte'
  import { useBlogRetry } from './hooks/useBlogRetry.svelte'

  import type { Article } from '../domain/article'

  interface Props {
    blog: Article.Blog
  }

  const { blog }: Props = $props()

  const blogRetry = useBlogRetry(() => blog)

  const seo = $derived({
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'Blog',
        name: BLOG_NAVIGATION.label,
        url: absoluteUrl(BLOG_NAVIGATION.href),
        inLanguage: 'fr-FR',
        blogPost: (blog.status === 'success' ? blog.articles : []).map((article) => ({
          '@type': 'BlogPosting',
          headline: article.title,
          datePublished: article.publishedAt,
          url: absoluteUrl(articleHref(article.slug)),
        })),
      },
    ],
  })
</script>

<PageHeader
  title={BLOG_NAVIGATION.label}
  description="Tous les articles du blog : accessibilité, carrousel sans dépendance, performances et choix techniques, du plus récent au plus ancien."
  {seo}
/>

<div aria-live="polite">
  {#if blogRetry.status === 'pending'}
    <div
      class="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
      role="status"
      aria-busy="true"
      aria-label="Chargement des articles"
      data-testid="blog-loading"
    >
      {#each [1, 2, 3] as key (key)}
        <Skeleton class="h-64" />
      {/each}
    </div>
  {:else if blog.status === 'error'}
    <div class="flex flex-col items-start gap-3">
      <Alert variant="error" data-testid="blog-error">{blog.message}</Alert>
      <Button variant="outline" onclick={() => void blogRetry.retry()} data-testid="blog-retry"
        ><Icon name="rotate-cw" />Réessayer
      </Button>
    </div>
  {:else if blog.articles.length === 0}
    <Alert variant="info" data-testid="blog-empty">
      Aucun article publié pour l'instant. Revenez bientôt.
    </Alert>
  {:else}
    <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3" data-testid="blog-list">
      {#each blog.articles as article (article.id)}
        <BlogCard {article} testId="blog-card" headingLevel={2} />
      {/each}
    </div>
  {/if}
</div>
