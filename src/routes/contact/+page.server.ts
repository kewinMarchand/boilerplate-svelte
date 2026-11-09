import { dictionarySections } from '#lib/shared/i18n/index.server'

import { contactActions, loadContactPage } from '#lib/modules/contact/index.server'

import type { Actions, PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ url, locals }) => ({
  ...(await loadContactPage(url, locals.locale)),
  pageDictionary: dictionarySections(locals.locale, ['contact']),
})

export const actions: Actions = contactActions
