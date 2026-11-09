<script lang="ts">
  import { BLOG_NAVIGATION, navigationLabel } from '#lib/shared/config'
  import { format, useDictionary, useLocale } from '#lib/shared/i18n'
  import { resolveHref } from '#lib/shared/routing'
  import { localizedUrl } from '#lib/shared/seo'
  import { Alert, largestWebp, ResponsiveImage } from '#lib/shared/ui/kit'
  import { PageHeader } from '#lib/shared/ui/layout'

  import { articleHref } from '../domain/article'
  import { formatDuration } from '../domain/formatDuration'
  import { formatPublishedAt } from '../domain/formatPublishedAt'

  import type { Article } from '../domain/article'

  // Le HTML vient de l'API, qui échappe le HTML saisi dans l'admin et retire les liens dangereux :
  // il est injecté tel quel.
  interface Props {
    article: Article.Page
  }

  const { article }: Props = $props()

  const t = useDictionary()
  const locale = useLocale()
  const PARENTS = [{ label: navigationLabel(BLOG_NAVIGATION, t), path: BLOG_NAVIGATION.href }]
  const IMAGE_SIZES = '(min-width: 800px) 760px, calc(100vw - 32px)'

  const seo = $derived(
    article.status === 'success'
      ? {
          metaTitle: article.article.metaTitle,
          metaDescription: article.article.metaDescription,
          publishedTime: article.article.publishedAt,
          image: article.article.image
            ? {
                path: largestWebp(article.article.image),
                width: article.article.image.width,
                height: article.article.image.height,
                alt: article.article.image.alt || article.article.title,
              }
            : undefined,
          jsonLd: [
            {
              '@context': 'https://schema.org',
              '@type': 'BlogPosting',
              headline: article.article.title,
              description: article.article.excerpt,
              datePublished: article.article.publishedAt,
              url: localizedUrl(articleHref(article.article.slug), locale),
              ...(article.article.image && { image: largestWebp(article.article.image) }),
              inLanguage: t.language.tag,
            },
          ],
        }
      : { noindex: true },
  )
</script>

{#if article.status === 'error'}
  <PageHeader
    title={t.blog.articleFallbackTitle}
    description={t.blog.articleFallbackDescription}
    parents={PARENTS}
    {seo}
  />
  <Alert variant="error" data-testid="article-error">{t.blog.articleError}</Alert>
{:else}
  {@const {
    title,
    excerpt,
    publishedAt,
    image,
    html,
    section,
    format: articleFormat,
    audio,
    speaker,
  } = article.article}
  <article class="max-w-prose" data-testid="article-page">
    <PageHeader
      {title}
      description={excerpt || title}
      parents={PARENTS}
      {seo}
      titleTestId="article-title"
    />
    {#if section || articleFormat}
      <p class="article-overline mb-2 flex flex-wrap gap-x-4">
        {#if section}<span data-testid="article-section">{section.name}</span>{/if}
        {#if articleFormat}<span data-testid="article-format">{articleFormat.name}</span>{/if}
      </p>
    {/if}
    <p class="mb-6 text-body-sm text-text-muted">
      {t.blog.publishedOn}
      <time datetime={publishedAt}>{formatPublishedAt(publishedAt, t.language.tag)}</time>
    </p>
    {#if image}
      <ResponsiveImage
        {image}
        sizes={IMAGE_SIZES}
        fallback
        pictureClass="rounded-md"
        priority
        class="aspect-video h-auto w-full rounded-md object-cover"
      />
    {/if}
    {#if excerpt}
      <p class="my-6 text-lead">{excerpt}</p>
    {/if}
    {#if audio}
      <figure class="my-6">
        <figcaption class="mb-2 text-body-sm text-text-muted">
          {format(t.blog.audio, { duration: formatDuration(audio.durationSeconds) })}{#if speaker}.
            {speaker}{/if}
        </figcaption>
        <audio controls preload="none" class="w-full" data-testid="article-audio">
          <source src={audio.src} type={audio.type} />
        </audio>
      </figure>
    {/if}
    <div class="prose-legal" data-testid="article-body">
      <!-- eslint-disable-next-line svelte/no-at-html-tags -- HTML échappé par l'API -->
      {@html html}
    </div>
    <p class="mt-12">
      <a href={resolveHref(BLOG_NAVIGATION.href)} class="bui-link" data-testid="article-blog-link"
        >{t.blog.all}</a
      >
    </p>
  </article>
{/if}
