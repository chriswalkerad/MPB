import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import { preview } from 'vite'
import { buildRoutes } from '../src/lib/routes.js'
import { LOCATION_STORAGE_KEY, ALL_LOCATIONS } from '../src/lib/location.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const distDir = join(root, 'dist')

const events = JSON.parse(readFileSync(join(root, 'src/data/events.json'), 'utf-8'))
const categories = JSON.parse(readFileSync(join(root, 'src/data/categories.json'), 'utf-8'))
const briefs = JSON.parse(readFileSync(join(root, 'src/data/briefs.json'), 'utf-8'))

let { routes: routeDefs } = buildRoutes({ events, categories, briefs })

// PRERENDER_LIMIT=25 slices the route list for smoke tests
if (process.env.PRERENDER_LIMIT) {
  routeDefs = routeDefs.slice(0, parseInt(process.env.PRERENDER_LIMIT, 10) || routeDefs.length)
}

const routes = routeDefs.map(d => d.path)

// Crawlers must see the unfiltered national view. Seeding the app's
// "All Locations" state stops LocationProvider from geolocating the build
// machine and baking one metro's filtered view into every static page.
const NEUTRAL_LOCATION = JSON.stringify(ALL_LOCATIONS)

// A critical route's failure fails the build; other routes fall back to the
// SPA shell and are dropped from the sitemap instead.
const criticalRoutes = new Set(routeDefs.filter(d => d.critical).map(d => d.path))
const isCritical = (route) => criticalRoutes.has(route)

const FAILURE_BUDGET = 0.02
const MAX_RETRIES = Math.min(20, routes.length)
const BATCH_SIZE = process.env.VERCEL ? 8 : 20

