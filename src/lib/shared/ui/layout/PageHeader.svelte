<script lang="ts">
  import { page } from '$app/state'

  import { toAppPath } from '#lib/shared/routing'
  import { buildBreadcrumb, buildPageMeta, SeoHead } from '#lib/shared/seo'

  import Breadcrumb from './Breadcrumb.svelte'

  import type { Seo } from '#lib/shared/seo'

  interface Props {
    title: string
    description: string
    parents?: Seo.BreadcrumbItem[]
    seo?: Omit<Seo.Input, 'title' | 'description' | 'path' | 'breadcrumb'>
    titleTestId?: string
  }

  const { title, description, parents = [], seo = {}, titleTestId }: Props = $props()

  const path = $derived(toAppPath(page.url.pathname))
  const breadcrumb = $derived(buildBreadcrumb({ label: title, path }, parents))
  const meta = $derived(
    buildPageMeta({ ...seo, title, description, path, breadcrumb }, page.data.siteIdentity.name),
  )
</script>

<SeoHead {meta} />
<Breadcrumb items={breadcrumb} />
<h1 id="page-title" tabindex="-1" class="heading-1" data-testid={titleTestId}>{title}</h1>
