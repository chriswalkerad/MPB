# SEO Prerendering Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make all pages indexable by search engines via build-time prerendering, per-page meta tags, dedicated event detail pages, auto-generated sitemap, and JSON-LD structured data.

**Architecture:** Stay on Vite + React. Add a Node.js prerender script that runs after `vite build`, launches Puppeteer, visits every route, and saves the rendered HTML. A separate build script generates the sitemap from events.json. Event cards use `<a href>` for crawlers but `onClick` + `preventDefault()` for the drawer UX.

**Tech Stack:** Vite, React, Puppeteer (prerendering), Node.js scripts (sitemap generation)

---

### Task 1: Create MetaTags Component

**Files:**
- Create: `src/components/MetaTags.jsx`

**Step 1: Create the MetaTags component**

This component updates `document.title` and meta tags in `<head>` on mount. During prerendering, these get baked into the static HTML.

```jsx
import { useEffect } from 'react'

const SITE_NAME = 'My Printer Broke'
const DEFAULT_DESCRIPTION = 'Discover cybersecurity conferences, meetups, and workshops near you. Find in-person and virtual cyber events across the US.'
const BASE_URL = 'https://myprinterbroke.com'

export default function MetaTags({ title, description, path, image, type = 'website', jsonLd }) {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} | Every Cyber Event Near You`
  const desc = description || DEFAULT_DESCRIPTION
  const url = `${BASE_URL}${path || ''}`
  const img = image || `${BASE_URL}/logo.png`

  useEffect(() => {
    document.title = fullTitle

    const setMeta = (attr, key, value) => {
      let el = document.querySelector(`meta[${attr}="${key}"]`)
      if (!el) {
        el = document.createElement('meta')
        el.setAttribute(attr, key)
        document.head.appendChild(el)
      }
      el.setAttribute('content', value)
    }

    setMeta('name', 'description', desc)
    setMeta('property', 'og:title', fullTitle)
    setMeta('property', 'og:description', desc)
    setMeta('property', 'og:url', url)
    setMeta('property', 'og:image', img)
    setMeta('property', 'og:type', type)
    setMeta('name', 'twitter:title', fullTitle)
    setMeta('name', 'twitter:description', desc)
    setMeta('name', 'twitter:image', img)

    // Set canonical link
    let canonical = document.querySelector('link[rel="canonical"]')
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.setAttribute('rel', 'canonical')
      document.head.appendChild(canonical)
    }
    canonical.setAttribute('href', url)

    // JSON-LD structured data
    let scriptEl = document.querySelector('script[data-meta-jsonld]')
    if (jsonLd) {
      if (!scriptEl) {
        scriptEl = document.createElement('script')
        scriptEl.setAttribute('type', 'application/ld+json')
        scriptEl.setAttribute('data-meta-jsonld', 'true')
        document.head.appendChild(scriptEl)
      }
      scriptEl.textContent = JSON.stringify(jsonLd)
    } else if (scriptEl) {
      scriptEl.remove()
    }

    return () => {
      if (scriptEl && scriptEl.parentNode) scriptEl.remove()
    }
  }, [fullTitle, desc, url, img, type, jsonLd])

  return null
}
```

**Step 2: Commit**

```bash
git add src/components/MetaTags.jsx
git commit -m "feat: add MetaTags component for per-page SEO"
```

---

### Task 2: Create Event Detail Page

**Files:**
- Create: `src/pages/EventDetail.jsx`
- Modify: `src/App.jsx` (add route)

**Step 1: Create the EventDetail page**

Full-page event detail that reuses the drawer's visual structure but as a standalone page. Includes MetaTags and JSON-LD.

```jsx
import { useParams, Link } from 'react-router-dom'
import Layout from '../components/Layout'
import MetaTags from '../components/MetaTags'
import GenerativePattern from '../components/GenerativePattern'
import events from '../data/events.json'

const TYPE_COLORS = {
  conference: '#ff6b35',
  meetup: '#00d4aa',
  chapter: '#a78bfa',
  workshop: '#facc15',
  webinar: '#38bdf8',
  ctf: '#f472b6',
}

function formatFullDate(dateStr) {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  })
}

