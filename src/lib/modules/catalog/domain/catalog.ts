import type { Price } from './price'
import type { AppPath } from '#lib/shared/routing'
import type { ImageView } from '#lib/shared/ui/kit'

export const EXPOSURES = ['soleil', 'mi-ombre', 'ombre'] as const
export const SIZES = ['S', 'M', 'L'] as const
export const SORTS = ['pertinence', 'prix-asc', 'prix-desc', 'nom'] as const
export const VIEWS = ['grille', 'liste'] as const
export const PAGE_SIZE = 12
/** Plus grande page acceptée par l'API. */
export const MAX_PAGE_SIZE = 48
/** Produits du carrousel « Produits similaires » de la fiche. */
export const SIMILAR_LIMIT = 8

export const productHref = (slug: string): AppPath => `/produit/${slug}`

export declare namespace Catalog {
  type Exposure = (typeof EXPOSURES)[number]
  type Size = (typeof SIZES)[number]
  type Sort = (typeof SORTS)[number]
  type View = (typeof VIEWS)[number]
  type Facet = 'exposure' | 'size'

  /** Langue de la page et langues du site, pour retrouver un élément dans chaque langue. */
  interface Languages {
    locale: string
    locales: string[]
  }

  /** Slug d'un élément dans une langue, tel que l'API le donne (`alternates`). */
  interface SlugAlternate {
    locale: string
    slug: string
  }

  /** Chemin d'un élément dans une langue, sans préfixe de langue (sélecteur, hreflang, sitemap). */
  interface Alternate {
    locale: string
    path: AppPath
  }

  interface Product {
    id: string
    slug: string
    name: string
    categorySlug: string
    price: Price
    exposure: Exposure
    size: Size
    inStock: boolean
    image: ImageView | null
  }

  /** Fiche : le produit, sa description et le chemin de sa catégorie, de la racine à elle (fil d'Ariane). */
  interface ProductDetail extends Product {
    categoryPath: CategoryPath
    /** Paragraphes de la description, vide si l'admin n'en a pas écrit. */
    description: string[]
    attributes: ProductAttribute[]
    /** Images de la galerie, sans l'image principale ; vide si aucune. */
    gallery: ImageView[]
    /** Titre et description pour les moteurs de recherche, vides si l'admin n'en a pas saisi. */
    metaTitle: string
    metaDescription: string
    /** La fiche dans chaque langue où le produit existe ; vide sur un site monolingue. */
    alternates: Alternate[]
  }

  /** Attribut configuré dans l'admin et renseigné sur le produit : `value` est le libellé affiché. */
  interface ProductAttribute {
    code: string
    label: string
    value: string
    unit: string | null
  }

  type ProductLoad =
    | { status: 'success'; product: ProductDetail }
    | { status: 'not-found' }
    | { status: 'error'; message: string }

  /** Ce qu'affiche la fiche : le produit, ou le message d'erreur de l'API. */
  type ProductPage = Exclude<ProductLoad, { status: 'not-found' }>

  type Featured = { status: 'success'; products: Product[] } | { status: 'error'; message: string }

  interface Category {
    slug: string
    name: string
    description: string
    children: Category[]
    alternates: SlugAlternate[]
  }

  interface CategoryLink {
    slug: string
    name: string
    path: AppPath
  }

  /** Chaîne des catégories de la racine à la catégorie courante, validée contre l'arbre. */
  type CategoryPath = CategoryLink[]

  interface Query {
    exposures: Exposure[]
    sizes: Size[]
    priceMin: number | undefined
    priceMax: number | undefined
    inStock: boolean
    /** Valeurs cochées des attributs filtrables, par code d'attribut. */
    attributes: Record<string, string[]>
    sort: Sort
    view: View
    page: number
  }

  interface FacetCount<T extends string> {
    value: T
    count: number
  }

  interface AttributeFacet {
    code: string
    label: string
    values: (FacetCount<string> & { label: string })[]
  }

  interface Facets {
    exposure: FacetCount<Exposure>[]
    size: FacetCount<Size>[]
    attributes: AttributeFacet[]
  }

  interface Listing {
    chain: CategoryPath
    /** La page de la catégorie dans chaque langue où toute sa chaîne existe. */
    alternates: Alternate[]
    description: string
    children: (CategoryLink & { count: number })[]
    products: Product[]
    total: number
    page: number
    totalPages: number
    facets: Facets
  }

  type Result = { status: 'success'; listing: Listing } | { status: 'error'; message: string }

  type Status = 'pending' | 'error' | 'success'
}
