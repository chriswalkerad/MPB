// City normalization shared by the app, the prerender script, and the
// sitemap generator. Event data spells cities inconsistently ("Denver" vs
// "Denver, CO", "Phoenix" vs "Phoenix, Arizona"), so everything keys off
// a normalized slug.

const US_STATES = new Set([
  'alabama', 'alaska', 'arizona', 'arkansas', 'california', 'colorado',
  'connecticut', 'delaware', 'florida', 'georgia', 'hawaii', 'idaho',
  'illinois', 'indiana', 'iowa', 'kansas', 'kentucky', 'louisiana', 'maine',
  'maryland', 'massachusetts', 'michigan', 'minnesota', 'mississippi',
  'missouri', 'montana', 'nebraska', 'nevada', 'new hampshire', 'new jersey',
  'new mexico', 'new york', 'north carolina', 'north dakota', 'ohio',
  'oklahoma', 'oregon', 'pennsylvania', 'rhode island', 'south carolina',
  'south dakota', 'tennessee', 'texas', 'utah', 'vermont', 'virginia',
  'washington', 'west virginia', 'wisconsin', 'wyoming',
  'district of columbia',
])

const DISPLAY_OVERRIDES = {
  washington: 'Washington, DC',
}

const EXCLUDED = new Set(['', 'online', 'virtual', 'tbd'])

// Strip a trailing US state — either a short code (", CA", ", DC") or a full
// name (", Arizona"). Country suffixes stay: "Delhi, India" is not "Delhi".
function stripStateSuffix(raw) {
  const m = raw.trim().match(/^(.*?),\s*([A-Za-z. ]+)$/)
  if (m) {
    const suffix = m[2].trim().toLowerCase().replace(/\./g, '')
    if (suffix.length <= 3 || US_STATES.has(suffix)) return m[1].trim()
  }
  return raw.trim()
}

function keyToSlug(key) {
  return key
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export function normalizeCityKey(raw) {
  if (!raw) return null
  const key = stripStateSuffix(raw).toLowerCase()
  return EXCLUDED.has(key) ? null : key
}

export function citySlug(raw) {
  const key = normalizeCityKey(raw)
  return key ? keyToSlug(key) : null
}

function displayName(key, sample) {
  if (DISPLAY_OVERRIDES[key]) return DISPLAY_OVERRIDES[key]
  // First spelling seen in the data, minus any state suffix
  return stripStateSuffix(sample)
}

// Cities with enough events (all-time) to deserve a landing page.
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
      slug: keyToSlug(c.key),
      name: displayName(c.key, c.sample),
    }))
}

export function eventsForCity(events, slug) {
  return events.filter(e => citySlug(e.city) === slug)
}
