<script lang="ts">
  import { dev } from '$app/env'
  import { resolve } from '$app/paths'

  import { LEGAL_NAVIGATION, navigationLabel } from '#lib/shared/config'
  import { useDictionary } from '#lib/shared/i18n'
  import { resolveHref } from '#lib/shared/routing'

  interface Props {
    siteName: string
  }

  const { siteName }: Props = $props()
  const t = useDictionary()
</script>

<footer class="mt-12 bg-surface-muted py-6" data-testid="app-footer">
  <div class="container-page flex flex-col gap-4">
    <nav aria-label={t.layout.legalLinks}>
      <ul class="flex flex-wrap gap-x-6 gap-y-2">
        {#each LEGAL_NAVIGATION as item (item.href)}
          <li>
            <a href={resolveHref(item.href)} class="footer-link">{navigationLabel(item, t)}</a>
          </li>
        {/each}
      </ul>
    </nav>
    <p class="flex items-center gap-2 text-body-sm text-text-muted">
      <img src="/logo-mark.svg" alt="" width="24" height="24" />
      {siteName}
      {#if dev}
        <a href={resolve('/charte-graphique')} class="ml-auto underline">{t.layout.styleguide}</a>
      {/if}
    </p>
  </div>
</footer>
