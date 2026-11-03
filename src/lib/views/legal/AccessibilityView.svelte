<script lang="ts">
  import { LegalPageContent } from '#lib/modules/content'

  import type { LegalPage } from '#lib/modules/content'

  interface Props {
    legalPage: LegalPage.Content
  }

  const { legalPage }: Props = $props()
</script>

<LegalPageContent
  {legalPage}
  fallbackTitle="Déclaration d'accessibilité"
  description="Déclaration d’accessibilité RGAA 4.1.2 du site : état de conformité, résultats des tests, environnement de test et voies de recours."
/>
