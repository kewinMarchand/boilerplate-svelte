<script lang="ts">
  import { format, useDictionary } from '#lib/shared/i18n'
  import { Menu } from '#lib/shared/ui/kit'

  import { COLOR_SCHEMES, type ColorScheme } from './colorScheme'
  import { useColorScheme } from './useColorScheme.svelte'

  const ICONS = { auto: 'monitor', light: 'sun', dark: 'moon' } as const

  const t = useDictionary()
  const LABELS: Record<ColorScheme, string> = t.colorScheme.choices
  const ITEMS = COLOR_SCHEMES.map((scheme) => ({
    id: scheme,
    label: LABELS[scheme].charAt(0).toUpperCase() + LABELS[scheme].slice(1),
    testId: `color-scheme-option-${scheme}`,
  }))

  const theme = useColorScheme()

  // Le mode renforcé impose le clair : un autre choix reste mémorisé mais suspendu.
  const label = $derived(
    format(t.colorScheme.label, { choice: LABELS[theme.scheme] }) +
      (theme.enhanced && theme.scheme !== 'light' ? t.colorScheme.suspended : ''),
  )
</script>

<Menu
  id="color-scheme"
  {label}
  items={ITEMS}
  checked={theme.scheme}
  triggerIcon={ICONS[theme.scheme]}
  triggerVariant="nav"
  testId="color-scheme-toggle"
  class="hidden js:block"
  onselect={(id) => {
    const scheme = COLOR_SCHEMES.find((candidate) => candidate === id)
    if (scheme) theme.choose(scheme)
  }}
/>
