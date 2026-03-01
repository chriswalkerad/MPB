# Explore Events Page Design

**Date:** 2026-02-28
**Status:** Approved
**Author:** Chris + Claude

## Overview

Two page types for browsing events:
1. **`/events`** — Main explore page with category grid + all events
2. **`/events/category/[slug]`** — Category page with header + filtered events

Both share filters and event list components. Location filter lives in the global nav.

## Global Navigation Update

```
┌──────────────────────────────────────────────────────────────────┐
│  [logo] /MPB   Los Angeles ▾           Subscribe   Explore Events│
└──────────────────────────────────────────────────────────────────┘
```

- Location dropdown after logo (left side)
- Auto-detects via IP geolocation on first visit
- Remembers selection in localStorage
- Applies globally across all pages

## Visual Style

- Mostly black background with subtle red gradient at top (~10% of viewport)
- Same nav/footer as homepage
- Outfit font for headings, JetBrains Mono for badges/metadata

## Main Page (`/events`)

```
┌─────────────────────────────────────────────────────────┐
│  Top Nav (with location selector)                       │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  "Explore Events"                                       │
│  "Conferences, meetups, and workshops                   │
│   — sorted by what's happening next."                   │
│                                                         │
├─────────────────────────────────────────────────────────┤
│  FILTERS                                                │
│  [All | In-Person | Virtual]      [Event Type ▾]       │
│                                                         │
├─────────────────────────────────────────────────────────┤
│  BROWSE BY CATEGORY (grid)                              │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐    │
│  │ Community    │ │ AI & ML      │ │ Compliance   │    │
│  │ 24 Events    │ │ 12 Events    │ │ 8 Events     │    │
│  └──────────────┘ └──────────────┘ └──────────────┘    │
│                                                         │
├─────────────────────────────────────────────────────────┤
│  EVENT LIST (date-grouped)                              │
│                                                         │
│  Today                                                  │
│  ┌───────────────────────────────────────────────┐     │
│  │[img] Event Name · 6:00 PM · LA · Free         │     │
│  └───────────────────────────────────────────────┘     │
│                                                         │
│  Tomorrow                                               │
│  ...                                                    │
│                                                         │
├─────────────────────────────────────────────────────────┤
│  Bottom Nav                                             │
└─────────────────────────────────────────────────────────┘
```

## Category Page (`/events/category/[slug]`)

```
┌─────────────────────────────────────────────────────────┐
│  Top Nav (with location selector)                       │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  "AI & Machine Learning"                                │
│  "AI security, ML threats, LLM security, AI governance" │
│  12 Events                                              │
│                                                         │
├─────────────────────────────────────────────────────────┤
│  FILTERS                                                │
│  [All | In-Person | Virtual]      [Event Type ▾]       │
│                                                         │
├─────────────────────────────────────────────────────────┤
│  EVENT LIST (date-grouped, filtered to category)        │
│  ...                                                    │
│                                                         │
├─────────────────────────────────────────────────────────┤
│  Bottom Nav                                             │
└─────────────────────────────────────────────────────────┘
```

## Categories

| # | Category | Slug | Description |
|---|----------|------|-------------|
| 1 | Community & General | `community-general` | BSides, DEF CON Groups, ISSA/ISACA/ISC2 chapters, general infosec meetups |
| 2 | AI & Machine Learning | `ai-ml` | AI security, ML threats, LLM security, AI governance |
| 3 | Compliance & GRC | `compliance-grc` | HIPAA, CMMC, SOC 2, PCI-DSS, ISO 27001, cyber insurance |
| 4 | Cloud Security | `cloud-security` | AWS/Azure/GCP security, cloud-native, CNAPP, CSPM |
| 5 | MSP & Channel | `msp-channel` | IT Nation, DattoCon, Pax8 Beyond, MSP-focused events |
| 6 | Threat Intelligence | `threat-intel` | Threat briefings, CTI sharing, MITRE ATT&CK |
| 7 | Incident Response | `incident-response` | IR planning, tabletop exercises, forensics |
| 8 | Identity & Access | `identity-access` | Zero trust, MFA, IAM, SSO, privileged access |
| 9 | Security Awareness | `security-awareness` | SAT events, phishing education, human risk |
| 10 | AppSec & DevSecOps | `appsec-devsecops` | Application security, secure coding, SAST/DAST |
| 11 | Networking & Career | `networking-career` | Career events, hiring fairs, CISO roundtables |

