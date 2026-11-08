<script lang="ts">
  import { resolveHref } from '#lib/shared/routing'
  import { ResponsiveImage } from '#lib/shared/ui/kit'

  import { articleHref } from '../domain/article'
  import { formatPublishedAt } from '../domain/formatPublishedAt'

  import type { Article } from '../domain/article'

  interface Props {
    article: Article.Entity
    featured?: boolean
  }

  const { article, featured = false }: Props = $props()
</script>

<article class="bui-card relative" data-testid="home-blog-card">
  {#if article.image}
    <div class={['bui-card__media', featured && 'md:relative md:flex-1']}>
      <ResponsiveImage
        image={article.image}
        sizes={featured
          ? '(min-width: 1024px) 66vw, 100vw'
          : '(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw'}
        class={featured
          ? 'aspect-video h-auto w-full object-cover md:absolute md:inset-0 md:aspect-auto md:h-full'
          : 'aspect-video h-auto w-full object-cover'}
      />
    </div>
  {/if}
  <div class={['bui-card__body', featured && 'md:flex-none']}>
    <h3 class="bui-card__title">
      <a href={resolveHref(articleHref(article.slug))} class="blog-card-link">{article.title}</a>
    </h3>
    <time datetime={article.publishedAt} class="text-body-sm text-text-muted">
      {formatPublishedAt(article.publishedAt)}
    </time>
    <p>{article.excerpt}</p>
  </div>
</article>

<style>
  /* Lien étiré sur toute la carte : un seul lien, nommé par le titre */
  .blog-card-link::after {
    content: '';
    position: absolute;
    inset: 0;
  }
</style>
