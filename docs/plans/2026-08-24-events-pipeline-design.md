# Events Pipeline Design

Automates what was previously manual: event discovery used to happen in ad-hoc Claude chat sessions (bulk commits of scraped batches, last run April 2026), which meant the upcoming-events count decayed between sessions. This pipeline runs weekly and turns the job into reviewing a small PR.

## Architecture

Same shape as the news pipeline (`docs/plans/2026-08-12-news-aggregator-design.md`), different ingestion layer, because events live in iCal and schedule pages rather than RSS.

Three source adapter types in `scripts/fetch-events.js`:

| type | what | examples |
|---|---|---|
| `ics` | iCal feeds, the events-world RSS. Parsed with a minimal in-script VEVENT parser | Meetup groups: `meetup.com/<group>/events/ical/` (OWASP NYC/Atlanta/LA, ISSA LA, Dallas Hackers Association) |
| `rss` | directory feeds via rss-parser | infosec-conferences.com/feed/ |
| `page` | schedule page fetched, stripped to text (12k char cap), handed to the model to extract events | SecureWorld, FutureCon, Cybersecurity Summit circuit pages (no JSON-LD available, verified 2026-08-24) |

## Flow

1. Ingest all sources via `Promise.allSettled` (failures logged and skipped). Feed items filtered against `scripts/events-seen.json` (url -> firstSeen, 120-day retention) plus urls already in events.json.
2. One model call (gpt-5 on Foundry, strict json schema): extracts events from page text, filters to cybersecurity + US-or-virtual + future, normalizes into the Event schema (type/format/region enums, tags restricted to the 12 category names), writes MPB-voice descriptions, and dedupes against a supplied list of existing upcoming events.
3. Code-level validation, never trusted to the model: date parses and is in the future (max 18 months out), region/tag enums, url shape, fuzzy duplicate key (normalized name + start day) against existing events. Rejects are logged, not fatal.
4. New events appended to `src/data/events.json`; candidate urls marked seen.

`--dry-run` prints what would be added, writes nothing. Refusal from the model exits 0 (self-heals next week); real errors exit 1.

## Publish mode: weekly PR, not direct commit

`.github/workflows/fetch-events.yml` runs mondays 14:17 UTC and opens a PR (`auto/events-refresh` -> main) via peter-evans/create-pull-request, instead of committing directly like news. Rationale: wrong dates/cities on events are worse than a bland news headline, so batches get a 2-minute human review. Flip to direct commit later by replacing the PR step with the news workflow's commit step.

Requires the repo setting "Allow GitHub Actions to create and approve pull requests" (Settings -> Actions -> General).

## First live dry-run (2026-08-24)

20 events discovered and validated: 4 SecureWorld 2026 editions, 10 Cybersecurity Summit stops, 6 FutureCon cities, 1 Dallas Hackers meetup (with per-event Meetup url). Dates/cities spot-checked correct. Known limitations: circuit-page events carry the listing-page url rather than per-event urls; region for some cities (e.g. Denver) follows the dominant convention in existing data, which is itself inconsistent.

## Adding sources

Append to `SOURCES` in `fetch-events.js` with the right adapter type and verify with `--dry-run`. Meetup groups are the easiest win: any group slug becomes an ics url. Luma calendars (AI Tinkerers chapters) are a good future add once calendar ics urls are collected. Broad Eventbrite discovery is deliberately excluded (public search API retired; scraping search violates their ToS); individual organizer pages with structured data are fine to add as `page` sources.
