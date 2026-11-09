<script lang="ts">
  import { useDictionary } from '#lib/shared/i18n'
  import { isAudienceMeasurementEnabled } from '#lib/shared/observability'

  import { LegalPageContent } from '#lib/modules/content'

  import OppositionMesure from './OppositionMesure.svelte'

  import type { LegalPage } from '#lib/modules/content'

  interface Props {
    legalPage: LegalPage.Content
  }

  const { legalPage }: Props = $props()
  const t = useDictionary()
</script>

<LegalPageContent
  {legalPage}
  fallbackTitle={t.legal.privacyTitle}
  description={t.legal.privacyDescription}
/>

{#if isAudienceMeasurementEnabled}
  <section
    aria-labelledby="mesure-audience"
    class="prose-legal mt-4"
    data-testid="legal-audience-measurement"
  >
    <h2 id="mesure-audience">{t.legal.audienceTitle}</h2>
    <p>{t.legal.audienceText}</p>
    <p>{t.legal.oppositionText}</p>
    <OppositionMesure />
  </section>
{/if}
