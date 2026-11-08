import { findPageMetas } from '../infrastructure/pageMetasRepository'

import type { PageMetas } from '../domain/pageMetas'

/** API en erreur ou injoignable : aucune métadonnée administrée, les pages gardent les leurs. */
export const loadPageMetas = (): Promise<PageMetas> => findPageMetas().catch(() => ({}))
