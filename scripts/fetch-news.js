// fetches curated news: RSS feeds -> Claude curation -> src/data/news.json
// usage: node scripts/fetch-news.js [--dry-run]
// requires ANTHROPIC_API_KEY (GitHub secret in CI)
import { readFileSync, writeFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import Parser from 'rss-parser'
import Anthropic from '@anthropic-ai/sdk'

const __dirname = dirname(fileURLToPath(import.meta.url))
const NEWS_PATH = join(__dirname, '../src/data/news.json')
const SEEN_PATH = join(__dirname, 'news-seen.json')

const DRY_RUN = process.argv.includes('--dry-run')
const MAX_CANDIDATES = 200
const CANDIDATE_WINDOW_MS = 48 * 60 * 60 * 1000
const RETENTION_MS = 14 * 24 * 60 * 60 * 1000
const RETENTION_FLOOR = 50
const SEEN_RETENTION_MS = 30 * 24 * 60 * 60 * 1000

const CATEGORIES = ['threats', 'vulnerabilities', 'msp-channel', 'ai-security', 'defense', 'industry']

const SOURCES = [
  { name: 'BleepingComputer', url: 'https://www.bleepingcomputer.com/feed/' },
  { name: 'The Hacker News', url: 'https://feeds.feedburner.com/TheHackersNews' },
  { name: 'Krebs on Security', url: 'https://krebsonsecurity.com/feed/' },
  { name: 'The Record', url: 'https://therecord.media/feed' },
  { name: 'SecurityWeek', url: 'https://www.securityweek.com/feed/' },
  { name: 'Dark Reading', url: 'https://www.darkreading.com/rss.xml' },
  { name: 'Help Net Security', url: 'https://www.helpnetsecurity.com/feed/' },
  { name: 'SANS ISC', url: 'https://isc.sans.edu/rssfeed.xml' },
  { name: 'CISA Advisories', url: 'https://www.cisa.gov/cybersecurity-advisories/all.xml' },
  { name: 'MSSP Alert', url: 'https://www.msspalert.com/feed' },
  { name: 'ChannelE2E', url: 'https://www.channele2e.com/feed' },
  { name: 'Simon Willison', url: 'https://simonwillison.net/atom/everything/' },
  { name: 'Ars Technica', url: 'https://feeds.arstechnica.com/arstechnica/technology-lab' },
]

const CURATION_SYSTEM_PROMPT = `You are the news curator for My Printer Broke (myprinterbroke.com), a cybersecurity news + events site for MSP owners, IT admins, and security practitioners.

You receive a JSON array of candidate articles (id, title, source, publishedAt, snippet). Select the stories this audience actually needs, merge duplicate coverage, and write the copy.

SELECTION BAR (aim for 3-8 stories; fewer is fine, zero is fine on slow cycles):
- Include: actively exploited vulns and patch-now advisories; ransomware, breaches, and attacks affecting SMBs, MSPs, or common SMB stacks (M365, RMM tools, firewalls, backup software, VPNs); MSP/channel business news; AI stories through the security lens (AI-powered attacks, securing AI tools, AI for defenders, major AI releases clients will ask their MSP about); practical defensive tooling and guidance.
- Exclude: nation-state drama with no operational takeaway for an SMB, vendor press releases and funding rounds without user impact, academic research with no near-term exploitability, generic AI hype with no security angle.

MERGING: when several candidates cover the same story, pick the most authoritative or original reporting as "id" (prefer primary reporting over rewrites) and list the others in "duplicate_ids". Never output the same story twice.

VOICE (headline and summary): useful, direct, occasionally funny, never salesy. Write for someone who hears "my printer broke" ten times a day. Headline: punchy, under ~80 characters, plain language, no clickbait. Summary: ONE sentence, roughly 15-30 words, leading with what the reader should know or do. No emoji, no "in today's digital landscape", no hedging.

CATEGORY: exactly one of threats | vulnerabilities | msp-channel | ai-security | defense | industry.`

const OUTPUT_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['stories'],
  properties: {
    stories: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['id', 'duplicate_ids', 'headline', 'summary', 'category'],
        properties: {
          id: { type: 'integer' },
          duplicate_ids: { type: 'array', items: { type: 'integer' } },
          headline: { type: 'string' },
          summary: { type: 'string' },
          category: { type: 'string', enum: CATEGORIES },
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

function slugify(text, dateIso, existingSlugs) {
  const base = text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
    .replace(/-+$/, '')
  const datePart = dateIso.slice(0, 10)
  let slug = `${base}-${datePart}`
  let n = 2
  while (existingSlugs.has(slug)) slug = `${base}-${datePart}-${n++}`
  existingSlugs.add(slug)
  return slug
}

async function fetchFeeds() {
  const parser = new Parser({
    timeout: 15000,
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; MPBNewsBot/1.0; +https://myprinterbroke.com)' },
  })
  const results = await Promise.allSettled(
    SOURCES.map(async (source) => {
      const feed = await parser.parseURL(source.url)
      return { source, items: feed.items || [] }
    }),
  )
  const items = []
  results.forEach((result, i) => {
    if (result.status === 'rejected') {
      console.warn(`feed failed: ${SOURCES[i].name}: ${result.reason?.message || result.reason}`)
      return
    }
    console.log(`feed ok: ${SOURCES[i].name} (${result.value.items.length} items)`)
    for (const item of result.value.items) {
      if (!item.link || !item.title) continue
      const publishedAt = item.isoDate || (item.pubDate ? new Date(item.pubDate).toISOString() : null)
      if (!publishedAt) continue
      items.push({
        title: item.title.trim(),
        url: normalizeUrl(item.link),
        source: result.value.source.name,
        publishedAt,
        snippet: (item.contentSnippet || '').replace(/\s+/g, ' ').trim().slice(0, 400),
      })
    }
  })
  return items
}

async function curate(candidates) {
  const client = new Anthropic()
  const payload = candidates.map(({ id, title, source, publishedAt, snippet }) => ({ id, title, source, publishedAt, snippet }))
  const response = await client.messages.create({
    model: 'claude-opus-5',
    max_tokens: 16000,
    system: CURATION_SYSTEM_PROMPT,
    output_config: { format: { type: 'json_schema', schema: OUTPUT_SCHEMA } },
    messages: [{ role: 'user', content: JSON.stringify(payload) }],
  })
  if (response.stop_reason === 'refusal') {
    console.warn('curation request refused, skipping run', response.stop_details)
    process.exit(0)
  }
  const text = response.content.find((b) => b.type === 'text')?.text
  if (!text) throw new Error('no text block in curation response')
  return JSON.parse(text).stories
}

async function main() {
  const news = JSON.parse(readFileSync(NEWS_PATH, 'utf8'))
  const seen = JSON.parse(readFileSync(SEEN_PATH, 'utf8'))
  const seenSet = new Set(Object.keys(seen))
  for (const item of news) {
    seenSet.add(item.url)
    for (const alt of item.altSources || []) seenSet.add(alt.url)
  }

  const fetched = await fetchFeeds()
  const now = Date.now()
  const byUrl = new Map()
  for (const item of fetched) {
    if (seenSet.has(item.url)) continue
    if (now - new Date(item.publishedAt).getTime() > CANDIDATE_WINDOW_MS) continue
    if (!byUrl.has(item.url)) byUrl.set(item.url, item)
  }
  const candidates = [...byUrl.values()]
    .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
    .slice(0, MAX_CANDIDATES)
    .map((item, i) => ({ ...item, id: i }))

  console.log(`${candidates.length} new candidates`)
  if (candidates.length === 0) {
    console.log('nothing new, exiting')
    process.exit(0)
  }

  const stories = await curate(candidates)
  console.log(`curator selected ${stories.length} stories`)

  const nowIso = new Date().toISOString()
  const existingSlugs = new Set(news.map((n) => n.slug))
  const usedIds = new Set()
  const newItems = []
  for (const story of stories) {
    const canonical = candidates[story.id]
    if (!canonical || usedIds.has(story.id)) continue
    usedIds.add(story.id)
    const altSources = []
    for (const dupId of story.duplicate_ids) {
      const dup = candidates[dupId]
      if (dup && dupId !== story.id && !usedIds.has(dupId)) {
        usedIds.add(dupId)
        altSources.push({ name: dup.source, url: dup.url })
      }
    }
    newItems.push({
      slug: slugify(story.headline, canonical.publishedAt, existingSlugs),
      title: story.headline,
      originalTitle: canonical.title,
      summary: story.summary,
      url: canonical.url,
      source: { name: canonical.source },
      altSources,
      category: story.category,
      publishedAt: canonical.publishedAt,
      fetchedAt: nowIso,
    })
  }

  if (DRY_RUN) {
    console.log(JSON.stringify(newItems, null, 2))
    console.log('dry run, nothing written')
    return
  }

  let merged = [...newItems, ...news].sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
  merged = merged.filter((item, i) => i < RETENTION_FLOOR || now - new Date(item.publishedAt).getTime() <= RETENTION_MS)

  for (const c of candidates) seen[c.url] = nowIso
  for (const url of Object.keys(seen)) {
    if (now - new Date(seen[url]).getTime() > SEEN_RETENTION_MS) delete seen[url]
  }

  writeFileSync(NEWS_PATH, JSON.stringify(merged, null, 2) + '\n')
  writeFileSync(SEEN_PATH, JSON.stringify(seen, null, 2) + '\n')
  console.log(`wrote ${newItems.length} new items, ${merged.length} total`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
