<script lang="ts">
  import { useDictionary } from '#lib/shared/i18n'

  import { LegalPageContent } from '#lib/modules/content'

  import type { LegalPage } from '#lib/modules/content'

  interface Props {
    legalPage: LegalPage.Content
  }

  const { legalPage }: Props = $props()
  const t = useDictionary()
</script>

<LegalPageContent
  {legalPage}
  fallbackTitle={t.legal.accessibilityTitle}
  description={t.legal.accessibilityDescription}
/>
