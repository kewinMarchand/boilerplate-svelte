<script lang="ts">
  import { useDictionary } from '#lib/shared/i18n'
  import { useOppositionMesure } from '#lib/shared/observability'
  import { Checkbox } from '#lib/shared/ui/kit'

  const opposition = useOppositionMesure()
  const id = $props.id()
  const t = useDictionary()
</script>

<Checkbox
  {id}
  label={t.legal.opposition}
  checked={opposition.refusee}
  data-testid="legal-opposition-mesure"
  onchange={(event) => opposition.changer(event.currentTarget.checked)}
/>
<p role="status" aria-live="polite" data-testid="legal-opposition-etat">
  {opposition.refusee ? t.legal.oppositionRefused : t.legal.oppositionMeasured}
</p>
