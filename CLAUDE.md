# My Computer Broke

The single source of truth for cybersecurity events.

## Links
- **Domain**: myprinterbroke.com
- **Repo**: https://github.com/chriswalkerad/MPB

## Commands
```bash
npm run dev      # Vite dev server
npm run build    # Production build
npm run preview  # Preview production build
```

## What Is This?

A cybersecurity news + events site. Events: the Luma discover page, but exclusively for cybersecurity, aggregated from Eventbrite, Meetup, Luma, ISSA chapters, OWASP chapters, BSides, vendor conferences, presented in one curated feed with editorial voice. News: an automated link-out aggregator (headline + MPB-voice summary + link to the original article) curated from hand-picked sources for MSP owners, IT admins, and security pros; covers cybersecurity plus AI through the security lens.

Standalone brand, separate from Kinds Security (not publicly associated). Newsletter via Beehiiv.

## MVP Pages

1. **Homepage** (`/`) — Hero with 3D bunker background, headline, email subscribe (Beehiiv), floating event + news cards preview
2. **Explore Events** (`/events`) — Filterable grid of events. Filters: region, type, date. Cards link to detail pages.
3. **News** (`/news`) — Curated news feed, filterable by category and source. Cards link out to the original article (no detail pages).
4. **Daily Brief** (`/brief`, `/brief/[date]`) — Original MPB-authored morning digest of the day's curated stories, with links out. `/brief` shows the latest.
5. **Submit Event** (`/submit`) — Formspree form (endpoint: formspree.io/f/xwvnjlbq) for organizers
6. **Event Detail** (`/events/[slug]`) — Full event info + editorial note + outbound link

## Technical Stack

| Component | Choice |
|-----------|--------|
| Framework | React + Vite |
| 3D | react-three-fiber, drei, postprocessing |
| Animation | GSAP |
| Routing | react-router-dom |
| Data | JSON file (no database) |
| Hosting | Vercel |
| Newsletter | Beehiiv |
| Forms | Formspree |

## Event Data Model

```typescript
interface Event {
  name: string;
  slug: string;
  image?: string;
  date: string;
  endDate?: string;
  type: 'conference' | 'meetup' | 'workshop' | 'webinar' | 'chapter';
  city: string;
  region: string;
  url: string;
  source: string;
  description: string;
  cost: string;
  tags?: string[];
  editorialNote?: string;
  organizer?: string;
  capacity?: string;
}
```

## News Data Model

```typescript
interface NewsItem {
  slug: string;            // slugified headline + -YYYY-MM-DD, collision-guarded
  title: string;           // MPB-voice headline (displayed)
  originalTitle: string;   // source headline
  summary: string;         // one sentence, MPB voice
  url: string;             // canonical article, normalized
  source: { name: string };
  altSources: { name: string; url: string }[]; // merged duplicate coverage
  category: 'threats' | 'vulnerabilities' | 'msp-channel' | 'ai-security' | 'defense' | 'industry';
  publishedAt: string;
  fetchedAt: string;
}
```

## News Pipeline

`scripts/fetch-news.js` runs every 6 hours via `.github/workflows/fetch-news.yml` (also `workflow_dispatch`): fetches RSS from the `SOURCES` list, sends new candidates to GPT-5 on Microsoft Foundry for selection/dedup/copywriting, writes `src/data/news.json` + `scripts/news-seen.json`, and the workflow commits both back (Vercel redeploys on push).

- Requires `AZURE_AI_API_KEY` (repo secret in CI; env var locally).
- Local test: `AZURE_AI_API_KEY=... node scripts/fetch-news.js --dry-run` (prints selection, writes nothing).
- Retention: 14 days / floor of 50 items in news.json; seen-urls pruned at 30 days.
- Feed failures are logged and skipped, the run continues. A curation refusal exits 0 (self-heals next run); only real errors fail the workflow.
- Add a source: append to `SOURCES` in the script, verify with `--dry-run`. Some feeds (MSSP Alert, ChannelE2E) need the custom User-Agent already set there.
- **Daily brief:** `scripts/generate-brief.js` runs daily at 13:17 UTC via `.github/workflows/daily-brief.yml`, one hour after the 12:17 UTC news refresh. Reads stories from the last 36h in news.json (needs at least 2, else skips), writes an original MPB-voice digest to `src/data/briefs.json` (last 30 retained). Idempotent per day. Same secret, same refusal-skip semantics. Local test: `AZURE_AI_API_KEY=... node scripts/generate-brief.js --dry-run`.
- **Events discovery:** `scripts/fetch-events.js` runs weekly (mondays 14:17 UTC) via `.github/workflows/fetch-events.yml`. Ingests ICS feeds (Meetup groups), the infosec-conferences.com RSS feed, and conference circuit schedule pages (AI text extraction), curates/normalizes into the Event schema, validates in code (dates, regions, dedup), and commits `src/data/events.json` + `scripts/events-seen.json` directly, same as news (switched from review-PR mode 2026-08-25 at Chris's request). Same `AZURE_AI_API_KEY` secret. Local test: `AZURE_AI_API_KEY=... node scripts/fetch-events.js --dry-run`. Design: `docs/plans/2026-08-24-events-pipeline-design.md`.
- Full design: `docs/plans/2026-08-12-news-aggregator-design.md`.

## Brand & Tone

"My computer broke" is intentionally disarming. Our audience (MSP owners, IT admins, security pros) hears this phrase daily. Tone: useful, direct, occasionally funny, never salesy.

## Navigation (all pages)

- Top left: logo (links home)
- Top right: "News" + "Explore Events"
- Bottom left: logo + "Submit An Event"
- Bottom right: LinkedIn, X, Instagram

## Current State

- 3D bunker scene exists at `/bunker`
- Homepage needs bunker as background with landing content overlay
- Other pages not yet built

## Newsletter (Beehiiv)

When asked to prepare events for the newsletter, always provide **3 events** in this format:

```
**Event Name**

📅 Day of week, Month Day, Year

📍 City, State

🏷️ Type, Format

One-liner description — punchy, useful, matches our brand tone.

🔗 https://www.myprinterbroke.com/events?event=event-slug
```

If the user doesn't specify which events, ask: **"What events do you want?"**

## Planning

<!-- Design docs go in docs/plans/ -->
