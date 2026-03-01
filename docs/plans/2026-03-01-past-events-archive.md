# Past Events Archive Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Create a SEO-friendly archive page for past events, linked from the footer only.

**Architecture:** New route `/events/archive` with its own page component. Reuses existing EventList, EventCard, and EventDetailDrawer components. Events grouped by month (e.g., "February 2026") in reverse chronological order. Footer gets a "Past Events" link.

**Tech Stack:** React, React Router, existing component library

---

### Task 1: Create PastEvents Page Component

**Files:**
- Create: `src/pages/PastEvents.jsx`

**Step 1: Create the page component**

```jsx
import { useState } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../components/Layout'
import EventList from '../components/EventList'
import EventDetailDrawer from '../components/EventDetailDrawer'
import events from '../data/events.json'

function groupEventsByMonth(events) {
  const groups = {}

  events.forEach(event => {
    const date = new Date(event.date)
    const label = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    const sortKey = date.getTime()

    if (!groups[label]) {
      groups[label] = { sortKey, events: [] }
    }
    groups[label].events.push(event)
  })

  // Sort by most recent month first, events within month by most recent first
  return Object.entries(groups)
    .sort(([, a], [, b]) => b.sortKey - a.sortKey)
    .map(([label, { events }]) => ({
      label,
      events: events.sort((a, b) => new Date(b.date) - new Date(a.date))
    }))
}

export default function PastEvents() {
  const [selectedEvent, setSelectedEvent] = useState(null)

  // Filter to only past events
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const pastEvents = events
    .filter(event => new Date(event.date) < today)
    .sort((a, b) => new Date(b.date) - new Date(a.date))

  const groupedEvents = groupEventsByMonth(pastEvents)

  return (
    <Layout>
      <div
        style={{
          maxWidth: '800px',
          margin: '0 auto',
          padding: '40px 20px'
        }}
      >
        {/* Back Link */}
        <Link
          to="/events"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            color: 'rgba(255,255,255,0.5)',
            textDecoration: 'none',
            fontSize: '14px',
            fontFamily: "'Outfit', sans-serif",
            marginBottom: '24px'
          }}
        >
          ← Back to Upcoming Events
        </Link>

        {/* Page Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1
            style={{
              fontSize: '36px',
              fontWeight: 700,
              color: 'white',
              margin: 0,
              fontFamily: "'Outfit', sans-serif"
            }}
          >
            Past Events
          </h1>
          <p
            style={{
              fontSize: '16px',
              color: 'rgba(255,255,255,0.6)',
              margin: '8px 0 0 0',
              fontFamily: "'Outfit', sans-serif"
            }}
          >
            Archive of previous cybersecurity events
          </p>
          <p
            style={{
              fontSize: '14px',
              color: 'rgba(255,255,255,0.4)',
              margin: '8px 0 0 0',
              fontFamily: "'Outfit', sans-serif"
            }}
          >
            {pastEvents.length} events
          </p>
        </div>

        {/* Event List Grouped by Month */}
        {groupedEvents.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '48px 0',
              color: 'rgba(255,255,255,0.5)'
            }}
          >
            No past events yet.
          </div>
        ) : (
          groupedEvents.map(group => (
            <div key={group.label} style={{ marginBottom: 32 }}>
              <h3
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: 'rgba(255,255,255,0.5)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: 16
                }}
              >
                {group.label}
              </h3>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 16
                }}
              >
                {group.events.map(event => (
                  <EventCard
                    key={event.slug}
                    event={event}
                    onClick={setSelectedEvent}
                  />
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Event Detail Drawer */}
      <EventDetailDrawer
        event={selectedEvent}
        events={pastEvents}
        isOpen={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
        onNavigate={setSelectedEvent}
      />
    </Layout>
  )
}
```

**Step 2: Add missing import**

The component above is missing the EventCard import. Add at top:

```jsx
import EventCard from '../components/EventCard'
```

**Step 3: Verify file created correctly**

Run: `cat src/pages/PastEvents.jsx | head -20`
Expected: File shows imports and component start

**Step 4: Commit**

```bash
git add src/pages/PastEvents.jsx
git commit -m "feat: add PastEvents archive page component"
```

---

### Task 2: Add Route for Past Events

**Files:**
- Modify: `src/App.jsx`

**Step 1: Import PastEvents component**

Add after line 5 (`import SubmitEvent from './pages/SubmitEvent'`):

```jsx
import PastEvents from './pages/PastEvents'
```

**Step 2: Add route**

Add after the `/submit` route (line 16):

```jsx
<Route path="/events/archive" element={<PastEvents />} />
```

**Step 3: Verify build**

Run: `npm run build`
Expected: Build succeeds with no errors

**Step 4: Commit**

```bash
git add src/App.jsx
git commit -m "feat: add /events/archive route"
```

---

### Task 3: Add Footer Link to Past Events

**Files:**
- Modify: `src/components/Layout.jsx`

**Step 1: Find the footer section**

The footer is around line 148-220. Look for the "Submit An Event" link.

**Step 2: Add Past Events link after Submit An Event**

Find this section (around line 174-185):

```jsx
<Link
  to="/submit"
  style={{
    fontFamily: "'Outfit', sans-serif",
    fontSize: '12px',
    color: 'white',
    textDecoration: 'none'
  }}
>
  Submit An Event
</Link>
```

Add after it:

```jsx
<Link
  to="/events/archive"
  style={{
    fontFamily: "'Outfit', sans-serif",
    fontSize: '12px',
    color: 'rgba(255,255,255,0.5)',
    textDecoration: 'none'
  }}
>
  Past Events
</Link>
```

**Step 3: Verify build**

Run: `npm run build`
Expected: Build succeeds

**Step 4: Commit**

```bash
git add src/components/Layout.jsx
git commit -m "feat: add Past Events link to footer"
```

---

### Task 4: Verify End-to-End

**Step 1: Start dev server**

Run: `npm run dev`

**Step 2: Test the archive page**

1. Visit http://localhost:5175/events/archive
2. Verify page shows "Past Events" header
3. Verify events are grouped by month (most recent month first)
4. Click an event - drawer should open
5. Use up/down arrows to navigate between past events
6. Click RSVP - should open external URL

**Step 3: Test footer link**

1. Visit http://localhost:5175/events
2. Scroll to footer
3. Find "Past Events" link
4. Click it - should navigate to /events/archive

**Step 4: Test back link**

1. On /events/archive, click "← Back to Upcoming Events"
2. Should navigate to /events

**Step 5: Final commit**

```bash
git add -A
git commit -m "feat: complete past events archive implementation"
```

---

## Verification Checklist

- [ ] `/events/archive` route works
- [ ] Past events displayed (events with date < today)
- [ ] Grouped by month, most recent first
- [ ] Event drawer works with navigation
- [ ] Footer has "Past Events" link
- [ ] "Back to Upcoming Events" link works
- [ ] Build succeeds with no errors
