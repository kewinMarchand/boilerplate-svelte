<script lang="ts">
  import { isAudienceMeasurementEnabled } from '#lib/shared/observability'

  import { LegalPageContent } from '#lib/modules/content'

  import OppositionMesure from './OppositionMesure.svelte'

  import type { LegalPage } from '#lib/modules/content'

  interface Props {
    legalPage: LegalPage.Content
  }

  const { legalPage }: Props = $props()
</script>

<LegalPageContent
  {legalPage}
  fallbackTitle="Données personnelles"
  description="Traitement des données personnelles collectées par le formulaire de contact : finalité, base légale, durée de conservation et droits."
/>

{#if isAudienceMeasurementEnabled}
  <section
    aria-labelledby="mesure-audience"
    class="prose-legal mt-4"
    data-testid="legal-audience-measurement"
  >
    <h2 id="mesure-audience">Mesure d’audience</h2>
    <p>
      La fréquentation du site est mesurée avec Matomo, hébergé par l’éditeur, configuré sans cookie
      et sans identifiant : aucun suivi d’un site à l’autre, aucune donnée transmise à un tiers. Les
      statistiques produites sont anonymes et servent uniquement à améliorer le site. Les données
      brutes sont conservées 25 mois au plus.
    </p>
    <p>
      Vous pouvez vous opposer à cette mesure : votre choix est gardé dans ce navigateur, sans
      cookie.
    </p>
    <OppositionMesure />
  </section>
{/if}
