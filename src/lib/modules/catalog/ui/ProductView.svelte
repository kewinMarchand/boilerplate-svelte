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

  import type { Catalog } from '../domain/catalog'
  import type { Seo } from '#lib/shared/seo'

  interface Props {
    product: Catalog.ProductPage
  }

  const { product }: Props = $props()

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
      ? `${detail.name} : exposition ${EXPOSURE_LABELS[detail.exposure].toLowerCase()}, taille ${detail.size}, ${formatPrice(detail.price)}. ${detail.inStock ? 'En stock' : 'En rupture de stock'}, rayon ${category?.name ?? 'catalogue'}.`
      : 'Fiche produit de notre jardinerie tropicale.',
  )
  const seo = $derived(
    detail
      ? {
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
              sku: detail.slug,
              url: absoluteUrl(productHref(detail.slug)),
              ...(category && { category: category.name }),
              ...(detail.image && { image: largestWebp(detail.image) }),
              offers: {
                '@type': 'Offer',
                url: absoluteUrl(productHref(detail.slug)),
                priceCurrency: 'EUR',
                price: (detail.price / 100).toFixed(2),
                availability: `https://schema.org/${detail.inStock ? 'InStock' : 'OutOfStock'}`,
              },
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
      {#if detail.image}
        <ResponsiveImage
          image={detail.image}
          sizes={IMAGE_SIZES}
          priority
          class="aspect-square h-auto w-full rounded-md object-cover"
        />
      {/if}
      <div>
        <p class="text-lead font-semibold" data-testid="product-price">
          {formatPrice(detail.price)}
        </p>
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
</style>