function formatTimeRange(startStr, endStr) {
  const start = new Date(startStr)
  const formatTime = (d) => {
    let hours = d.getHours()
    const minutes = d.getMinutes()
    const ampm = hours >= 12 ? 'PM' : 'AM'
    hours = hours % 12 || 12
    const minStr = minutes < 10 ? `0${minutes}` : minutes
    return `${hours}:${minStr} ${ampm}`
  }
  const tz = start.toLocaleTimeString('en-US', { timeZoneName: 'short' }).split(' ').pop()
  if (!endStr) return `${formatTime(start)} ${tz}`
  const end = new Date(endStr)
  return `${formatTime(start)} - ${formatTime(end)} ${tz}`
}

function buildJsonLd(event) {
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: event.name,
    startDate: event.date,
    description: event.description || '',
    eventAttendanceMode: event.format === 'virtual'
      ? 'https://schema.org/OnlineEventAttendanceMode'
      : event.format === 'hybrid'
        ? 'https://schema.org/MixedEventAttendanceMode'
        : 'https://schema.org/OfflineEventAttendanceMode',
  }
  if (event.endDate) ld.endDate = event.endDate
  if (event.city) {
    ld.location = event.format === 'virtual'
      ? { '@type': 'VirtualLocation', url: event.url }
      : { '@type': 'Place', name: event.city }
  }
  if (event.cost) {
    ld.offers = {
      '@type': 'Offer',
      price: event.cost === 'Free' ? '0' : event.cost.replace(/[^0-9.]/g, ''),
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
      url: event.url
    }
  }
  if (event.organizer) {
    ld.organizer = { '@type': 'Organization', name: event.organizer }
  }
  if (event.image) ld.image = event.image
  return ld
}

