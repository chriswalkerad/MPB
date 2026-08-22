// City normalization shared by the app, the prerender script, and the
// sitemap generator. Event data spells cities inconsistently ("Denver" vs
// "Denver, CO", "Washington" vs "Washington, DC"), so everything keys off
// a normalized slug.

const DISPLAY_OVERRIDES = {
  washington: 'Washington, DC',
  'new york': 'New York',
}

const EXCLUDED = new Set(['', 'online', 'virtual', 'tbd'])

export function normalizeCityKey(raw) {
  if (!raw) return null
  const key = raw
    .trim()
    .replace(/,\s*[A-Za-z.]{2,3}$/, '') // strip ", CA" / ", DC" style suffixes
    .toLowerCase()
  return EXCLUDED.has(key) ? null : key
}

export function citySlug(raw) {
  const key = normalizeCityKey(raw)
  return key ? key.replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') : null
}

function displayName(key, sample) {
  if (DISPLAY_OVERRIDES[key]) return DISPLAY_OVERRIDES[key]
  // Use the shortest spelling seen in the data (drops state suffixes)
  return sample.trim().replace(/,\s*[A-Za-z.]{2,3}$/, '')
}

// Cities with enough events to deserve a landing page.
export function getCities(events, minEvents = 8) {
  const byKey = new Map()
  events.forEach(e => {
    const key = normalizeCityKey(e.city)
    if (!key) return
    const entry = byKey.get(key) || { key, sample: e.city, count: 0 }
    entry.count++
    byKey.set(key, entry)
  })
  return [...byKey.values()]
    .filter(c => c.count >= minEvents)
    .sort((a, b) => b.count - a.count)
    .map(c => ({
      slug: c.key.replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
      name: displayName(c.key, c.sample),
    }))
}

export function eventsForCity(events, slug) {
  return events.filter(e => citySlug(e.city) === slug)
}
