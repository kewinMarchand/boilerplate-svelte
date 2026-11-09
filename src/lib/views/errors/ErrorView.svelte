<script lang="ts">
  import { useDictionary, usePagePath } from '#lib/shared/i18n'
  import { resolveHref } from '#lib/shared/routing'
  import { Button } from '#lib/shared/ui/kit'
  import { PageHeader } from '#lib/shared/ui/layout'

  interface Props {
    status: number
  }

  const { status }: Props = $props()

  const t = useDictionary()
  const isNotFound = $derived(status === 404)
  const title = $derived(isNotFound ? t.errors.notFoundTitle : t.errors.serverTitle)
  const description = $derived(
    isNotFound ? t.errors.notFoundDescription : t.errors.serverDescription,
  )
</script>

<PageHeader {title} {description} seo={{ noindex: true }} />

<p class="lead">{description}</p>
<div class="flex flex-wrap gap-4">
  {#if !isNotFound}
    <Button href={resolveHref(usePagePath())} data-sveltekit-reload data-testid="error-retry">
      {t.errors.retry}
    </Button>
  {/if}
  <Button
    href={resolveHref('/')}
    variant={isNotFound ? 'primary' : 'outline'}
    data-testid="error-home-link"
  >
    {t.errors.home}
  </Button>
  {#if isNotFound}
    <Button href={resolveHref('/plan-du-site')} variant="outline" data-testid="error-sitemap-link">
      {t.errors.sitemap}
    </Button>
    <Button href={resolveHref('/catalogue')} variant="outline" data-testid="error-catalog-link">
      {t.errors.catalog}
    </Button>
  {/if}
</div>
