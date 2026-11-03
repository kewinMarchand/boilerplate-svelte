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
  fallbackTitle="Mentions légales"
  description="Mentions légales du site : éditeur, directeur de la publication, hébergeur et propriété intellectuelle."
/>
