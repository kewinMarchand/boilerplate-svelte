import { alternatesByKey } from '#lib/shared/i18n'
import { buildSitemapXml } from '#lib/shared/seo'

import { listArticleEntries } from '#lib/modules/blog/index.server'
import { listCatalogAlternates, listProductEntries } from '#lib/modules/catalog/index.server'

import type { RequestHandler } from './$types'
import type { AppPath } from '#lib/shared/routing'

export const GET: RequestHandler = async ({ locals }) => {
  const { locales } = locals.locale
  const byLocale = (list: (locale: string) => Promise<{ key: string; path: AppPath }[]>) =>
    Promise.all(locales.map(async (locale) => ({ locale, entries: await list(locale) })))
  const [categories, products, articles] = await Promise.all([
    listCatalogAlternates(locals.locale),
    byLocale(listProductEntries),
    byLocale(listArticleEntries),
  ])
  return new Response(
    buildSitemapXml(locals.locale, [
      ...categories,
      ...alternatesByKey(products),
      ...alternatesByKey(articles),
    ]),
    { headers: { 'content-type': 'application/xml; charset=utf-8' } },
  )
}
