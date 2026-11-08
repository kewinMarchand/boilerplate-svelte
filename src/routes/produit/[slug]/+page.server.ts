import { error } from '@sveltejs/kit'

import { loadProduct, loadSimilarProducts } from '#lib/modules/catalog/index.server'

import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ params }) => {
  const product = await loadProduct(params.slug)
  if (product.status === 'not-found') error(404, 'Page introuvable')
  const similarProducts =
    product.status === 'success' ? await loadSimilarProducts(product.product) : []
  return { product, similarProducts }
}
