# My Printer Broke

cybersecurity news + events for MSP owners, IT admins, and security pros. live at [myprinterbroke.com](https://myprinterbroke.com).

## what's on the site

- **events** (`/events`): curated directory of cybersecurity conferences, meetups, workshops, and virtual events across the US, filterable by location, format, type, and category
- **news** (`/news`): automated link-out news feed. rss from 13 hand-picked sources is curated by an llm every 6 hours: it selects the stories that matter to this audience, merges duplicate coverage, and writes headlines and one-line summaries in mpb voice. cards link to the original article
- **daily brief** (`/brief`): original mpb-authored morning digest of the day's curated stories, generated daily at 9:17am ET
- **submit** (`/submit`): event submission form for organizers

## stack

react + vite spa, no database (data lives in committed json under `src/data/`), react-three-fiber for the 3d bunker, hosted on vercel, beehiiv newsletter, formspree forms.

## commands

```bash
npm install
npm run dev              # vite dev server
npm run build            # production build + sitemap
npm run build:prerender  # what vercel runs: build + sitemap + static html for every route
npm run preview          # preview production build
```

## seo / discoverability

production builds prerender every route (~1,250 pages) to static html via headless chrome, so crawlers that don't execute js — googlebot's first pass, GPTBot, ClaudeBot, PerplexityBot — see full content, unique meta tags, and json-ld on every page. the react spa hydrates on top at runtime.

- `scripts/prerender.js` renders `/`, `/events`, `/news`, `/brief/*`, every `/events/[slug]`, category, and city page. a route that fails to render (after one retry) fails the build — otherwise it would ship as an empty spa shell
- city landing pages (`/events/city/[slug]`) exist for the 28 metros with 8+ events; city name normalization lives in `src/lib/cities.js`
- `scripts/generate-sitemap.js` emits `sitemap.xml` with every url; `public/robots.txt` explicitly allows ai crawlers; `public/llms.txt` describes the site for llms
- canonical urls use `https://www.myprinterbroke.com` (the bare domain redirects to www)

## automation

| workflow | schedule | what it does |
|---|---|---|
| `fetch-news.yml` | every 6h | rss -> ai curation -> commits `src/data/news.json` |
| `daily-brief.yml` | daily 13:17 utc | curated stories -> ai digest -> commits `src/data/briefs.json` |
| `fetch-events.yml` | weekly mon 14:17 utc | ics/rss/schedule pages -> ai curation -> opens a review pr with new events |
| `daily-tweet.yml` | daily 14:00 utc | posts an upcoming event to bluesky |

the news workflows need an `AZURE_AI_API_KEY` repo secret. commits from the workflows trigger vercel redeploys. local dry run:

```bash
AZURE_AI_API_KEY=... node scripts/fetch-news.js --dry-run
AZURE_AI_API_KEY=... node scripts/generate-brief.js --dry-run
```

## branching and merge order

- `main` is production. vercel deploys every push to it.
- `dev` is the integration branch. feature branches come off `dev` and pr back into `dev`.
- shipping = a promotion pr from `dev` to `main`, merged after the feature prs land.
- the bots commit straight to `main` (news every 6h, brief daily), so `main` is usually a few data commits ahead of `dev`. before merging a promotion pr, hit "update branch" on it to refresh `dev` from `main` first. this is hygiene, not conflict resolution: the bots only touch `src/data/*.json` and `scripts/*-seen.json`, which feature branches should never edit.
- the weekly events pr (`auto/events-refresh`) targets `main` directly and is independent of everything else. review it before merging: dates and cities correct, no duplicates, descriptions in our voice.
- data files (`news.json`, `briefs.json`, `events.json`, the seen files) are owned by the pipelines. don't hand-edit them on feature branches or the next bot commit will bury your change.

full pipeline design: [docs/plans/2026-08-12-news-aggregator-design.md](docs/plans/2026-08-12-news-aggregator-design.md)
