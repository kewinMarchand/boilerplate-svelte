<script lang="ts">
  import { useDictionary } from '#lib/shared/i18n'
  import { Button, Icon } from '#lib/shared/ui/kit'

  import { useA11yMode } from './useA11yMode.svelte'

  const mode = useA11yMode()
  const t = useDictionary()
</script>

<Button
  variant="nav"
  class="max-lg:size-touch max-lg:shrink-0 max-lg:px-0"
  aria-label={t.a11yMode.label}
  aria-pressed={mode.enhanced}
  onclick={mode.toggle}
  data-testid="a11y-mode-toggle"
>
  <Icon name="person-standing" class="bui-icon--md" />
  <span class="max-lg:sr-only">{t.a11yMode.label}</span>
</Button>
