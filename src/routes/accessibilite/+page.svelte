<script lang="ts">
  import { AccessibilityView } from '#lib/views/legal'

  const { data } = $props()
</script>

<AccessibilityView legalPage={data.legalPage} />