async function prerender() {
  console.log(`Prerendering ${routes.length} routes...`)

  // Vite preview server serves the built files (port 0 = random available)
  const server = await preview({
    root,
    preview: { port: 0, strictPort: false },
  })
  const localOrigin = `http://localhost:${server.httpServer.address().port}`

  // Vercel's build image lacks Chrome's shared system libraries, so use
  // @sparticuz/chromium (self-contained build) there and regular puppeteer locally.
  async function launchBrowser() {
    if (process.env.VERCEL) {
      const { default: chromium } = await import('@sparticuz/chromium')
      const { default: puppeteerCore } = await import('puppeteer-core')
      // Graphics stay ON: the homepage's three.js bunker needs a WebGL
      // context, which sparticuz's swiftshader provides in headless.
      return puppeteerCore.launch({
        args: chromium.args,
        executablePath: await chromium.executablePath(),
        headless: true,
      })
    }
    const { default: puppeteer } = await import('puppeteer')
    return puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu', '--disable-dev-shm-usage'],
    })
  }

  let browser = await launchBrowser()

  // sparticuz Chromium runs --single-process: one renderer crash kills the
  // whole browser. Relaunch behind a shared promise so concurrent routes
  // don't each spawn their own browser.
  let relaunching = null
  async function ensureBrowser() {
    if (browser?.connected) return browser
    if (!relaunching) {
      relaunching = launchBrowser().then((b) => {
        browser = b
        relaunching = null
        console.log('  Browser crashed — relaunched')
        return b
      })
      // A failed relaunch must also clear the latch, or every later render
      // and retry would await this same rejected promise.
      relaunching.catch(() => { relaunching = null })
    }
    return relaunching
  }

  async function renderRoute(route, timeout) {
    const b = await ensureBrowser()
    const page = await b.newPage()
    try {
      await page.evaluateOnNewDocument((key, value) => {
        try { localStorage.setItem(key, value) } catch (e) { /* ignore */ }
      }, LOCATION_STORAGE_KEY, NEUTRAL_LOCATION)

      // Only the local preview server may be fetched: third-party images,
      // fonts, analytics, and ip-api.com would make networkidle0
      // nondeterministic and could poison the geo state.
      await page.setRequestInterception(true)
      page.on('request', (req) => {
        let allow = false
        try { allow = new URL(req.url()).origin === localOrigin } catch (e) { /* block */ }
        if (allow) req.continue().catch(() => {})
        else req.abort().catch(() => {})
      })

      await page.goto(`${localOrigin}${route}`, { waitUntil: 'networkidle0', timeout })

      // Proof React committed this route: #root must be populated AND the
      // canonical must match AND carry data-app="true". MetaTags sets the
      // href and stamps data-app in the same post-commit effect, so only the
      // route's own component can satisfy this. The static shell canonical
      // in index.html lacks data-app, which keeps "/" from passing on the
      // shell — or on the Suspense fallback the lazy Homepage commits into
      // #root before its chunk resolves.
      await page.waitForFunction((wantPath) => {
        const root = document.getElementById('root')
        if (!root || root.childElementCount === 0) return false
        const link = document.querySelector('link[rel="canonical"]')
        if (!link || link.getAttribute('data-app') !== 'true') return false
        try {
          const got = new URL(link.href).pathname.replace(/\/+$/, '') || '/'
          return got === wantPath
        } catch (e) {
          return false
        }
      }, { timeout }, route.replace(/\/+$/, '') || '/')

      const html = await page.content()
      const filePath = route === '/'
        ? join(distDir, 'index.html')
        : join(distDir, route, 'index.html')
      const dir = dirname(filePath)
      if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
      writeFileSync(filePath, html)
    } finally {
      await page.close().catch(() => {})
    }
  }

  // The '/' render overwrites dist/index.html; keep the neutral shell so
  // within-budget failed routes can serve it instead of baked homepage HTML.
  const shellHtml = readFileSync(join(distDir, 'index.html'), 'utf-8')

  let completed = 0
  const failed = []

  for (let i = 0; i < routes.length; i += BATCH_SIZE) {
    const batch = routes.slice(i, i + BATCH_SIZE)
    await Promise.all(batch.map(async (route) => {
      try {
        await renderRoute(route, 15000)
        completed++
        if (completed % 50 === 0 || completed === routes.length) {
          console.log(`  ${completed}/${routes.length} routes prerendered`)
        }
      } catch (err) {
        failed.push(route)
        console.error(`  Failed: ${route} - ${err.message}`)
      }
    }))
  }

  // Retry failures one at a time with a longer timeout — a busy CPU can
  // starve renders under batch load. Capped so a systemic failure can't
  // run the build into Vercel's 45-minute limit; critical routes get
  // retry slots first since their failure aborts the build.
  failed.sort((a, b) => (isCritical(b) ? 1 : 0) - (isCritical(a) ? 1 : 0))
  const stillFailed = failed.slice(MAX_RETRIES)
  for (const route of failed.slice(0, MAX_RETRIES)) {
    try {
      await renderRoute(route, 30000)
      completed++
      console.log(`  Retry succeeded: ${route}`)
    } catch (err) {
      stillFailed.push(route)
      console.error(`  Retry failed: ${route} - ${err.message}`)
    }
  }

  await browser.close().catch(() => {})
  server.httpServer.close()

  // The sitemap generator runs next and drops these routes.
  if (!existsSync(distDir)) mkdirSync(distDir, { recursive: true })
  writeFileSync(join(distDir, '.prerender-failures.json'), JSON.stringify(stillFailed, null, 2))

  // Without a file at its path, a failed route would fall through the
  // catch-all rewrite to the prerendered homepage — full homepage HTML and
  // canonical on the wrong URL. Serve the neutral shell there instead,
  // minus the shell's homepage canonical/og:url.
  const fallbackShell = shellHtml
    .replace(/^\s*<link rel="canonical"[^>]*>\n?/m, '')
    .replace(/^\s*<meta property="og:url"[^>]*>\n?/m, '')
  for (const route of stillFailed) {
    if (isCritical(route)) continue
    const dir = join(distDir, route)
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
    writeFileSync(join(dir, 'index.html'), fallbackShell)
  }

  const criticalFailed = stillFailed.filter(isCritical)
  const budget = Math.floor(routes.length * FAILURE_BUDGET)

  if (criticalFailed.length > 0 || stillFailed.length > budget) {
    console.error(`Prerender failed: ${stillFailed.length} route(s) unrendered (budget ${budget}), ${criticalFailed.length} critical:`)
    stillFailed.slice(0, 10).forEach((r) => console.error(`  ${r}`))
    process.exit(1)
  }

  if (stillFailed.length > 0) {
    console.warn(`Prerendering complete with ${stillFailed.length} non-critical failure(s) (within ${budget}-route budget, excluded from sitemap):`)
    stillFailed.forEach((r) => console.warn(`  ${r}`))
  } else {
    console.log('Prerendering complete!')
  }
  process.exit(0)
}

prerender().catch((err) => {
  console.error('Prerender failed:', err)
  process.exit(1)
})
