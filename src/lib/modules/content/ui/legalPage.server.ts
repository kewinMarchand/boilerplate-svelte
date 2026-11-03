import { LegalPageLoadError } from '../infrastructure/LegalPageLoadError'
import { findLegalPage } from '../infrastructure/legalPageRepository'

import type { LegalPage } from '../domain/legalPage'

export const loadLegalPage = async (slug: LegalPage.Slug): Promise<LegalPage.Load> => {
  try {
    const page = await findLegalPage(slug)
    return page ? { status: 'success', page } : { status: 'not-found' }
  } catch {
    return { status: 'error', message: new LegalPageLoadError().message }
  }
}
