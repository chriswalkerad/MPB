# News Aggregator Design

MPB grows from an events site into a news + events site so it becomes its own distribution channel for the ICP (MSP owners, IT admins, security pros). News appears automatically: RSS feeds from hand-picked sources are fetched on a schedule, curated by Claude, and committed as JSON. Format is a link-out aggregator (headline + MPB-voice summary + link to the original), never republishing. Scope is cybersecurity plus AI through the security lens. Reference site: bleepingcomputer.com.

## Decisions

| Decision | Choice | Why |
|---|---|---|
| Curation | LLM pass (Claude API, `claude-opus-5`) | Ranks for ICP relevance, merges cross-source duplicates, writes brand-voice copy |
| Format | Link-out aggregator, no drawer, no per-story pages | Summary fully visible on card; per-item pages would be thin duplicate content |
| Headline | MPB-voice `title` displayed; `originalTitle` stored | Voice is the differentiator; original kept for integrity |
| Retention | 14 days, floor of 50 newest items | Bundle is statically imported; git history is the free archive |
| Dedupe | `scripts/news-seen.json` (url → firstSeen, 30-day prune) | news.json only holds accepted stories; rejected candidates must not be re-curated every run |
| Images | None in v1; `GenerativePattern seed={slug}` | Saves 1 HTTP/story, avoids hotlink rot |
| Cadence | GitHub Action cron `17 */6 * * *` + workflow_dispatch | 3-4x/day; commit-back triggers Vercel deploy |
| Cost | ~150 candidates in, small JSON out, 4x/day | Roughly $0.50-1.00/day on claude-opus-5 |

## Data model (`src/data/news.json`)

```typescript
interface NewsItem {
  slug: string;            // slugified headline + -YYYY-MM-DD, collision-guarded
  title: string;           // MPB-voice headline (displayed)
  originalTitle: string;   // source headline
  summary: string;         // one sentence, MPB voice
  url: string;             // canonical article, normalized (no utm_*, no fragment)
  source: { name: string };
  altSources: { name: string; url: string }[]; // merged duplicate coverage
  category: 'threats' | 'vulnerabilities' | 'msp-channel' | 'ai-security' | 'defense' | 'industry';
  publishedAt: string;     // ISO, from feed
  fetchedAt: string;       // ISO, pipeline run time
}
```

## Pipeline (`scripts/fetch-news.js`)

1. Seen-set = keys of `news-seen.json` ∪ all urls in news.json (incl. altSources).
2. Fetch all `SOURCES` feeds (rss-parser, 15s timeout, MPBNewsBot UA) via `Promise.allSettled`; failed feeds are logged and skipped.
3. Normalize items (url normalization is the dedupe key), keep last 48h, unseen, cap 200 newest.
4. Zero candidates → exit 0 (workflow skips commit).
5. One Claude call, structured output (json_schema): selects 3-8 stories, merges duplicates (`id` = canonical, `duplicate_ids` = rest), writes headline + summary, assigns category. `stop_reason === "refusal"` → exit 0 (self-heals next run).
6. Merge, sort desc by publishedAt, prune (14d / floor 50), mark ALL candidates seen, prune seen > 30d, write both files.

`--dry-run` prints the curation result and writes nothing.

## Sources

BleepingComputer, The Hacker News, Krebs on Security, The Record, SecurityWeek, Dark Reading, Help Net Security, SANS ISC, CISA Advisories, MSSP Alert, ChannelE2E, Simon Willison, Ars Technica. All 13 verified parsing 2026-08-12 (MSSP Alert/ChannelE2E require the custom UA). CRN security feed 404s, so it is excluded.

To add a source: append to `SOURCES` in `fetch-news.js`, run `--dry-run` to confirm it parses. If a feed starts failing, the run continues without it; remove it if it stays dead.

## Frontend

- `/news` (`src/pages/News.jsx`): URL-driven filters (`?category=`, `?source=`), day-grouped list, mirrors ExploreEvents patterns.
- `NewsCard`: link-out `<a target="_blank">`, GenerativePattern thumb, category/source badges, relative time, "also on X" for merged coverage.
- `NewsFilters`: category tabs + source dropdown (options derived from news.json).
- Homepage: last 2 floating cards show newest stories via `FloatingNewsCard` (`$ news --source=...`); falls back to events while news.json is empty.
- Nav: "News" in Layout top nav (hidden on /news) and bottom nav. Sitemap + llms.txt updated. `prerender.js` not updated (not in default build).

## Daily Brief (added same day)

One MPB-authored digest per day: original prose synthesizing the day's curated stories, the site's first owned content. Legally clean (commentary/synthesis with links out, no republishing); doubles as future newsletter body.

- `scripts/generate-brief.js`: reads news.json stories from the last 36h (min 2, max 8; skips otherwise), one Claude call (same model/output pattern as fetch-news) producing `{ title, intro, items: [{ slug, heading, body }], signOff }`. Items are joined back to stories by slug (hallucinated slugs dropped); the brief stores each item's url/source/category from the real story record. Idempotent: exits if today's brief exists.
- `src/data/briefs.json`: newest first, last 30 retained (older briefs live in git history). Brief slug = date (`2026-08-12`), so URLs are `/brief/2026-08-12`.
- `.github/workflows/daily-brief.yml`: daily `17 13 * * *` UTC (9:17am ET), one hour after the 12:17 UTC news refresh so stories are fresh. Same commit-back pattern, `briefs.json` only.
- Frontend: `/brief` renders the latest, `/brief/:slug` a specific day; prev/next navigation; category-colored left borders per item; `Read at {source} ↗` links. The News page shows a banner card linking to the latest brief. Brief pages are in the sitemap (original content, worth indexing).

## Operations

- Secret: `ANTHROPIC_API_KEY` (repo secret; also needed locally for full runs).
- Manual run: Actions → Fetch News → Run workflow.
- Local: `ANTHROPIC_API_KEY=... node scripts/fetch-news.js --dry-run`
- The bot commit touches only `src/data/news.json` + `scripts/news-seen.json`. No `[skip ci]` (Vercel must deploy). GITHUB_TOKEN pushes don't retrigger workflows.
