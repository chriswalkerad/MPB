import { readFileSync, writeFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')

const events = JSON.parse(readFileSync(join(root, 'src/data/events.json'), 'utf-8'))
const categories = JSON.parse(readFileSync(join(root, 'src/data/categories.json'), 'utf-8'))

const BASE_URL = 'https://myprinterbroke.com'
const today = new Date().toISOString().split('T')[0]

const urls = [
  { loc: '/', changefreq: 'daily', priority: '1.0' },
  { loc: '/events', changefreq: 'daily', priority: '0.9' },
  { loc: '/submit', changefreq: 'monthly', priority: '0.5' },
  { loc: '/events/archive', changefreq: 'weekly', priority: '0.4' },
]

// Category pages
categories.forEach(cat => {
  urls.push({ loc: `/events/category/${cat.slug}`, changefreq: 'daily', priority: '0.7' })
})

// Event pages
events.forEach(event => {
  urls.push({ loc: `/events/${event.slug}`, changefreq: 'weekly', priority: '0.6' })
})

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url>
    <loc>${BASE_URL}${u.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>
`

writeFileSync(join(root, 'dist/sitemap.xml'), xml)
console.log(`Sitemap generated with ${urls.length} URLs`)
