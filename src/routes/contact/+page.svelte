<script lang="ts">
  import { ContactView } from '#lib/modules/contact'

  const { data } = $props()
</script>

<ContactView form={data.form} product={data.product} />
