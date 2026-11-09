import { spawn } from 'node:child_process'
import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import { createServer } from 'node:http'
import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

import { MODES } from './routes'
import { gotoHydrated, useMode } from './support'

import type { Page } from '@playwright/test'
import type { ChildProcess } from 'node:child_process'
import type { Server } from 'node:http'

const API_URL = process.env.API_URL || 'http://localhost:8090'
const LIBRARY_PRIMARY = { light: '#1d4ed8', enhanced: '#1e3a8a' }

const primaryOnHtml = (page: Page) =>
  page.evaluate(() =>
    getComputedStyle(document.documentElement).getPropertyValue('--bui-color-primary').trim(),
  )

test.describe('Identité du site, sans logo ni couleurs saisis (fixtures)', () => {
  test('le header garde le pictogramme et le nom en texte', async ({ page }) => {
    await page.goto('/')
    const logo = page.getByTestId('layout-logo')

    await expect(logo.locator('img[src="/logo-mark.svg"]')).toHaveAttribute('alt', '')
    await expect(logo).toHaveText(/\S/)
    await expect(logo.locator('picture')).toHaveCount(0)
  })

  test('aucun bloc de style : les jetons de la bibliothèque restent', async ({ page }) => {
    await page.goto('/')

    await expect(page.locator('head style')).toHaveCount(0)
    expect(await primaryOnHtml(page)).toBe(LIBRARY_PRIMARY.light)
  })
})

const THEME = {
  light: {
    primary: '#c2410c',
    'primary-dark': '#923109',
    'on-primary': '#ffffff',
    'primary-surface-subtle': '#faf0ec',
    'primary-surface': '#f4ddd3',
    'primary-surface-strong': '#ebc2b1',
    secondary: '#0f766e',
    'secondary-dark': '#0b5852',
    'on-secondary': '#ffffff',
    'secondary-surface-subtle': '#ecf4f3',
    'secondary-surface': '#d4e6e5',
    'secondary-surface-strong': '#b2d3d1',
  },
  dark: {
    primary: '#da8d6d',
    'primary-dark': '#eabcaa',
    'on-primary': '#0f141d',
    'primary-surface-subtle': '#1f1e23',
    'primary-surface': '#272327',
    'primary-surface-strong': '#362b2c',
    secondary: '#6fada8',
    'secondary-dark': '#abcfcc',
    'on-secondary': '#0f141d',
    'secondary-surface-subtle': '#172028',
    'secondary-surface': '#1b262e',
    'secondary-surface-strong': '#213137',
  },
}

/**
 * API factice devant l'API réelle : elle sert une identité complète (logo, couleurs, thème sombre par défaut) et relaie
 * tout le reste. Le rendu est serveur : l'interception réseau de Playwright ne verrait pas l'appel.
 */
const startFakeApi = (port: number) => {
  const identity = {
    name: 'Oraki',
    tagline: 'Plantes rares et tropicales, livrées chez vous.',
    logo: {
      alt: 'Oraki',
      width: 640,
      height: 360,
      sources: [{ type: 'image/webp', srcset: `http://localhost:${port}/logo-640.webp 640w` }],
      src: `http://localhost:${port}/logo-640.webp`,
    },
    defaultColorScheme: 'dark',
    theme: THEME,
    salesEnabled: true,
  }
  return createServer(async (request, response) => {
    const url = request.url ?? '/'
    if (url === '/api/site-identity') {
      response.writeHead(200, { 'content-type': 'application/json' }).end(JSON.stringify(identity))
      return
    }
    if (url === '/logo-640.webp') {
      const image = await readFile('static/images/hero-640.webp')
      response.writeHead(200, { 'content-type': 'image/webp' }).end(image)
      return
    }
    const upstream = await fetch(`${API_URL}${url}`, {
      headers: { accept: request.headers.accept ?? 'application/json' },
    })
    response
      .writeHead(upstream.status, {
        'content-type': upstream.headers.get('content-type') ?? 'application/json',
      })
      .end(Buffer.from(await upstream.arrayBuffer()))
  }).listen(port)
}

