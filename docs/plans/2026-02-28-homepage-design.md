# Homepage Design

**Date:** 2026-02-28
**Status:** Approved
**Author:** Chris + Claude

## Overview

Single-viewport homepage for mycomputerbroke.com. 3D bunker scene as full background with content overlay. No scrolling — all actions navigate to other pages.

## Layer Structure

```
[z-index: 0]  3D Canvas (Bunker Scene)
              - God rays, particles, fog
              - Slow orbiting camera animation
              - Fills 100vw × 100vh

[z-index: 10] Content Overlay (position: absolute)
              - Transparent background
              - pointer-events: none on container
              - pointer-events: auto on interactive elements
```

The bunker's god rays and particles provide atmosphere — no additional glow orbs or grid needed.

## Content Layout

```
┌──────────────────────────────────────────────────────────────────┐
│ TOP NAV (fixed)                                                  │
│ 💻 mycomputerbroke              Subscribe    Explore Events ↗   │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────────┐  ┌────────────────────────────────┐ │
│  │                         │  │                                │ │
│  │  ○ cybersecurity        │  │   ┌──────────────┐             │ │
│  │    events, one place    │  │   │ Event Card   │             │ │
│  │                         │  │   └──────────────┘             │ │
│  │  Every cyber            │  │          ┌──────────────┐      │ │
│  │  event.                 │  │          │ Event Card   │      │ │
│  │  Found here.            │  │          └──────────────┘      │ │
│  │                         │  │   ┌──────────────┐             │ │
│  │  Conferences, meetups.. │  │   │ Event Card   │             │ │
│  │                         │  │   └──────────────┘             │ │
│  │  [Attend Your First →]  │  │          ┌──────────────┐      │ │
│  │                         │  │          │ Event Card   │      │ │
│  └─────────────────────────┘  │          └──────────────┘      │ │
│           ~45%                │   ┌──────────────┐             │ │
│                               │   │ Event Card   │             │ │
│                               │   └──────────────┘             │ │
│                               └────────────────────────────────┘ │
│                                         ~55%                     │
│                                                                  │
├──────────────────────────────────────────────────────────────────┤
│ BOTTOM NAV (fixed)                                               │
│ 💻 mycomputerbroke  Submit An Event              [in] [x] [ig]  │
└──────────────────────────────────────────────────────────────────┘
```

### Left Column (~45%)
- Status badge: "○ cybersecurity events, one place"
- Headline: "Every cyber event. Found here." (gradient shimmer on "Found here.")
- Subhead: "Conferences, meetups, and workshops — curated weekly so you never miss what matters."
- CTA: "Attend Your First Event →" button

### Right Column (~55%)
- 5-6 floating event cards
- Staggered positions (organic scatter)
- `backdrop-filter: blur(20px)` for readability
- Subtle border: `rgba(255,255,255,0.08)`

## Navigation

### Top Nav
| Element | Action |
|---------|--------|
| Logo (💻 mycomputerbroke) | `/` |
| Subscribe | Opens slide-in panel |
| Explore Events ↗ | `/events` |

### Bottom Nav
| Element | Action |
|---------|--------|
| Logo | `/` |
| Submit An Event | `/submit` |
| LinkedIn | External link |
| X | External link |
| Instagram | External link |

## Subscribe Slide-in Panel

Triggered by "Subscribe" in top nav.

```
                                    ┌─────────────────────────┐
                                    │                    ✕    │
                                    │                         │
                                    │                         │
                                    │   Weekly cyber events   │
                                    │   in your inbox.        │
                                    │                         │
                                    │   Curated. No spam.     │
                                    │                         │
                                    │   ┌─────────────────┐   │
                                    │   │ you@email.com   │   │
                                    │   └─────────────────┘   │
                                    │                         │
                                    │   [ Subscribe →]        │
                                    │                         │
                                    │                         │
                                    └─────────────────────────┘
```

- Slides in from right edge
- Full viewport height minus top nav: `height: calc(100vh - topNavHeight)`
- Width: ~320-400px
- Content vertically centered
- `backdrop-filter: blur()` background
- Posts to Beehiiv
- Close via ✕ or clicking outside panel
- Rest of page dims when panel is open

## Animations

| Animation | Element | Behavior |
|-----------|---------|----------|
| `floatIn` | Event cards | Fade up on load, staggered delays |
| `gentleFloat` | Event cards | Continuous gentle bob (6s cycle) |
| `fadeUp` | Headline, copy, CTA | Fade up on load, staggered |
| `navFade` | Top/bottom nav | Fade in on load |
| `shimmer` | "Found here." text | Gradient background animation |
| `blink` | Status dot | Pulse animation (2s cycle) |

## Event Card Design

```
┌────────────────────────────────────────┐
│ ● CONFERENCE                   Mar 15  │
│ BSides Los Angeles 2026                │
│ 📍 Los Angeles, CA                     │
└────────────────────────────────────────┘
```

- Type badge with color-coded dot
- Event name
- City
- Hover: slight scale + border color change
- No click action on homepage (preview only)

### Type Colors
- Conference: `#ff6b35`
- Meetup: `#00d4aa`
- Chapter: `#a78bfa`
- Virtual: `#f472b6`

## Typography

- Headings: Outfit (800 weight)
- Body: Outfit (400-500 weight)
- Mono/badges: JetBrains Mono

## Technical Notes

- 3D scene: existing `Bunker.jsx` code
- Content overlay: new component layered on top
- Use react-router-dom `Link` for navigation
- Subscribe panel: local state toggle, CSS transition for slide
- Beehiiv integration: form POST to their endpoint

## Out of Scope for Homepage

- Email input directly on homepage (moved to slide-in panel)
- Scrolling
- Event card click navigation
- User accounts/login
