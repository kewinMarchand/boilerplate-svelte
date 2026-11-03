<script lang="ts">
  import { PersonalDataView } from '#lib/views/legal'

  const { data } = $props()
</script>

<PersonalDataView legalPage={data.legalPage} />
