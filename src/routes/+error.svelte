<script lang="ts">
  import { page } from '$app/state'

  import { ErrorView } from '#lib/views/errors'
</script>

<ErrorView status={page.status} />
