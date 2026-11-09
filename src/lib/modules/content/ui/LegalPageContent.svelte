<script lang="ts">
  import { useDictionary } from '#lib/shared/i18n'
  import { Alert } from '#lib/shared/ui/kit'
  import { PageHeader } from '#lib/shared/ui/layout'

  import type { LegalPage } from '../domain/legalPage'

  // Le HTML vient de l'API, qui échappe le HTML saisi dans l'admin et retire les liens dangereux :
  // il est injecté tel quel.
  interface Props {
    legalPage: LegalPage.Content
    /** Titre affiché si l'API ne répond pas. */
    fallbackTitle: string
    description: string
  }

  const { legalPage, fallbackTitle, description }: Props = $props()
  const t = useDictionary()
</script>

{#if legalPage.status === 'error'}
  <PageHeader title={fallbackTitle} {description} />
  <Alert variant="error" data-testid="legal-error">{t.legal.loadError}</Alert>
{:else}
  <PageHeader title={legalPage.page.title} {description} />
  <div class="prose-legal">
    {#if legalPage.page.introduction}
      <!-- eslint-disable-next-line svelte/no-at-html-tags -- HTML échappé par l'API -->
      {@html legalPage.page.introduction}
    {/if}
    {#each legalPage.page.sections as section (section.title)}
      <section data-testid="legal-section">
        <h2>{section.title}</h2>
        <!-- eslint-disable-next-line svelte/no-at-html-tags -- HTML échappé par l'API -->
        {@html section.html}
      </section>
    {/each}
  </div>
{/if}
