<script lang="ts">
  import { CATALOG_NAVIGATION } from '#lib/shared/config'
  import { resolveHref } from '#lib/shared/routing'
  import { absoluteUrl } from '#lib/shared/seo'
  import { Alert, Badge, largestWebp, ResponsiveImage } from '#lib/shared/ui/kit'
  import { PageHeader } from '#lib/shared/ui/layout'

  import { productHref } from '../domain/catalog'
  import { CATALOG_ROOT_PATH } from '../domain/categoryPath'
  import { formatPrice } from '../domain/price'
  import { EXPOSURE_LABELS } from './labels'
  import ProductGallery from './ProductGallery.svelte'
  import SimilarProducts from './SimilarProducts.svelte'

  import type { Catalog } from '../domain/catalog'
  import type { Seo } from '#lib/shared/seo'
  import type { Snippet } from 'svelte'

  interface Props {
    product: Catalog.ProductPage
    similarProducts: Catalog.Product[]
    /** `false` : aucun prix, ni à l'écran ni dans le JSON-LD (vente en ligne coupée). */
    salesEnabled: boolean
    /** Bouton d'achat ou lien de demande de renseignement, fourni par la couche de routage. */
    purchase?: Snippet<[Catalog.ProductDetail]>
  }

  const { product, similarProducts, salesEnabled, purchase }: Props = $props()

  const IMAGE_SIZES = '(min-width: 1440px) 680px, (min-width: 768px) 50vw, calc(100vw - 32px)'
  const CATALOG: Seo.BreadcrumbItem = { label: CATALOG_NAVIGATION.label, path: CATALOG_ROOT_PATH }

  const detail = $derived(product.status === 'success' ? product.product : undefined)
  const category = $derived(detail?.categoryPath.at(-1))
  const parents = $derived<Seo.BreadcrumbItem[]>([
    CATALOG,
    ...(detail?.categoryPath ?? []).map((link) => ({ label: link.name, path: link.path })),
  ])
  const description = $derived(
    detail
      ? `${detail.name} : exposition ${EXPOSURE_LABELS[detail.exposure].toLowerCase()}, taille ${detail.size}${salesEnabled ? `, ${formatPrice(detail.price)}` : ''}. ${detail.inStock ? 'En stock' : 'En rupture de stock'}, rayon ${category?.name ?? 'catalogue'}.`
      : 'Fiche produit de notre jardinerie tropicale.',
  )
  const galleryImages = $derived(
    detail?.gallery.length ? [...(detail.image ? [detail.image] : []), ...detail.gallery] : [],
  )
  const seo = $derived(
    detail
      ? {
          metaTitle: detail.metaTitle,
          metaDescription: detail.metaDescription,
          image: detail.image
            ? {
                path: largestWebp(detail.image),
                width: detail.image.width,
                height: detail.image.height,
                alt: detail.image.alt || detail.name,
              }
            : undefined,
          jsonLd: [
            {
              '@context': 'https://schema.org',
              '@type': 'Product',
              name: detail.name,
              ...(detail.description.length > 0 && {
                description: detail.description.join(' '),
              }),
              sku: detail.slug,
              url: absoluteUrl(productHref(detail.slug)),
              ...(category && { category: category.name }),
              ...(detail.image && { image: largestWebp(detail.image) }),
              ...(salesEnabled && {
                offers: {
                  '@type': 'Offer',
                  url: absoluteUrl(productHref(detail.slug)),
                  priceCurrency: 'EUR',
                  price: (detail.price / 100).toFixed(2),
                  availability: `https://schema.org/${detail.inStock ? 'InStock' : 'OutOfStock'}`,
                },
              }),
            },
          ],
        }
      : { noindex: true },
  )
</script>

{#if product.status === 'error'}
  <PageHeader title="Produit" {description} parents={[CATALOG]} {seo} />
  <Alert variant="error" data-testid="product-error">{product.message}</Alert>
{:else if detail}
  <article data-testid="product-page">
    <PageHeader title={detail.name} {description} {parents} {seo} titleTestId="product-title" />
    <div class="product-page">
      {#if galleryImages.length > 0}
        <ProductGallery images={galleryImages} sizes={IMAGE_SIZES} />
      {:else if detail.image}
        <ResponsiveImage
          image={detail.image}
          sizes={IMAGE_SIZES}
          fallback
          priority
          class="aspect-square h-auto w-full rounded-md object-cover"
        />
      {/if}
      <div>
        {#if salesEnabled}
          <p class="text-lead font-semibold" data-testid="product-price">
            {formatPrice(detail.price)}
          </p>
        {/if}
        {#if detail.description.length > 0}
          <div data-testid="product-description">
            {#each detail.description as paragraph, index (index)}
              <p class="product-paragraph">{paragraph}</p>
            {/each}
          </div>
        {/if}
        <dl class="product-features">
          <dt>Exposition</dt>
          <dd>{EXPOSURE_LABELS[detail.exposure]}</dd>
          <dt>Taille</dt>
          <dd>{detail.size}</dd>
          <dt>Disponibilité</dt>
          <dd>
            {#if detail.inStock}En stock{:else}<Badge variant="error">Rupture de stock</Badge>{/if}
          </dd>
        </dl>
        {#if detail.attributes.length > 0}
          <dl class="product-features" data-testid="product-attributes">
            {#each detail.attributes as attribute (attribute.code)}
              <dt>{attribute.label}</dt>
              <dd>
                {attribute.unit ? `${attribute.value}\u00a0${attribute.unit}` : attribute.value}
              </dd>
            {/each}
          </dl>
        {/if}
        {@render purchase?.(detail)}
        {#if category}
          <p>
            <a href={resolveHref(category.path)} class="bui-link">
              Voir les autres produits : {category.name}
            </a>
          </p>
        {/if}
      </div>
    </div>
  </article>
  {#if similarProducts.length}
    <SimilarProducts products={similarProducts} showPrice={salesEnabled} />
  {/if}
{/if}

<style>
  .product-page {
    display: grid;
    gap: var(--bui-space-8);
    align-items: start;
  }

  @media (min-width: 768px) {
    .product-page {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  article :global(h1) {
    overflow-wrap: break-word;
  }

  .product-features {
    display: grid;
    grid-template-columns: max-content 1fr;
    gap: var(--bui-space-2) var(--bui-space-6);
    margin-block: var(--bui-space-6);
  }

  .product-features dt {
    font-weight: 600;
  }

  .product-paragraph {
    margin-block: 0 var(--bui-space-4);
  }
</style>
