import { assertDevRoutesEnabled } from '#lib/shared/errors/index.server'
import { dictionarySections } from '#lib/shared/i18n/index.server'

import type { PageServerLoad } from './$types'

export const load: PageServerLoad = ({ locals }) => {
  assertDevRoutesEnabled()
  return { pageDictionary: dictionarySections(locals.locale, ['blog', 'catalog']) }
}
