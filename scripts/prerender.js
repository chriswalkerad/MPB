import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import { preview } from 'vite'
import { getCities } from '../src/lib/cities.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const distDir = join(root, 'dist')

const events = JSON.parse(readFileSync(join(root, 'src/data/events.json'), 'utf-8'))
const categories = JSON.parse(readFileSync(join(root, 'src/data/categories.json'), 'utf-8'))
const briefs = JSON.parse(readFileSync(join(root, 'src/data/briefs.json'), 'utf-8'))

// Collect all routes to prerender
const routes = [
  '/',
  '/events',
  '/news',
  '/brief',
  '/submit',
  '/events/archive',
  ...categories.map(c => `/events/category/${c.slug}`),
  ...getCities(events).map(c => `/events/city/${c.slug}`),
  ...briefs.map(b => `/brief/${b.slug}`),
  ...events.map(e => `/events/${e.slug}`),
]

async function prerender() {
  console.log(`Prerendering ${routes.length} routes...`)

  // Start a Vite preview server to serve the built files (port 0 = random available)
  const server = await preview({
    root,
    preview: { port: 0, strictPort: false },
  })
  const address = server.httpServer.address()
  const port = address.port

  // Vercel's build image lacks Chrome's shared system libraries, so use
  // @sparticuz/chromium (self-contained build) there and regular puppeteer locally.
  let browser
  if (process.env.VERCEL) {
    const { default: chromium } = await import('@sparticuz/chromium')
    const { default: puppeteerCore } = await import('puppeteer-core')
    browser = await puppeteerCore.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(),
      headless: true,
    })
  } else {
    const { default: puppeteer } = await import('puppeteer')
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu', '--disable-dev-shm-usage'],
    })
  }

  // Process in batches to avoid overwhelming the browser
  const BATCH_SIZE = 20
  let completed = 0
  const failed = []

  for (let i = 0; i < routes.length; i += BATCH_SIZE) {
    const batch = routes.slice(i, i + BATCH_SIZE)
    await Promise.all(batch.map(async (route) => {
      const page = await browser.newPage()
      try {
        await page.goto(`http://localhost:${port}${route}`, { waitUntil: 'networkidle0', timeout: 15000 })
        // Wait for React to render and MetaTags to update the head
        await page.waitForFunction(() => document.title !== '', { timeout: 5000 }).catch(() => {})

        const html = await page.content()

        // Determine output path
        const filePath = route === '/'
          ? join(distDir, 'index.html')
          : join(distDir, route, 'index.html')

        const dir = dirname(filePath)
        if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
        writeFileSync(filePath, html)

        completed++
        if (completed % 50 === 0 || completed === routes.length) {
          console.log(`  ${completed}/${routes.length} routes prerendered`)
        }
      } catch (err) {
        failed.push(route)
        console.error(`  Failed: ${route} - ${err.message}`)
      } finally {
        await page.close()
      }
    }))
  }

  await browser.close()
  server.httpServer.close()

  // A failed route would ship as an empty SPA shell — invisible to crawlers.
  if (failed.length > 0) {
    console.error(`Prerender failed for ${failed.length} route(s):`)
    failed.forEach(r => console.error(`  ${r}`))
    process.exit(1)
  }

  console.log('Prerendering complete!')
  process.exit(0)
}

prerender().catch((err) => {
  console.error('Prerender failed:', err)
  process.exit(1)
})
