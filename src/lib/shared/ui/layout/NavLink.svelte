<script lang="ts">
  import { isActivePath, navigationLabel } from '#lib/shared/config'
  import { useDictionary, usePagePath } from '#lib/shared/i18n'
  import { resolveHref } from '#lib/shared/routing'
  import { Button } from '#lib/shared/ui/kit'

  import type { NavigationItem } from '#lib/shared/config'

  const item: NavigationItem = $props()

  const t = useDictionary()
  const isActive = $derived(isActivePath(usePagePath(), item.href))
</script>

<Button href={resolveHref(item.href)} variant="nav" aria-current={isActive ? 'page' : undefined}>
  {navigationLabel(item, t)}
</Button>
