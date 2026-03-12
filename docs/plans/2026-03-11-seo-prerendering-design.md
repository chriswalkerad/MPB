# SEO Prerendering Design

**Date:** 2026-03-11
**Status:** Approved

## Problem

The site is a Vite + React SPA. All routes serve the same `index.html` with identical meta tags and an empty `<div id="root"></div>`. Search engines that don't execute JavaScript see no content. Even Google (which does render JS) sees duplicate metadata across all pages. Individual events have no dedicated URLs — they live in a drawer at `/events?event=slug`, which Google treats as a parameter on `/events`, not a distinct page.

## Solution: Build-Time Prerendering

Generate static HTML for all routes during `npm run build`. No framework migration. The existing React SPA hydrates on top of the static HTML at runtime.

### What Gets Prerendered (~753 pages)

| Route | Count | Example |
|-------|-------|---------|
| `/` | 1 | Homepage |
| `/events` | 1 | Explore events |
| `/events/[slug]` | ~734 | `/events/bsides-sf-2026` |
| `/events/category/[slug]` | 14 | `/events/category/cloud-security` |
| `/submit` | 1 | Submit form |
| `/events/archive` | 1 | Past events |
| `/bunker` | 1 | 3D scene (low priority) |

### New Event Detail Page (`/events/[slug]`)

- Dedicated route with full event info (reuses EventDetailDrawer content/styling)
- Unique `<title>`: "{Event Name} - {City} | My Printer Broke"
- Unique `<meta description>`: First 155 chars of event description
- Unique OG/Twitter meta tags with event image
- JSON-LD `Event` structured data (name, startDate, location, offers)
- Links back to `/events` and related events in same category

### Drawer Coexistence

The drawer on `/events` stays. Event cards render as `<a href="/events/[slug]">` with `onClick` + `preventDefault()` to open the drawer. Crawlers follow the `<a href>` and discover dedicated pages. Users see the drawer as usual.

### Per-Page Meta Tags

A `<MetaTags>` component updates `document.title` and meta tags at render time. During prerendering, these get baked into static HTML.

| Page | Title |
|------|-------|
| `/` | My Printer Broke \| Every Cyber Event Near You |
| `/events` | Explore Cybersecurity Events \| My Printer Broke |
| `/events/[slug]` | {Event Name} - {City} \| My Printer Broke |
| `/events/category/[slug]` | {Category Name} Events \| My Printer Broke |
| `/submit` | Submit an Event \| My Printer Broke |
| `/events/archive` | Past Events \| My Printer Broke |

### Auto-Generated Sitemap

Build script reads `events.json` + `categories.json` to generate `sitemap.xml` with all ~753 URLs, `<lastmod>` dates, and priority values. Replaces the current 3-URL static sitemap.

### JSON-LD Structured Data (Event Pages)

```json
{
  "@context": "https://schema.org",
  "@type": "Event",
  "name": "BSides SF 2026",
  "startDate": "2026-06-15",
  "endDate": "2026-06-16",
  "location": {
    "@type": "Place",
    "name": "San Francisco, CA"
  },
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  },
  "description": "...",
  "organizer": "..."
}
```

### Build Pipeline Changes

1. Vite builds the bundle as usual
2. Prerender script launches headless browser, visits each route, saves rendered HTML
3. Sitemap generator outputs `sitemap.xml`
4. Vercel config updated to serve prerendered files directly

### Build Output

```
dist/
├── index.html
├── events/
│   ├── index.html
│   ├── archive/index.html
│   ├── [slug]/index.html (x734)
│   └── category/[slug]/index.html (x14)
├── submit/index.html
├── sitemap.xml
└── assets/
```

### What Doesn't Change

- `npm run dev` works exactly as before
- All existing components, styling, and 3D effects untouched
- Drawer behavior on `/events` unchanged
- Vercel hosting (just config update)
