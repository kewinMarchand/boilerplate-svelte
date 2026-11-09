import { error } from '@sveltejs/kit'

import { dictionarySections } from '#lib/shared/i18n/index.server'

import {
  loadProduct,
  loadProductTranslations,
  loadSimilarProducts,
} from '#lib/modules/catalog/index.server'

import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ params, locals }) => {
  const product = await loadProduct(params.slug)
  if (product.status === 'not-found') error(404, 'Page introuvable')
  const [similarProducts, translations] =
    product.status === 'success'
      ? await Promise.all([
          loadSimilarProducts(product.product),
          locals.siteIdentity.salesEnabled
            ? loadProductTranslations(product.product, locals.locale.locale)
            : [],
        ])
      : [[], []]
  return {
    product,
    similarProducts,
    translations,
    pageDictionary: dictionarySections(locals.locale, [
      'catalog',
      'product',
      'carousel',
      'contact',
    ]),
    alternates: product.status === 'success' ? product.product.alternates : undefined,
  }
}
