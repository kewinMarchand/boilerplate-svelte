import { createQuery } from '@tanstack/svelte-query'

import { useLocale } from '#lib/shared/i18n'

import { findAllTasks } from '#lib/modules/task/infrastructure/taskRepository'
import { TasksLoadError } from '#lib/modules/task/infrastructure/TasksLoadError'

export const TASKS_QUERY_KEY = ['tasks'] as const

const fetchTasks = async (locale: string | undefined) => {
  try {
    return await findAllTasks(locale)
  } catch {
    throw new TasksLoadError()
  }
}

/**
 * Langue de la page sur un site multilingue (monolingue : appel inchangé). Elle vaut pour tout le document :
 * changer de langue recharge la page, la clé n'en dépend pas.
 */
export const useTasks = () => {
  const { locale, locales } = useLocale()
  const apiLocale = locales.length > 1 ? locale : undefined
  return createQuery(() => ({ queryKey: TASKS_QUERY_KEY, queryFn: () => fetchTasks(apiLocale) }))
}
