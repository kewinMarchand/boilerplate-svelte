import { error } from '@sveltejs/kit'

import { loadProduct } from '#lib/modules/catalog/index.server'

import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ params }) => {
  const product = await loadProduct(params.slug)
  if (product.status === 'not-found') error(404, 'Page introuvable')
  return { product }
}
