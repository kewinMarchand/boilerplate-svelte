import { contactActions, loadContactPage } from '#lib/modules/contact/index.server'

import type { Actions, PageServerLoad } from './$types'

export const load: PageServerLoad = ({ url }) => loadContactPage(url)

export const actions: Actions = contactActions
