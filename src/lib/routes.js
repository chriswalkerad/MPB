import { getCities } from './cities.js'

// The single source of truth for every prerenderable path AND its taxonomy:
// whether a failed render must fail the build (critical), and its sitemap
// changefreq/priority. The prerender script and the sitemap generator both
// consume this, so the static pages on disk, the failure policy, and the
// sitemap can never disagree. events.json contains duplicate slugs, so event
// routes are deduped (first occurrence wins).
export function buildRoutes({ events, categories, briefs }) {
  const eventSlugs = new Set()
  events.forEach(e => {
    if (e.slug) eventSlugs.add(e.slug)
  })

  const defs = [
    { path: '/', critical: true, changefreq: 'daily', priority: '1.0' },
    { path: '/events', critical: true, changefreq: 'daily', priority: '0.9' },
    { path: '/news', critical: true, changefreq: 'hourly', priority: '0.8' },
    { path: '/submit', critical: false, changefreq: 'monthly', priority: '0.5' },
    { path: '/events/archive', critical: false, changefreq: 'weekly', priority: '0.4' },
    ...(briefs.length > 0
      ? [{ path: '/brief', critical: true, changefreq: 'daily', priority: '0.8' }]
      : []),
    ...categories.map(c => (
      { path: `/events/category/${c.slug}`, critical: true, changefreq: 'daily', priority: '0.7' }
    )),
    ...getCities(events).map(c => (
      { path: `/events/city/${c.slug}`, critical: true, changefreq: 'daily', priority: '0.8' }
    )),
    ...[...new Set(briefs.map(b => b.slug).filter(Boolean))].map(s => (
      { path: `/brief/${s}`, critical: false, changefreq: 'monthly', priority: '0.6' }
    )),
    ...[...eventSlugs].map(s => (
      { path: `/events/${s}`, critical: false, changefreq: 'weekly', priority: '0.6' }
    )),
  ]

  const seen = new Set()
  const routes = defs.filter(d => !seen.has(d.path) && seen.add(d.path))

  return { routes, eventSlugs }
}
