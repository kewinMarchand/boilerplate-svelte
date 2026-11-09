<script lang="ts">
  import { useDictionary } from '#lib/shared/i18n'
  import { PageHeader } from '#lib/shared/ui/layout'

  import TasksPanel from './TasksPanel.svelte'

  const t = useDictionary()
</script>

<PageHeader title={t.tasks.title} description={t.tasks.description} />

<p class="lead">{t.tasks.intro}</p>
<TasksPanel />
