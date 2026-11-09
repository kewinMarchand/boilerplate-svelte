import { dictionarySections } from '#lib/shared/i18n/index.server'

import type { PageServerLoad } from './$types'

export const load: PageServerLoad = ({ locals }) => ({
  pageDictionary: dictionarySections(locals.locale, ['tasks']),
})
