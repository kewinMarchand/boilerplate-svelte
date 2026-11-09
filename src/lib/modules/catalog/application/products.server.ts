import { productHref } from '../domain/catalog'
import {
  findAllProductSlugs,
  findFeaturedProducts,
  findProduct,
  findSimilarProducts,
} from '../infrastructure/catalogRepository'
import { FeaturedProductsLoadError } from './FeaturedProductsLoadError'
import { ProductLoadError } from './ProductLoadError'

import type { Catalog } from '../domain/catalog'
import type { AppPath } from '#lib/shared/routing'

export const loadProduct = async (slug: string): Promise<Catalog.ProductLoad> => {
  try {
    const product = await findProduct(slug)
    return product ? { status: 'success', product } : { status: 'not-found' }
  } catch {
    return { status: 'error', message: new ProductLoadError().message }
  }
}

/** Produits similaires de la fiche (même catégorie) ; aucun si l'API ne répond pas : la fiche reste l'essentiel. */
export const loadSimilarProducts = (product: Catalog.Product): Promise<Catalog.Product[]> =>
  findSimilarProducts(product.categorySlug, product.slug).catch(() => [])

export const loadFeaturedProducts = async () => {
  try {
    const featured: Catalog.Featured = {
      status: 'success',
      products: await findFeaturedProducts(),
    }
    return { featured }
  } catch {
    const featured: Catalog.Featured = {
      status: 'error',
      message: new FeaturedProductsLoadError().message,
    }
    return { featured }
  }
}

/** Fiches d'une langue pour le sitemap, associées d'une langue à l'autre par `key` ; aucune si l'API ne répond pas. */
export const listProductEntries = async (
  locale: string,
): Promise<{ key: string; path: AppPath }[]> =>
  (await findAllProductSlugs(locale).catch(() => [])).map(({ id, slug }) => ({
    key: id,
    path: productHref(slug),
  }))
