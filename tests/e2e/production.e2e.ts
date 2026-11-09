import { spawn } from 'node:child_process'
import { expect, test } from '@playwright/test'

import type { ChildProcess } from 'node:child_process'

const PORT = 4041
const BASE_URL = `http://localhost:${PORT}`

test.describe('Build de production sans routes de développement', () => {
  test.skip(({ isMobile }) => isMobile, 'Vérification serveur, une seule fois.')
  test.describe.configure({ mode: 'serial' })

  let server: ChildProcess

  test.beforeAll(async () => {
    server = spawn('node', ['build'], {
      env: { ...process.env, PORT: String(PORT), DEV_ROUTES: '0' },
      stdio: 'ignore',
    })
    await expect
      .poll(async () => (await fetch(BASE_URL).catch(() => null))?.status, { timeout: 15_000 })
      .toBe(200)
  })

  test.afterAll(() => {
    server.kill()
  })

  for (const route of ['/charte-graphique', '/_erreur-test']) {
    test(`${route} répond 404`, async ({ request }) => {
      expect((await request.get(`${BASE_URL}${route}`)).status()).toBe(404)
    })
  }
})
