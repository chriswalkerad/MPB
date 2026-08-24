import { readFileSync, writeFileSync, existsSync, unlinkSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import { buildRoutes } from '../src/lib/routes.js'
import { SITE_ORIGIN } from '../src/lib/site.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')

const events = JSON.parse(readFileSync(join(root, 'src/data/events.json'), 'utf-8'))
const categories = JSON.parse(readFileSync(join(root, 'src/data/categories.json'), 'utf-8'))
const briefs = JSON.parse(readFileSync(join(root, 'src/data/briefs.json'), 'utf-8'))

const { routes } = buildRoutes({ events, categories, briefs })

// Runs after the prerender: routes it could not render ship as the SPA
// shell and must not be advertised to crawlers.
let failedRoutes = []
const failuresPath = join(root, 'dist/.prerender-failures.json')
if (existsSync(failuresPath)) {
  try {
    failedRoutes = JSON.parse(readFileSync(failuresPath, 'utf-8'))
  } catch (e) {
    failedRoutes = []
  }
  // Build-internal handoff from the prerender; everything in dist/ is
  // deployed, so remove it once consumed.
  try { unlinkSync(failuresPath) } catch (e) { /* leave it */ }
}
const failed = new Set(failedRoutes)

// No <lastmod>: there are no per-URL modification dates, and a uniform fake
// date would train crawlers to ignore the signal entirely. changefreq and
// priority come from the route defs so this file cannot drift from them.
const urls = routes.filter(r => !failed.has(r.path))

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(({ path, changefreq, priority }) => `  <url>
    <loc>${SITE_ORIGIN}${path}</loc>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`).join('\n')}
</urlset>
`

writeFileSync(join(root, 'dist/sitemap.xml'), xml)
console.log(`Sitemap generated with ${urls.length} URLs${failed.size ? ` (${failed.size} unrendered route(s) excluded)` : ''}`)