## Filters

### Format Tabs (underline active)
- All (default)
- In-Person
- Virtual

Hybrid events appear in both In-Person and Virtual views.

### Event Type Dropdown
- All Types (default)
- Conference
- Meetup
- Workshop
- Webinar
- Chapter Meeting
- CTF & Hackathon

### Location (in nav)
Regions with nested cities:
- All Locations (default)
- West Coast: Los Angeles, San Francisco, San Diego, Seattle, Portland
- Southwest: Phoenix, Las Vegas, Denver
- Midwest: Chicago, Dallas, Houston, Austin, Minneapolis
- Southeast: Miami, Atlanta, Tampa, Charlotte, Nashville
- Northeast: NYC, Boston, Philadelphia, Washington DC
- Virtual (standalone)

## Event Card Design

Horizontal layout, 2-3 per row on desktop, 1 on mobile.

```
┌────────────────────────────────────────────────────────┐
│ ┌────────┐                                             │
│ │        │  BSides Los Angeles 2026               ↗   │
│ │ 1:1    │  📅 Mar 15 · 9:00 AM – 5:00 PM             │
│ │ image  │  📍 Los Angeles, CA                        │
│ │        │  [Conference] [In-Person] [Free]           │
│ └────────┘  Community & General · Threat Intel        │
└────────────────────────────────────────────────────────┘
```

### Card Elements
- **Image:** 1:1 square, solid color + type icon as placeholder if missing
- **Event name:** Bold, truncate if > 2 lines
- **Date/time:** Human-readable, show range for multi-day
- **Location:** City for in-person, "Online" for virtual
- **Type badge:** Conference, Meetup, etc.
- **Format badge:** In-Person, Virtual, Hybrid
- **Cost:** "Free" (green) or price
- **Category pills:** 1-2 categories, muted
- **External icon:** ↗ for external URLs (opens new tab)

### Card States
- Default: As above
- Hover: Subtle lift or border glow
- No image: Solid dark background with event type icon

## Date Headers

Events grouped by date:
- "Today"
- "Tomorrow"
- "Mar 4 Monday"
- etc.

## URL Structure

```
/events                                    → All events
/events?format=virtual                     → Virtual only
/events?type=meetup                        → Meetups only
/events/category/ai-ml                     → AI category
/events/category/ai-ml?format=in-person    → AI + in-person
```

## Data Requirements

Each event needs:
```json
{
  "name": "BSides Los Angeles 2026",
  "slug": "bsides-la-2026",
  "image": "/images/events/bsides-la-2026.jpg",
  "date": "2026-03-15T09:00:00-07:00",
  "endDate": "2026-03-15T17:00:00-07:00",
  "type": "conference",
  "format": "in-person",
  "city": "Los Angeles, CA",
  "region": "west-coast",
  "cost": "Free",
  "tags": ["Community & General", "Threat Intelligence"],
  "url": "/events/bsides-la-2026",
  "description": "LA's premier community security conference."
}
```

New field: `format` (enum: `in-person`, `virtual`, `hybrid`)
New field: `region` (explicit in JSON)

## Empty States

| State | Message |
|-------|---------|
| No events match filters | "No events match your filters. Try broadening your search." + Clear filters |
| No events at all | "Events are being loaded. Check back soon." |
| All events past | "No upcoming events. Subscribe to get notified." + email input |

## Mobile

- Category grid: 2 columns
- Event cards: 1 per row, full width
- Format tabs: remain as row
- Event Type filter: dropdown
- Filters sticky on scroll

## Out of Scope (MVP)

- Search bar
- Featured/Editor's Pick sections
- Pagination
- Map view
- Save/Interested functionality
- Past events section
