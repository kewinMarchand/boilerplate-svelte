import { ApiError } from '#lib/shared/api/client'
import { serverApiClient } from '#lib/shared/api/client.server'

import { toInquiryProduct } from './http/contactTranslation'

import type { Contact } from '../domain/contactSchema'

/** `null` si l'API ne connaît pas le produit (404). */
export const findInquiryProduct = async (slug: string): Promise<Contact.Product | null> => {
  const { data, response } = await serverApiClient().GET('/api/products/{slug}', {
    params: { path: { slug } },
  })
  if (response.status === 404) return null
  if (!data) throw new ApiError(response)
  return toInquiryProduct(data)
}
