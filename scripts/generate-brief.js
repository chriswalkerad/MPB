// generates the MPB daily brief from already-curated stories in news.json
// usage: node scripts/generate-brief.js [--dry-run]
// requires ANTHROPIC_API_KEY (GitHub secret in CI)
import { readFileSync, writeFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import Anthropic from '@anthropic-ai/sdk'

const __dirname = dirname(fileURLToPath(import.meta.url))
const NEWS_PATH = join(__dirname, '../src/data/news.json')
const BRIEFS_PATH = join(__dirname, '../src/data/briefs.json')

const DRY_RUN = process.argv.includes('--dry-run')
const STORY_WINDOW_MS = 36 * 60 * 60 * 1000
const MIN_STORIES = 2
const MAX_STORIES = 8
const BRIEFS_RETAINED = 30

const BRIEF_SYSTEM_PROMPT = `You write the MPB Daily Brief for My Printer Broke (myprinterbroke.com), a cybersecurity news + events site for MSP owners, IT admins, and security practitioners.

You receive a JSON array of today's curated stories (title, summary, url, source, category). Turn them into one short daily digest, entirely in your own words.

VOICE: useful, direct, occasionally funny, never salesy. Write for someone who hears "my printer broke" ten times a day and has fifteen minutes before their first ticket. No emoji, no "in today's digital landscape", no filler.

STRUCTURE:
- title: "..." style headline for the whole brief, under ~70 chars, capturing the day's theme. Do not include the date or the words "Daily Brief" (the page adds those).
- intro: 1-2 sentences setting up the day. Plain, punchy.
- items: one per story, ordered most-important first. Each has:
  - heading: short label for the story (can reuse or sharpen the story's headline)
  - body: 2-3 sentences of YOUR OWN prose. What happened, why this audience should care, and what to do about it if anything. Do not copy the source's text; synthesize.
- signOff: one closing line, light but not cutesy.

Include every story you are given unless one is truly redundant. Never invent facts beyond what the title and summary state; if a detail is not in the input, do not assert it.`

const BRIEF_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['title', 'intro', 'items', 'signOff'],
  properties: {
    title: { type: 'string' },
    intro: { type: 'string' },
    items: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['slug', 'heading', 'body'],
        properties: {
          slug: { type: 'string' },
          heading: { type: 'string' },
          body: { type: 'string' },
        },
      },
    },
    signOff: { type: 'string' },
  },
}

async function main() {
  const news = JSON.parse(readFileSync(NEWS_PATH, 'utf8'))
  const briefs = JSON.parse(readFileSync(BRIEFS_PATH, 'utf8'))

  const today = new Date().toISOString().slice(0, 10)
  if (briefs.some((b) => b.date === today)) {
    console.log(`brief for ${today} already exists, exiting`)
    process.exit(0)
  }

  const now = Date.now()
  const stories = news
    .filter((item) => now - new Date(item.publishedAt).getTime() <= STORY_WINDOW_MS)
    .slice(0, MAX_STORIES)
  if (stories.length < MIN_STORIES) {
    console.log(`only ${stories.length} recent stories, skipping brief`)
    process.exit(0)
  }

  const client = new Anthropic()
  const payload = stories.map(({ slug, title, summary, source, category }) => ({ slug, title, summary, source: source.name, category }))
  const response = await client.messages.create({
    model: 'claude-opus-5',
    max_tokens: 16000,
    system: BRIEF_SYSTEM_PROMPT,
    output_config: { format: { type: 'json_schema', schema: BRIEF_SCHEMA } },
    messages: [{ role: 'user', content: JSON.stringify(payload) }],
  })
  if (response.stop_reason === 'refusal') {
    console.warn('brief request refused, skipping run', response.stop_details)
    process.exit(0)
  }
  const text = response.content.find((b) => b.type === 'text')?.text
  if (!text) throw new Error('no text block in brief response')
  const draft = JSON.parse(text)

  const storyBySlug = new Map(stories.map((s) => [s.slug, s]))
  const items = draft.items
    .filter((item) => storyBySlug.has(item.slug))
    .map((item) => {
      const story = storyBySlug.get(item.slug)
      return {
        heading: item.heading,
        body: item.body,
        url: story.url,
        source: story.source.name,
        category: story.category,
        storySlug: story.slug,
      }
    })
  if (items.length < MIN_STORIES) throw new Error('brief items did not match curated stories')

  const brief = {
    slug: today,
    date: today,
    title: draft.title,
    intro: draft.intro,
    items,
    signOff: draft.signOff,
    generatedAt: new Date().toISOString(),
  }

  if (DRY_RUN) {
    console.log(JSON.stringify(brief, null, 2))
    console.log('dry run, nothing written')
    return
  }

  const merged = [brief, ...briefs].slice(0, BRIEFS_RETAINED)
  writeFileSync(BRIEFS_PATH, JSON.stringify(merged, null, 2) + '\n')
  console.log(`wrote brief for ${today} (${items.length} items), ${merged.length} briefs retained`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
