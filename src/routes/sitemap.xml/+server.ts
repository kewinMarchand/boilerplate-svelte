import { buildSitemapXml } from '#lib/shared/seo'

import { listArticlePaths } from '#lib/modules/blog/index.server'
import { listCatalogPaths, listProductPaths } from '#lib/modules/catalog/index.server'

import type { RequestHandler } from './$types'

export const GET: RequestHandler = async () =>
  new Response(
    buildSitemapXml([
      ...(await listCatalogPaths()),
      ...(await listProductPaths()),
      ...(await listArticlePaths()),
    ]),
    { headers: { 'content-type': 'application/xml; charset=utf-8' } },
  )
