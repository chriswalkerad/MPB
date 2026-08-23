// discovers upcoming events: ICS + RSS + schedule pages -> AI curation -> src/data/events.json
// usage: node scripts/fetch-events.js [--dry-run]
// requires AZURE_AI_API_KEY; model runs on Microsoft Foundry
import { readFileSync, writeFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import Parser from 'rss-parser'
import OpenAI from 'openai'

const AZURE_AI_ENDPOINT = process.env.AZURE_AI_ENDPOINT || 'https://kindsai-prod.services.ai.azure.com/openai/v1/'
const AZURE_AI_DEPLOYMENT = process.env.AZURE_AI_DEPLOYMENT || 'gpt-5'

const __dirname = dirname(fileURLToPath(import.meta.url))
const EVENTS_PATH = join(__dirname, '../src/data/events.json')
const CATEGORIES_PATH = join(__dirname, '../src/data/categories.json')
const SEEN_PATH = join(__dirname, 'events-seen.json')

const DRY_RUN = process.argv.includes('--dry-run')
const USER_AGENT = 'Mozilla/5.0 (compatible; MPBEventsBot/1.0; +https://myprinterbroke.com)'
const PAGE_TEXT_CAP = 12000
const MAX_HORIZON_MS = 548 * 24 * 60 * 60 * 1000
const SEEN_RETENTION_MS = 120 * 24 * 60 * 60 * 1000

const REGIONS = ['west-coast', 'southwest', 'midwest', 'southeast', 'northeast', 'virtual']
const TYPES = ['conference', 'meetup', 'workshop', 'webinar', 'chapter', 'ctf']
const FORMATS = ['in-person', 'virtual', 'hybrid']

// type: 'ics' (calendar feed), 'rss' (directory feed), 'page' (schedule page, AI extracts from text)
const SOURCES = [
  { type: 'rss', name: 'infosec-conferences.com', url: 'https://infosec-conferences.com/feed/' },
  { type: 'page', name: 'SecureWorld', url: 'https://www.secureworld.io/events' },
  { type: 'page', name: 'FutureCon', url: 'https://futureconevents.com/events/' },
  { type: 'page', name: 'Cybersecurity Summit', url: 'https://cybersecuritysummit.com/summits/' },
  { type: 'ics', name: 'Dallas Hackers Association (Meetup)', url: 'https://www.meetup.com/dallas-hackers-association/events/ical/' },
  { type: 'ics', name: 'OWASP NYC (Meetup)', url: 'https://www.meetup.com/owasp-new-york-city-chapter/events/ical/' },
  { type: 'ics', name: 'OWASP Atlanta (Meetup)', url: 'https://www.meetup.com/owasp-atlanta/events/ical/' },
  { type: 'ics', name: 'OWASP Los Angeles (Meetup)', url: 'https://www.meetup.com/owasp-los-angeles/events/ical/' },
  { type: 'ics', name: 'ISSA LA (Meetup)', url: 'https://www.meetup.com/issa-la/events/ical/' },
]

function buildSystemPrompt(categoryNames, existingEvents) {
  return `You are the events curator for My Printer Broke (myprinterbroke.com), a cybersecurity news + events site for MSP owners, IT admins, and security practitioners in the US.

Today's date is ${new Date().toISOString().slice(0, 10)}.

You receive candidate material from several sources: structured feed items (name, url, hints) and raw text extracted from conference schedule pages. Extract and curate upcoming events.

INCLUDE only events that are: cybersecurity-focused (or AI-security), located in the US or fully virtual, and dated in the future. Conferences, meetups, workshops, webinars, chapter meetings, CTFs.
EXCLUDE: non-US in-person events, past events, vendor sales webinars with no educational value, events with no discoverable date, and anything already in the EXISTING EVENTS list below (same event, same edition; a 2027 edition of a 2026 event is new).

For each event output:
- name: official event name (include year if the source shows it)
- url: the event's page (from the source material; never invent urls)
- date: start date-time, ISO 8601. If only a date is known, use T09:00:00 local-ish; do not invent precise times otherwise.
- endDate: ISO end date for multi-day events, else null
- type: one of ${TYPES.join(' | ')}
- format: one of ${FORMATS.join(' | ')}
- city: city name, or "Virtual" for virtual events
- state: two-letter state code, or null for virtual
- region: one of ${REGIONS.join(' | ')} (virtual events use "virtual")
- cost: "Free", a price like "$395", or "" if unknown
- description: 1-2 sentences in MPB voice: useful, direct, occasionally funny, never salesy. Your own words. No em dashes (use commas or colons), no emoji.
- tags: 1-3 from exactly this list: ${categoryNames.join(' | ')}
- sourceName: the source the event came from (as given in the input)

Only state facts present in the source material. If a date or city is not determinable, skip the event rather than guessing.

EXISTING EVENTS (do not re-add these):
${existingEvents}`
}

const OUTPUT_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['events'],
  properties: {
    events: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['name', 'url', 'date', 'endDate', 'type', 'format', 'city', 'state', 'region', 'cost', 'description', 'tags', 'sourceName'],
        properties: {
          name: { type: 'string' },
          url: { type: 'string' },
          date: { type: 'string' },
          endDate: { type: ['string', 'null'] },
          type: { type: 'string', enum: TYPES },
          format: { type: 'string', enum: FORMATS },
          city: { type: 'string' },
          state: { type: ['string', 'null'] },
          region: { type: 'string', enum: REGIONS },
          cost: { type: 'string' },
          description: { type: 'string' },
          tags: { type: 'array', items: { type: 'string' } },
          sourceName: { type: 'string' },
        },
      },
    },
  },
}