export default function EventDetail() {
  const { slug } = useParams()
  const event = events.find(e => e.slug === slug)

  if (!event) {
    return (
      <Layout>
        <MetaTags title="Event Not Found" path={`/events/${slug}`} />
        <div style={{ maxWidth: '600px', margin: '0 auto', padding: '80px 20px', textAlign: 'center' }}>
          <h1 style={{ color: 'white', fontSize: '24px', fontFamily: "'Outfit', sans-serif", marginBottom: '16px' }}>
            Event not found
          </h1>
          <Link to="/events" style={{ color: 'rgba(255,255,255,0.6)', fontFamily: "'Outfit', sans-serif" }}>
            Browse all events
          </Link>
        </div>
      </Layout>
    )
  }

  const typeColor = TYPE_COLORS[event.type] || '#888'
  const descSnippet = event.description ? event.description.slice(0, 155).trim() + (event.description.length > 155 ? '...' : '') : ''

  return (
    <Layout>
      <MetaTags
        title={`${event.name} - ${event.city}`}
        description={descSnippet}
        path={`/events/${event.slug}`}
        image={event.image}
        type="website"
        jsonLd={buildJsonLd(event)}
      />
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '40px 20px 80px' }}>
        {/* Breadcrumb */}
        <Link
          to="/events"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            color: 'rgba(255,255,255,0.5)',
            textDecoration: 'none',
            fontSize: '14px',
            fontFamily: "'Outfit', sans-serif",
            marginBottom: '24px'
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          All Events
        </Link>

        {/* Cover Image */}
        <div style={{ aspectRatio: '16 / 9', borderRadius: '12px', overflow: 'hidden', marginBottom: '24px', background: 'rgba(255,255,255,0.05)' }}>
          {event.image ? (
            <img src={event.image} alt={event.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <div style={{ width: '100%', height: '100%' }}>
              <GenerativePattern seed={event.slug} size={600} />
            </div>
          )}
        </div>

        {/* Title */}
        <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'white', margin: '0 0 16px', fontFamily: "'Outfit', sans-serif", lineHeight: 1.3 }}>
          {event.name}
        </h1>

        {/* Badges */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '24px' }}>
          <span style={{ padding: '4px 10px', borderRadius: '4px', fontSize: '12px', fontFamily: '"JetBrains Mono", monospace', fontWeight: 500, textTransform: 'uppercase', background: `${typeColor}20`, color: typeColor }}>
            {event.type}
          </span>
          {event.format && (
            <span style={{ padding: '4px 10px', borderRadius: '4px', fontSize: '12px', fontFamily: '"JetBrains Mono", monospace', fontWeight: 500, textTransform: 'uppercase', background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)' }}>
              {event.format}
            </span>
          )}
          {event.cost && (
            <span style={{ padding: '4px 10px', borderRadius: '4px', fontSize: '12px', fontFamily: '"JetBrains Mono", monospace', fontWeight: 500, textTransform: 'uppercase', background: event.cost === 'Free' ? 'rgba(0,212,170,0.2)' : 'rgba(255,255,255,0.1)', color: event.cost === 'Free' ? '#00d4aa' : 'rgba(255,255,255,0.7)' }}>
              {event.cost}
            </span>
          )}
        </div>

        {/* Date */}
        <div style={{ display: 'flex', gap: '12px', padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', marginBottom: '12px' }}>
          <div style={{ width: '40px', height: '40px', background: 'rgba(255,255,255,0.1)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
            </svg>
          </div>
          <div>
            <div style={{ fontSize: '15px', fontWeight: 600, color: 'white', fontFamily: "'Outfit', sans-serif" }}>
              {formatFullDate(event.date)}
            </div>
            <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', fontFamily: "'Outfit', sans-serif", marginTop: '2px' }}>
              {formatTimeRange(event.date, event.endDate)}
            </div>
          </div>
        </div>

        {/* Location */}
        {event.city && (
          <div style={{ display: 'flex', gap: '12px', padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', marginBottom: '24px' }}>
            <div style={{ width: '40px', height: '40px', background: 'rgba(255,255,255,0.1)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
              </svg>
            </div>
            <div>
              <div style={{ fontSize: '15px', fontWeight: 600, color: 'white', fontFamily: "'Outfit', sans-serif" }}>{event.city}</div>
              {event.format === 'virtual' && (
                <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', fontFamily: "'Outfit', sans-serif", marginTop: '2px' }}>Virtual Event</div>
              )}
            </div>
          </div>
        )}

        {/* Description */}
        {event.description && (
          <div style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px', fontFamily: "'Outfit', sans-serif" }}>
              About Event
            </h2>
            <p style={{ fontSize: '15px', lineHeight: 1.7, color: 'rgba(255,255,255,0.8)', fontFamily: "'Outfit', sans-serif", margin: 0, whiteSpace: 'pre-wrap' }}>
              {event.description}
            </p>
          </div>
        )}

        {/* Categories */}
        {event.tags && event.tags.length > 0 && (
          <div style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px', fontFamily: "'Outfit', sans-serif" }}>
              Categories
            </h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {event.tags.map(tag => (
                <span key={tag} style={{ padding: '6px 12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '100px', fontSize: '13px', color: 'rgba(255,255,255,0.6)', fontFamily: "'Outfit', sans-serif" }}>
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* RSVP Button */}
        {event.url && (
          <a
            href={event.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              width: '100%', padding: '14px', background: 'white', color: '#09090b',
              border: 'none', borderRadius: '100px', fontSize: '15px', fontWeight: 600,
              fontFamily: "'Outfit', sans-serif", textDecoration: 'none', transition: 'all 0.2s ease'
            }}
          >
            RSVP
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M7 17L17 7M7 7h10v10" />
            </svg>
          </a>
        )}
      </div>
    </Layout>
  )
}
```

**Step 2: Add route to App.jsx**

Add `import EventDetail from './pages/EventDetail'` to the imports (line 8 area), then add the route before the catch-all:

```jsx
<Route path="/events/:slug" element={<EventDetail />} />
```

Place it AFTER `/events/category/:slug` and BEFORE `/events/archive` to avoid route conflicts. The final routes order:

```jsx
<Route path="/" element={<Homepage />} />
<Route path="/bunker" element={<Bunker />} />
<Route path="/events" element={<ExploreEvents />} />
<Route path="/events/category/:slug" element={<CategoryPage />} />
<Route path="/events/archive" element={<PastEvents />} />
<Route path="/events/:slug" element={<EventDetail />} />
<Route path="/submit" element={<SubmitEvent />} />
```

**Step 3: Commit**

```bash
git add src/pages/EventDetail.jsx src/App.jsx
git commit -m "feat: add dedicated event detail page with SEO meta tags and JSON-LD"
```

---

### Task 3: Add MetaTags to Existing Pages

**Files:**
- Modify: `src/pages/Homepage.jsx`
- Modify: `src/pages/ExploreEvents.jsx`
- Modify: `src/pages/CategoryPage.jsx`
- Modify: `src/pages/SubmitEvent.jsx`
- Modify: `src/pages/PastEvents.jsx`

**Step 1: Add MetaTags to each page**

Import `MetaTags` at the top of each file:
```jsx
import MetaTags from '../components/MetaTags'
```

Then add the `<MetaTags>` component as the first child inside each page's return:

**Homepage.jsx** — inside the top-level fragment/div:
```jsx
<MetaTags path="/" />
```
(Uses defaults — the default title and description are the homepage values.)

**ExploreEvents.jsx** — inside `<Layout>`:
```jsx
<MetaTags
  title="Explore Cybersecurity Events"
  description="Browse cybersecurity conferences, meetups, workshops, and webinars. Filter by category, format, and location."
  path="/events"
/>
```

**CategoryPage.jsx** — inside `<Layout>`, using the category data:
```jsx
<MetaTags
  title={`${category.name} Events`}
  description={`Browse ${filteredEvents.length} cybersecurity ${category.name.toLowerCase()} events — ${category.description}`}
  path={`/events/category/${category.slug}`}
/>
```

**SubmitEvent.jsx** — inside `<Layout>`:
```jsx
<MetaTags
  title="Submit an Event"
  description="Submit your cybersecurity conference, meetup, or workshop to be featured on My Printer Broke."
  path="/submit"
/>
```

**PastEvents.jsx** — inside `<Layout>`:
```jsx
<MetaTags
  title="Past Events"
  description="Archive of past cybersecurity events from conferences, meetups, and workshops across the US."
  path="/events/archive"
/>
```

**Step 2: Commit**

```bash
git add src/pages/Homepage.jsx src/pages/ExploreEvents.jsx src/pages/CategoryPage.jsx src/pages/SubmitEvent.jsx src/pages/PastEvents.jsx
git commit -m "feat: add per-page meta tags to all existing pages"
```

---

### Task 4: Make Event Cards SEO-Friendly Links

**Files:**
- Modify: `src/components/EventCard.jsx`

**Step 1: Wrap EventCard in an `<a>` tag**

Change the outer `<div>` (line 197-209) to an `<a>` element that links to `/events/{slug}` but prevents default navigation and opens the drawer via `onClick`:

Replace the current outer element:
```jsx
<a
  href={`/events/${event.slug}`}
  className="event-card"
  style={{ ...cardStyle, textDecoration: 'none', color: 'inherit' }}
  onClick={(e) => {
    e.preventDefault()
    if (onClick) onClick(event)
  }}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      if (onClick) onClick(event)
    }
  }}
>
```

And change the closing `</div>` to `</a>`.

Remove the `role="button"` and `tabIndex={0}` attributes (the `<a>` tag handles these natively).

**Step 2: Commit**

```bash
git add src/components/EventCard.jsx
git commit -m "feat: make event cards crawlable <a> links for SEO"
```

---

### Task 5: Create Sitemap Generator

**Files:**
- Create: `scripts/generate-sitemap.js`
- Modify: `package.json` (update build script)

**Step 1: Create the sitemap generator**

```js
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
```

**Step 2: Update package.json build script**

Change the build script from:
```json
"build": "vite build"
```
To:
```json
"build": "vite build && node scripts/generate-sitemap.js"
```

**Step 3: Commit**

```bash
git add scripts/generate-sitemap.js package.json
git commit -m "feat: auto-generate sitemap with all event and category URLs"
```

---

### Task 6: Add Prerender Script

**Files:**
- Create: `scripts/prerender.js`
- Modify: `package.json` (update build script, add puppeteer dep)

**Step 1: Install puppeteer**

```bash
cd /Users/kwis/MPB && npm install --save-dev puppeteer
```

**Step 2: Create the prerender script**

```js
import puppeteer from 'puppeteer'
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import { createServer } from 'vite'

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

  // Start a preview server to serve the built files
  const server = await createServer({
    root,
    server: { port: 4173 },
    preview: { port: 4173 },
  })
  const preview = await server.preview()

  const browser = await puppeteer.launch({ headless: true })
  const page = await browser.newPage()

  // Process in batches to avoid overwhelming the browser
  const BATCH_SIZE = 20
  let completed = 0

  for (let i = 0; i < routes.length; i += BATCH_SIZE) {
    const batch = routes.slice(i, i + BATCH_SIZE)
    await Promise.all(batch.map(async (route) => {
      const p = await browser.newPage()
      try {
        await p.goto(`http://localhost:4173${route}`, { waitUntil: 'networkidle0', timeout: 15000 })
        // Wait a bit for React to render and MetaTags to update
        await p.waitForFunction(() => document.title !== '', { timeout: 5000 }).catch(() => {})

        const html = await p.content()

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
        await p.close()
      }
    }))
  }

  await browser.close()
  preview.close()
  console.log('Prerendering complete!')
}

prerender().catch(console.error)
```

**Step 3: Update package.json build script**

Change from:
```json
"build": "vite build && node scripts/generate-sitemap.js"
```
To:
```json
"build": "vite build && node scripts/generate-sitemap.js && node scripts/prerender.js"
```

**Step 4: Commit**

```bash
git add scripts/prerender.js package.json
git commit -m "feat: add build-time prerendering with Puppeteer"
```

---

### Task 7: Update Vercel Config

**Files:**
- Modify: `vercel.json`

**Step 1: Update vercel.json**

The current config rewrites everything to `/`. We need Vercel to serve the prerendered HTML files for each route, and only fall back to `/index.html` for routes that aren't prerendered (client-side navigation).

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/" }
  ],
  "headers": [
    {
      "source": "/sitemap.xml",
      "headers": [
        { "key": "Content-Type", "value": "application/xml" }
      ]
    }
  ]
}
```

NOTE: Vercel automatically serves static files from the build output first before applying rewrites. Since prerendered HTML files exist at paths like `/events/bsides-sf-2026/index.html`, Vercel will serve those directly. The rewrite only kicks in for non-prerendered routes (client-side navigation). The existing rewrite config actually works as-is. We just add the sitemap header.

**Step 2: Remove the old static sitemap**

Delete `public/sitemap.xml` since the sitemap is now auto-generated into `dist/` during build.

```bash
rm public/sitemap.xml
```

**Step 3: Commit**

```bash
git add vercel.json && git rm public/sitemap.xml
git commit -m "feat: update Vercel config for prerendered pages and auto-generated sitemap"
```

---

### Task 8: Test Build Locally

**Step 1: Run the full build**

```bash
cd /Users/kwis/MPB && npm run build
```

**Step 2: Verify prerendered output**

Check that the key files exist and contain real content:

```bash
# Check homepage has content
head -30 dist/index.html

# Check an event page exists and has unique meta tags
head -20 dist/events/iafci-2026-cyber-fraud-summit/index.html

# Check a category page exists
head -20 dist/events/category/cloud-security/index.html

# Check sitemap has all URLs
wc -l dist/sitemap.xml
grep -c '<url>' dist/sitemap.xml
```

**Step 3: Preview locally**

```bash
npm run preview
```

Visit `http://localhost:4173/events/iafci-2026-cyber-fraud-summit` — should show the full event page. View source should show real HTML with the event title in `<title>` and JSON-LD in `<script type="application/ld+json">`.

**Step 4: Commit any fixes**

```bash
git add -A
git commit -m "fix: address issues found during build testing"
```

---

### Task 9: Final Cleanup and Verification

**Step 1: Remove old meta tags from index.html**

The `<title>` and `<meta>` tags in `index.html` should stay as fallback defaults. No changes needed — the MetaTags component overrides them at runtime, and prerendering bakes in the correct values.

**Step 2: Verify `robots.txt` still references sitemap**

```
Sitemap: https://myprinterbroke.com/sitemap.xml
```

This is already correct in `public/robots.txt`. No change needed.

**Step 3: Final commit**

```bash
git add -A
git commit -m "chore: SEO prerendering implementation complete"
```
