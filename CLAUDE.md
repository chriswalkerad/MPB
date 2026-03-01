# My Computer Broke

The single source of truth for cybersecurity events.

## Links
- **Domain**: mycomputerbroke.com
- **Repo**: https://github.com/chriswalkerad/MPB

## Commands
```bash
npm run dev      # Vite dev server
npm run build    # Production build
npm run preview  # Preview production build
```

## What Is This?

A cybersecurity events aggregator — the Luma discover page, but exclusively for cybersecurity. We aggregate events from Eventbrite, Meetup, Luma, ISSA chapters, OWASP chapters, BSides, vendor conferences, and present them in one curated feed with editorial voice.

Standalone brand, separate from Kinds Security (not publicly associated). Newsletter via Beehiiv.

## MVP Pages

1. **Homepage** (`/`) — Hero with 3D bunker background, headline, email subscribe (Beehiiv), floating event cards preview
2. **Explore Events** (`/events`) — Filterable grid of events. Filters: region, type, date. Cards link to detail pages.
3. **Submit Event** (`/submit`) — Formspree form (endpoint: formspree.io/f/xwvnjlbq) for organizers
4. **Event Detail** (`/events/[slug]`) — Full event info + editorial note + outbound link

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

## Brand & Tone

"My computer broke" is intentionally disarming. Our audience (MSP owners, IT admins, security pros) hears this phrase daily. Tone: useful, direct, occasionally funny, never salesy.

## Navigation (all pages)

- Top left: logo (links home)
- Top right: "Explore Events"
- Bottom left: logo + "Submit An Event"
- Bottom right: LinkedIn, X, Instagram

## Current State

- 3D bunker scene exists at `/bunker`
- Homepage needs bunker as background with landing content overlay
- Other pages not yet built

## Planning

<!-- Design docs go in docs/plans/ -->
