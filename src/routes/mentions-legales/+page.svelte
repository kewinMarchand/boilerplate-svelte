<script lang="ts">
  import { LegalNoticeView } from '#lib/views/legal'

  const { data } = $props()
</script>

<LegalNoticeView legalPage={data.legalPage} />
