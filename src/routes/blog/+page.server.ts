import { loadArticles } from '#lib/modules/blog/index.server'

import type { PageServerLoad } from './$types'

export const load: PageServerLoad = (event) => loadArticles(event)
