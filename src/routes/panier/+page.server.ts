import { error } from '@sveltejs/kit'

import type { PageServerLoad } from './$types'

export const load: PageServerLoad = ({ locals }) => {
  if (!locals.siteIdentity.salesEnabled) error(404, 'Page introuvable')
}