function normalizeUrl(raw) {
  try {
    const u = new URL(raw)
    u.hash = ''
    u.hostname = u.hostname.toLowerCase()
    for (const key of [...u.searchParams.keys()]) {
      if (key.toLowerCase().startsWith('utm_')) u.searchParams.delete(key)
    }
    return u.toString()
  } catch {
    return raw
  }
}

// fuzzy identity for an event: normalized name + start day
function eventKey(name, date) {
  const n = name.toLowerCase().replace(/[^a-z0-9]+/g, '')
  return `${n}|${String(date).slice(0, 10)}`
}

function slugify(name, dateIso, existingSlugs) {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
    .replace(/-+$/, '')
  const year = String(dateIso).slice(0, 4)
  let slug = base.includes(year) ? base : `${base}-${year}`
  let n = 2
  const root = slug
  while (existingSlugs.has(slug)) slug = `${root}-${n++}`
  existingSlugs.add(slug)
  return slug
}

async function fetchText(url) {
  const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT }, signal: AbortSignal.timeout(20000) })
  if (!res.ok) throw new Error(`http ${res.status}`)
  return res.text()
}

// minimal VEVENT parser: unfold wrapped lines, pull the fields we need
function parseIcs(text, sourceName) {
  const unfolded = text.replace(/\r?\n[ \t]/g, '')
  const events = []
  for (const block of unfolded.split('BEGIN:VEVENT').slice(1)) {
    const body = block.split('END:VEVENT')[0]
    const field = (key) => {
      const m = body.match(new RegExp(`^${key}[^:]*:(.+)$`, 'm'))
      return m ? m[1].trim().replace(/\\,/g, ',').replace(/\\n/g, ' ') : ''
    }
    const dtstart = field('DTSTART')
    const iso = dtstart.length >= 8
      ? `${dtstart.slice(0, 4)}-${dtstart.slice(4, 6)}-${dtstart.slice(6, 8)}${dtstart.length > 8 ? `T${dtstart.slice(9, 11)}:${dtstart.slice(11, 13)}:00` : 'T09:00:00'}`
      : ''
    events.push({
      sourceType: 'ics',
      source: sourceName,
      name: field('SUMMARY'),
      url: normalizeUrl(field('URL') || ''),
      dateHint: iso,
      locationHint: field('LOCATION'),
      snippet: field('DESCRIPTION').slice(0, 300),
    })
  }
  return events.filter((e) => e.name && e.dateHint)
}

function htmlToText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ').replace(/&#\d+;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, PAGE_TEXT_CAP)
}

async function ingest() {
  const rssParser = new Parser({ timeout: 15000, headers: { 'User-Agent': USER_AGENT } })
  const feedItems = []
  const pageTexts = []
  const results = await Promise.allSettled(
    SOURCES.map(async (source) => {
      if (source.type === 'rss') {
        const feed = await rssParser.parseURL(source.url)
        return (feed.items || []).slice(0, 60).map((item) => ({
          sourceType: 'rss',
          source: source.name,
          name: (item.title || '').trim(),
          url: normalizeUrl(item.link || ''),
          dateHint: '',
          locationHint: '',
          snippet: (item.contentSnippet || '').replace(/\s+/g, ' ').slice(0, 300),
        }))
      }
      if (source.type === 'ics') {
        return parseIcs(await fetchText(source.url), source.name)
      }
      return { sourceType: 'page', source: source.name, url: source.url, text: htmlToText(await fetchText(source.url)) }
    }),
  )
  results.forEach((result, i) => {
    if (result.status === 'rejected') {
      console.warn(`source failed: ${SOURCES[i].name}: ${result.reason?.message || result.reason}`)
      return
    }
    if (Array.isArray(result.value)) {
      console.log(`source ok: ${SOURCES[i].name} (${result.value.length} items)`)
      feedItems.push(...result.value)
    } else {
      console.log(`source ok: ${SOURCES[i].name} (page, ${result.value.text.length} chars)`)
      pageTexts.push(result.value)
    }
  })
  return { feedItems, pageTexts }
}

