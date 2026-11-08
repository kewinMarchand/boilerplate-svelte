import { buildWebManifest } from '#lib/shared/seo'

import type { RequestHandler } from './$types'

export const GET: RequestHandler = ({ locals }) =>
  new Response(JSON.stringify(buildWebManifest(locals.siteIdentity)), {
    headers: { 'content-type': 'application/manifest+json' },
  })
