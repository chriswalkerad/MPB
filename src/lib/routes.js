import { getCities } from './cities.js'

// The single source of truth for every prerenderable path. Both the
// prerender script and the sitemap generator consume this, so the static
// pages on disk and the sitemap can never disagree. events.json contains
// duplicate slugs, so event routes are deduped (first occurrence wins).
export function buildRoutes({ events, categories, briefs }) {
  const eventSlugs = new Set()
  events.forEach(e => {
    if (e.slug) eventSlugs.add(e.slug)
  })

  const routes = [
    '/',
    '/events',
    '/news',
    '/submit',
    '/events/archive',
    ...(briefs.length > 0 ? ['/brief'] : []),
    ...categories.map(c => `/events/category/${c.slug}`),
    ...getCities(events).map(c => `/events/city/${c.slug}`),
    ...[...new Set(briefs.map(b => b.slug).filter(Boolean))].map(s => `/brief/${s}`),
    ...[...eventSlugs].map(s => `/events/${s}`),
  ]

  return { routes: [...new Set(routes)], eventSlugs }
}