async function curate(feedItems, pageTexts, categoryNames, existingSummary) {
  const client = new OpenAI({ baseURL: AZURE_AI_ENDPOINT, apiKey: process.env.AZURE_AI_API_KEY })
  const userContent = JSON.stringify({
    feed_candidates: feedItems.map(({ source, name, url, dateHint, locationHint, snippet }) => ({ source, name, url, dateHint, locationHint, snippet })),
    schedule_pages: pageTexts.map(({ source, url, text }) => ({ source, url, text })),
  })
  const response = await client.chat.completions.create({
    model: AZURE_AI_DEPLOYMENT,
    max_completion_tokens: 16000,
    messages: [
      { role: 'system', content: buildSystemPrompt(categoryNames, existingSummary) },
      { role: 'user', content: userContent },
    ],
    response_format: {
      type: 'json_schema',
      json_schema: { name: 'events_curation', strict: true, schema: OUTPUT_SCHEMA },
    },
  })
  const message = response.choices?.[0]?.message
  if (message?.refusal) {
    console.warn('curation request refused, skipping run', message.refusal)
    process.exit(0)
  }
  if (!message?.content) throw new Error('no content in curation response')
  return JSON.parse(message.content).events
}

function validate(candidate, now, existingKeys, categoryNames) {
  const date = new Date(candidate.date)
  if (Number.isNaN(date.getTime())) return 'bad date'
  if (date.getTime() <= now) return 'not in future'
  if (date.getTime() > now + MAX_HORIZON_MS) return 'too far out'
  if (!/^https?:\/\//.test(candidate.url)) return 'bad url'
  if (!candidate.name || candidate.name.length < 4) return 'bad name'
  if (!REGIONS.includes(candidate.region)) return 'bad region'
  if (existingKeys.has(eventKey(candidate.name, candidate.date))) return 'duplicate'
  if (candidate.endDate && Number.isNaN(new Date(candidate.endDate).getTime())) return 'bad endDate'
  const tags = candidate.tags.filter((t) => categoryNames.includes(t))
  if (tags.length === 0) return 'no valid tags'
  return null
}

async function main() {
  const events = JSON.parse(readFileSync(EVENTS_PATH, 'utf8'))
  const categories = JSON.parse(readFileSync(CATEGORIES_PATH, 'utf8'))
  const seen = JSON.parse(readFileSync(SEEN_PATH, 'utf8'))
  const categoryNames = categories.map((c) => c.name)
  const now = Date.now()

  const existingKeys = new Set(events.map((e) => eventKey(e.name, e.date)))
  const seenUrls = new Set([...Object.keys(seen), ...events.map((e) => normalizeUrl(e.url || '')).filter(Boolean)])

  const { feedItems, pageTexts } = await ingest()
  const freshFeedItems = feedItems.filter((item) => !item.url || !seenUrls.has(item.url))
  console.log(`${freshFeedItems.length} fresh feed candidates, ${pageTexts.length} schedule pages`)
  if (freshFeedItems.length === 0 && pageTexts.length === 0) {
    console.log('nothing to curate, exiting')
    process.exit(0)
  }

  const upcomingSummary = events
    .filter((e) => new Date(e.date).getTime() > now)
    .map((e) => `${e.name} | ${String(e.date).slice(0, 10)} | ${e.city}`)
    .join('\n')

  const curated = await curate(freshFeedItems, pageTexts, categoryNames, upcomingSummary)
  console.log(`curator returned ${curated.length} events`)

  const existingSlugs = new Set(events.map((e) => e.slug))
  const newEvents = []
  for (const candidate of curated) {
    const problem = validate(candidate, now, existingKeys, categoryNames)
    if (problem) {
      console.log(`rejected (${problem}): ${candidate.name}`)
      continue
    }
    existingKeys.add(eventKey(candidate.name, candidate.date))
    newEvents.push({
      name: candidate.name,
      slug: slugify(candidate.name, candidate.date, existingSlugs),
      date: candidate.date,
      ...(candidate.endDate ? { endDate: candidate.endDate } : {}),
      type: candidate.type,
      format: candidate.format,
      city: candidate.city,
      ...(candidate.state ? { state: candidate.state } : {}),
      region: candidate.region,
      cost: candidate.cost,
      tags: candidate.tags.filter((t) => categoryNames.includes(t)),
      url: candidate.url,
      source: candidate.sourceName,
      description: candidate.description,
    })
  }

  if (DRY_RUN) {
    console.log(JSON.stringify(newEvents, null, 2))
    console.log(`dry run: ${newEvents.length} events would be added, nothing written`)
    return
  }

  if (newEvents.length === 0) {
    console.log('no new events passed validation, exiting')
    process.exit(0)
  }

  const merged = [...events, ...newEvents]
  const nowIso = new Date().toISOString()
  for (const item of freshFeedItems) {
    if (item.url) seen[item.url] = nowIso
  }
  for (const event of newEvents) seen[normalizeUrl(event.url)] = nowIso
  for (const url of Object.keys(seen)) {
    if (now - new Date(seen[url]).getTime() > SEEN_RETENTION_MS) delete seen[url]
  }

  writeFileSync(EVENTS_PATH, JSON.stringify(merged, null, 2) + '\n')
  writeFileSync(SEEN_PATH, JSON.stringify(seen, null, 2) + '\n')
  console.log(`added ${newEvents.length} events, ${merged.length} total`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
