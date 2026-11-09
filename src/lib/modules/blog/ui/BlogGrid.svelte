<script lang="ts">
  import { useDictionary } from '#lib/shared/i18n'
  import { Alert, Button, Icon, Skeleton } from '#lib/shared/ui/kit'

  import BlogCard from './BlogCard.svelte'

  import type { Article } from '../domain/article'

  interface Props {
    status: Article.Status
    articles: Article.Entity[] | undefined
    onRetry: () => void
  }

  const { status, articles, onRetry }: Props = $props()
  const t = useDictionary()
</script>

{#if status === 'pending'}
  <div
    class="blog-grid"
    role="status"
    aria-busy="true"
    aria-label={t.blog.loading}
    data-testid="home-blog-loading"
  >
    {#each [1, 2, 3] as key (key)}
      <Skeleton class={key === 1 ? 'h-32 md:h-auto' : 'h-32'} />
    {/each}
  </div>
{:else if status === 'error'}
  <div class="flex flex-col items-start gap-3">
    <Alert variant="error" data-testid="home-blog-error">{t.blog.loadError}</Alert>
    <Button variant="outline" onclick={onRetry} data-testid="home-blog-retry"
      ><Icon name="rotate-cw" />{t.blog.retry}
    </Button>
  </div>
{:else if !articles?.length}
  <Alert variant="info" data-testid="home-blog-empty">{t.blog.empty}</Alert>
{:else}
  <div class="blog-grid">
    {#each articles as article, index (article.id)}
      <BlogCard {article} featured={index === 0} />
    {/each}
  </div>
{/if}
