import { ApiError, createApiClient } from '#lib/shared/api/client'

import { toTask } from './http/taskTranslation'

import type { Task } from '../domain/task'

/** Appelée dans le navigateur, par TanStack Query ; `locale` : langue de la page d'un site multilingue. */
export const findAllTasks = async (locale?: string): Promise<Task.Entity[]> => {
  const { data, response } = await createApiClient(fetch, null, locale).GET('/api/tasks')
  if (!data) throw new ApiError(response)
  return data.map(toTask)
}