test.describe('Identité du site, avec logo et couleurs (API factice)', () => {
  test.describe.configure({ mode: 'serial' })

  let app: ChildProcess | undefined
  let api: Server | undefined
  let appUrl = ''

  test.beforeAll(async () => {
    const offset = test.info().project.name === 'mobile' ? 2 : 0
    const appPort = 4048 + offset
    const apiPort = 4049 + offset
    appUrl = `http://localhost:${appPort}`
    api = startFakeApi(apiPort)
    app = spawn('node', ['build'], {
      env: {
        ...process.env,
        PORT: String(appPort),
        PUBLIC_SITE_URL: appUrl,
        API_URL: `http://localhost:${apiPort}`,
      },
      stdio: 'ignore',
    })
    await expect
      .poll(async () => (await fetch(appUrl).catch(() => null))?.status, { timeout: 15_000 })
      .toBe(200)
  })

  test.afterAll(() => {
    app?.kill()
    api?.close()
  })

  test('le header affiche le logo seul, nommé par le nom du site', async ({ page }) => {
    await page.goto(appUrl)
    const logo = page.getByTestId('layout-logo')
    const image = logo.getByRole('img', { name: 'Oraki' })

    await expect(logo).toHaveAccessibleName('Oraki')
    await expect(image).toHaveAttribute('fetchpriority', 'high')
    expect((await image.boundingBox())?.height).toBe(40)
    await expect(logo.locator('img[src="/logo-mark.svg"]')).toHaveCount(0)
    await expect(logo).toHaveText('')
  })

  test('le nom et l’accroche de l’API habillent les pages', async ({ page }) => {
    await page.goto(appUrl)

    await expect(page).toHaveTitle('Oraki')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Oraki')
    await expect(page.getByTestId('home-hero')).toContainText(
      'Plantes rares et tropicales, livrées chez vous.',
    )
    await expect(page.getByTestId('app-footer')).toContainText('Oraki')
    await expect(page.locator('meta[property="og:site_name"]')).toHaveAttribute('content', 'Oraki')

    await page.goto(`${appUrl}/contact`)
    await expect(page).toHaveTitle(/ · Oraki$/)
  })

  test('le manifeste porte le nom et la couleur principale', async ({ request }) => {
    const manifest = await (await request.get(`${appUrl}/manifest.webmanifest`)).json()

    expect(manifest).toMatchObject({
      name: 'Oraki',
      short_name: 'Oraki',
      theme_color: THEME.light.primary,
    })
  })

  test('le thème par défaut est servi, le choix mémorisé l’emporte', async ({ page, request }) => {
    const html = await (await request.get(appUrl)).text()
    expect(html).toContain('<html lang="fr" data-color-scheme="dark">')

    await page.addInitScript(() => localStorage.setItem('color-scheme', 'light'))
    await page.goto(appUrl)
    await expect(page.locator('html')).toHaveAttribute('data-color-scheme', 'light')
  })

  test('avec un défaut sombre, « système » reste auto après rechargement', async ({ page }) => {
    await gotoHydrated(page, appUrl)
    await expect(page.locator('html')).toHaveAttribute('data-color-scheme', 'dark')

    await page.getByTestId('color-scheme-toggle').click()
    await page.getByTestId('color-scheme-option-auto').click()
    expect(await page.evaluate(() => localStorage.getItem('color-scheme'))).toBe('auto')

    await page.reload()
    await expect(page.locator('html')).toHaveAttribute('data-color-scheme', 'auto')
  })

  test('le bloc de style est autorisé par son empreinte dans la CSP', async ({ request }) => {
    const response = await request.get(appUrl)
    const style = (await response.text()).match(/<style>(.*?)<\/style>/)?.[1] ?? ''
    const hash = createHash('sha256').update(style).digest('base64')

    expect(style).toContain('--bui-color-primary:#c2410c')
    expect(response.headers()['content-security-policy-report-only']).toContain(
      `style-src-elem 'self' 'sha256-${hash}'`,
    )
  })

  const EXPECTED_PRIMARY = {
    standard: THEME.light.primary,
    dark: THEME.dark.primary,
    enhanced: LIBRARY_PRIMARY.enhanced,
  }

  for (const mode of MODES) {
    test(`mode ${mode} : couleur principale ${EXPECTED_PRIMARY[mode]} et aucune violation axe`, async ({
      page,
    }) => {
      // Défaut sombre servi : le clair se choisit
      if (mode === 'standard') {
        await page.addInitScript(() => localStorage.setItem('color-scheme', 'light'))
      }
      await useMode(page, mode)
      await gotoHydrated(page, appUrl)

      expect(await primaryOnHtml(page)).toBe(EXPECTED_PRIMARY[mode])
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze()
      expect(results.violations).toEqual([])
    })
  }
})
