import type { AppPath } from '#lib/shared/routing'

export const INQUIRY_PARAM = 'produit'

export const inquiryHref = (slug: string): AppPath =>
  `/contact?${new URLSearchParams({ [INQUIRY_PARAM]: slug })}`
