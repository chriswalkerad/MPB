import puppeteer from 'puppeteer'
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import { preview } from 'vite'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const distDir = join(root, 'dist')

const events = JSON.parse(readFileSync(join(root, 'src/data/events.json'), 'utf-8'))
const categories = JSON.parse(readFileSync(join(root, 'src/data/categories.json'), 'utf-8'))

// Collect all routes to prerender
const routes = [
  '/',
  '/events',
  '/submit',
  '/events/archive',
  ...categories.map(c => `/events/category/${c.slug}`),
  ...events.map(e => `/events/${e.slug}`),
]

async function prerender() {
  console.log(`Prerendering ${routes.length} routes...`)

  // Start a Vite preview server to serve the built files
  const server = await preview({
    root,
    preview: { port: 4173, strictPort: true },
  })

  const browser = await puppeteer.launch({ headless: true })

  // Process in batches to avoid overwhelming the browser
  const BATCH_SIZE = 20
  let completed = 0

  for (let i = 0; i < routes.length; i += BATCH_SIZE) {
    const batch = routes.slice(i, i + BATCH_SIZE)
    await Promise.all(batch.map(async (route) => {
      const page = await browser.newPage()
      try {
        await page.goto(`http://localhost:4173${route}`, { waitUntil: 'networkidle0', timeout: 15000 })
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
        console.error(`  Failed: ${route} - ${err.message}`)
      } finally {
        await page.close()
      }
    }))
  }

  await browser.close()
  server.close()
  console.log('Prerendering complete!')
  process.exit(0)
}

prerender().catch((err) => {
  console.error('Prerender failed:', err)
  process.exit(1)
})
