<script lang="ts">
  import { useDictionary } from '#lib/shared/i18n'
  import { Alert, Button, Icon, Skeleton } from '#lib/shared/ui/kit'

  import type { Task } from '../domain/task'

  interface Props {
    status: Task.Status
    tasks: Task.Entity[] | undefined
    onRetry: () => void
  }

  const { status, tasks, onRetry }: Props = $props()
  const t = useDictionary()
</script>

{#if status === 'pending'}
  <div
    class="flex flex-col gap-2"
    role="status"
    aria-busy="true"
    aria-label={t.tasks.loading}
    data-testid="tasks-loading"
  >
    {#each [1, 2, 3] as key (key)}
      <Skeleton />
    {/each}
  </div>
{:else if status === 'error'}
  <div class="flex flex-col items-start gap-3">
    <Alert variant="error" prefix={t.ui.alert.error} data-testid="tasks-error"
      >{t.tasks.loadError}</Alert
    >
    <Button variant="outline" onclick={onRetry} data-testid="tasks-retry"
      ><Icon name="rotate-cw" />{t.tasks.retry}
    </Button>
  </div>
{:else if !tasks?.length}
  <Alert variant="info" prefix={t.ui.alert.info} data-testid="tasks-empty">{t.tasks.empty}</Alert>
{:else}
  <ul class="flex flex-col" data-testid="tasks-list">
    {#each tasks as task (task.id)}
      <li class="flex items-center gap-4 py-2" data-testid="tasks-item">
        <Icon name={task.done ? 'circle-check' : 'list-todo'} />
        <div>
          <p>{task.title}</p>
          <p class="text-body-sm text-text-muted">{task.done ? t.tasks.done : t.tasks.todo}</p>
        </div>
      </li>
    {/each}
  </ul>
{/if}
