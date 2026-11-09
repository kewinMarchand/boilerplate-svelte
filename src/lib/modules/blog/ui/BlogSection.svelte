<script lang="ts">
  import { BLOG_NAVIGATION } from '#lib/shared/config'
  import { useDictionary } from '#lib/shared/i18n'
  import { resolveHref } from '#lib/shared/routing'

  import BlogGrid from './BlogGrid.svelte'
  import { useBlogRetry } from './hooks/useBlogRetry.svelte'

  import type { Article } from '../domain/article'

  interface Props {
    blog: Article.Blog
  }

  const { blog }: Props = $props()

  const t = useDictionary()
  const titleId = $props.id()
  const blogRetry = useBlogRetry(() => blog)
</script>

<section aria-labelledby={titleId} class="mt-12" data-testid="home-blog">
  <h2 id={titleId} class="section-title">{t.blog.latest}</h2>
  <div aria-live="polite">
    <BlogGrid
      status={blogRetry.status}
      articles={blog.status === 'success' ? blog.articles : undefined}
      onRetry={() => void blogRetry.retry()}
    />
  </div>
  <p class="mt-6">
    <a href={resolveHref(BLOG_NAVIGATION.href)} class="bui-link" data-testid="home-blog-all"
      >{t.blog.all}</a
    >
  </p>
</section>
