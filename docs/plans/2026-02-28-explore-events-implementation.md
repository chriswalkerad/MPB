# Explore Events Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build the Explore Events page with category navigation, filters, and date-grouped event listings.

**Architecture:** Shared Layout component with global nav (including location selector). ExploreEvents page shows category grid + event list. CategoryPage shows filtered events. Both use shared EventCard and EventList components. Location state stored in localStorage with IP-based auto-detection.

**Tech Stack:** React, react-router-dom, CSS-in-JS (inline styles), IP geolocation API (ip-api.com or similar)

---

## Task 1: Update Events Data Model

**Files:**
- Modify: `src/data/events.json`

**Step 1:** Update events.json with full data model including new fields (`format`, `region`, `tags`, `url`, `cost`, `image`, ISO dates).

```json
[
  {
    "name": "BSides Los Angeles 2026",
    "slug": "bsides-la-2026",
    "image": null,
    "date": "2026-03-15T09:00:00-07:00",
    "endDate": "2026-03-15T17:00:00-07:00",
    "type": "conference",
    "format": "in-person",
    "city": "Los Angeles, CA",
    "region": "west-coast",
    "cost": "Free",
    "tags": ["Community & General", "Threat Intelligence"],
    "url": "https://bsidesla.org",
    "description": "LA's premier community security conference."
  },
  {
    "name": "OWASP SoCal Monthly",
    "slug": "owasp-socal-monthly",
    "image": null,
    "date": "2026-03-04T18:00:00-08:00",
    "endDate": "2026-03-04T20:00:00-08:00",
    "type": "meetup",
    "format": "in-person",
    "city": "Irvine, CA",
    "region": "west-coast",
    "cost": "Free",
    "tags": ["Community & General", "AppSec & DevSecOps"],
    "url": "https://owasp.org/socal",
    "description": "Monthly OWASP chapter meeting."
  },
  {
    "name": "ISSA LA Chapter Meeting",
    "slug": "issa-la-chapter",
    "image": null,
    "date": "2026-03-11T17:30:00-07:00",
    "endDate": "2026-03-11T19:30:00-07:00",
    "type": "chapter",
    "format": "in-person",
    "city": "Los Angeles, CA",
    "region": "west-coast",
    "cost": "Free",
    "tags": ["Community & General", "Networking & Career"],
    "url": "https://issa-la.org",
    "description": "Monthly ISSA Los Angeles chapter meeting."
  },
  {
    "name": "SecureWorld San Diego",
    "slug": "secureworld-san-diego",
    "image": null,
    "date": "2026-03-19T08:00:00-07:00",
    "endDate": "2026-03-20T17:00:00-07:00",
    "type": "conference",
    "format": "in-person",
    "city": "San Diego, CA",
    "region": "west-coast",
    "cost": "$150",
    "tags": ["Compliance & GRC", "Networking & Career"],
    "url": "https://secureworldexpo.com/san-diego",
    "description": "Regional cybersecurity conference."
  },
  {
    "name": "DEF CON Group 562",
    "slug": "defcon-562",
    "image": null,
    "date": "2026-03-07T19:00:00-08:00",
    "endDate": "2026-03-07T22:00:00-08:00",
    "type": "meetup",
    "format": "in-person",
    "city": "Long Beach, CA",
    "region": "west-coast",
    "cost": "Free",
    "tags": ["Community & General"],
    "url": "https://dc562.org",
    "description": "Local DEF CON group meetup."
  },
  {
    "name": "HIPAA Security Summit",
    "slug": "hipaa-security-summit",
    "image": null,
    "date": "2026-04-07T09:00:00-07:00",
    "endDate": "2026-04-10T17:00:00-07:00",
    "type": "conference",
    "format": "virtual",
    "city": "Online",
    "region": "virtual",
    "cost": "$299",
    "tags": ["Compliance & GRC"],
    "url": "https://hipaasummit.com",
    "description": "Virtual healthcare security conference."
  },
  {
    "name": "AI Security Workshop",
    "slug": "ai-security-workshop",
    "image": null,
    "date": "2026-03-22T10:00:00-07:00",
    "endDate": "2026-03-22T16:00:00-07:00",
    "type": "workshop",
    "format": "in-person",
    "city": "San Francisco, CA",
    "region": "west-coast",
    "cost": "$75",
    "tags": ["AI & Machine Learning", "AppSec & DevSecOps"],
    "url": "https://example.com/ai-workshop",
    "description": "Hands-on AI security workshop."
  },
  {
    "name": "Cloud Security Webinar",
    "slug": "cloud-security-webinar",
    "image": null,
    "date": "2026-03-12T11:00:00-07:00",
    "endDate": "2026-03-12T12:00:00-07:00",
    "type": "webinar",
    "format": "virtual",
    "city": "Online",
    "region": "virtual",
    "cost": "Free",
    "tags": ["Cloud Security"],
    "url": "https://example.com/cloud-webinar",
    "description": "AWS security best practices."
  }
]
```

**Step 2:** Commit.

```bash
git add src/data/events.json
git commit -m "feat: update events data model with format, region, tags"
```

---

## Task 2: Create Categories Data

**Files:**
- Create: `src/data/categories.json`

**Step 1:** Create categories data file.

```json
[
  {
    "name": "Community & General",
    "slug": "community-general",
    "description": "BSides, DEF CON Groups, ISSA/ISACA/ISC2 chapters, general infosec meetups"
  },
  {
    "name": "AI & Machine Learning",
    "slug": "ai-ml",
    "description": "AI security, ML threats, LLM security, AI governance"
  },
  {
    "name": "Compliance & GRC",
    "slug": "compliance-grc",
    "description": "HIPAA, CMMC, SOC 2, PCI-DSS, ISO 27001, cyber insurance"
  },
  {
    "name": "Cloud Security",
    "slug": "cloud-security",
    "description": "AWS/Azure/GCP security, cloud-native, CNAPP, CSPM"
  },
  {
    "name": "MSP & Channel",
    "slug": "msp-channel",
    "description": "IT Nation, DattoCon, Pax8 Beyond, MSP-focused events"
  },
  {
    "name": "Threat Intelligence",
    "slug": "threat-intel",
    "description": "Threat briefings, CTI sharing, MITRE ATT&CK"
  },
  {
    "name": "Incident Response",
    "slug": "incident-response",
    "description": "IR planning, tabletop exercises, forensics"
  },
  {
    "name": "Identity & Access",
    "slug": "identity-access",
    "description": "Zero trust, MFA, IAM, SSO, privileged access"
  },
  {
    "name": "Security Awareness",
    "slug": "security-awareness",
    "description": "SAT events, phishing education, human risk"
  },
  {
    "name": "AppSec & DevSecOps",
    "slug": "appsec-devsecops",
    "description": "Application security, secure coding, SAST/DAST"
  },
  {
    "name": "Networking & Career",
    "slug": "networking-career",
    "description": "Career events, hiring fairs, CISO roundtables"
  }
]
```

**Step 2:** Commit.

```bash
git add src/data/categories.json
git commit -m "feat: add categories data"
```

---

## Task 3: Create Location Context

**Files:**
- Create: `src/context/LocationContext.jsx`

**Step 1:** Create location context with IP detection and localStorage persistence.

```jsx
import { createContext, useContext, useEffect, useState } from 'react'

const LocationContext = createContext()

const REGIONS = {
  'west-coast': ['Los Angeles', 'San Francisco', 'San Diego', 'Seattle', 'Portland'],
  'southwest': ['Phoenix', 'Las Vegas', 'Denver'],
  'midwest': ['Chicago', 'Dallas', 'Houston', 'Austin', 'Minneapolis'],
  'southeast': ['Miami', 'Atlanta', 'Tampa', 'Charlotte', 'Nashville'],
  'northeast': ['New York', 'Boston', 'Philadelphia', 'Washington']
}

// Map cities to regions for IP detection
const CITY_TO_REGION = {}
Object.entries(REGIONS).forEach(([region, cities]) => {
  cities.forEach(city => {
    CITY_TO_REGION[city.toLowerCase()] = region
  })
})

export function LocationProvider({ children }) {
  const [location, setLocation] = useState(() => {
    const stored = localStorage.getItem('mpb-location')
    return stored ? JSON.parse(stored) : { region: 'all', city: null, label: 'All Locations' }
  })
  const [loading, setLoading] = useState(false)

  // Auto-detect on first visit
  useEffect(() => {
    const hasVisited = localStorage.getItem('mpb-location')
    if (hasVisited) return

    setLoading(true)
    fetch('https://ip-api.com/json/')
      .then(res => res.json())
      .then(data => {
        const detectedCity = data.city?.toLowerCase()
        const region = CITY_TO_REGION[detectedCity] || 'all'
        const newLocation = region !== 'all'
          ? { region, city: data.city, label: data.city }
          : { region: 'all', city: null, label: 'All Locations' }
        setLocation(newLocation)
        localStorage.setItem('mpb-location', JSON.stringify(newLocation))
      })
      .catch(() => {
        // Fallback to all locations
        const fallback = { region: 'all', city: null, label: 'All Locations' }
        setLocation(fallback)
        localStorage.setItem('mpb-location', JSON.stringify(fallback))
      })
      .finally(() => setLoading(false))
  }, [])

  const updateLocation = (newLocation) => {
    setLocation(newLocation)
    localStorage.setItem('mpb-location', JSON.stringify(newLocation))
  }

  return (
    <LocationContext.Provider value={{ location, updateLocation, loading, REGIONS }}>
      {children}
    </LocationContext.Provider>
  )
}

export function useLocation() {
  const context = useContext(LocationContext)
  if (!context) {
    throw new Error('useLocation must be used within LocationProvider')
  }
  return context
}
```

**Step 2:** Commit.

```bash
git add src/context/LocationContext.jsx
git commit -m "feat: add location context with IP detection"
```

---

## Task 4: Create Shared Layout Component

**Files:**
- Create: `src/components/Layout.jsx`

**Step 1:** Create Layout with global nav including location selector.

```jsx
import { useState } from 'react'
import { Link, useLocation as useRouterLocation } from 'react-router-dom'
import { useLocation } from '../context/LocationContext'
import SubscribePanel from './SubscribePanel'
import LocationSelector from './LocationSelector'

export default function Layout({ children, showBackground = false }) {
  const [subscribeOpen, setSubscribeOpen] = useState(false)
  const [logoHovered, setLogoHovered] = useState(false)
  const routerLocation = useRouterLocation()
  const isEventsPage = routerLocation.pathname.startsWith('/events')

  return (
    <div style={{
      minHeight: '100vh',
      background: '#000',
      position: 'relative'
    }}>
      {/* Red gradient at top */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '150px',
        background: 'radial-gradient(ellipse at top, rgba(255,0,0,0.15) 0%, transparent 70%)',
        pointerEvents: 'none',
        zIndex: 0
      }} />

      {/* Top Nav */}
      <nav style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: 60,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 40px',
        zIndex: 100,
        background: 'rgba(0,0,0,0.8)',
        backdropFilter: 'blur(10px)'
      }}>
        {/* Left: Logo + Location */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <Link
            to="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              textDecoration: 'none'
            }}
            onMouseEnter={() => setLogoHovered(true)}
            onMouseLeave={() => setLogoHovered(false)}
          >
            <img src="/logo.png" alt="MPB" style={{ width: '28px', height: '28px', objectFit: 'contain' }} />
            <span style={{
              fontFamily: "'Outfit', sans-serif",
              fontWeight: 600,
              fontSize: '22px',
              color: 'rgba(255,255,255,0.9)',
              letterSpacing: '-0.02em',
              lineHeight: 1,
              display: 'inline-grid',
              whiteSpace: 'nowrap'
            }}>
              <span style={{
                gridArea: '1 / 1',
                transition: 'opacity 0.3s ease',
                opacity: logoHovered ? 0 : 1
              }}>/MPB</span>
              <span style={{
                gridArea: '1 / 1',
                transition: 'opacity 0.3s ease',
                opacity: logoHovered ? 1 : 0
              }}>/My Printer Broke</span>
            </span>
          </Link>

          <LocationSelector />
        </div>

        {/* Right: Nav links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <button
            onClick={() => setSubscribeOpen(true)}
            style={{
              background: 'none',
              border: 'none',
              color: 'rgba(255,255,255,0.6)',
              fontSize: '14px',
              fontWeight: 500,
              fontFamily: "'Outfit', sans-serif",
              cursor: 'pointer',
              transition: 'color 0.2s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'rgba(255,255,255,1)'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}
          >
            Subscribe
          </button>
          <Link
            to="/events"
            style={{
              color: isEventsPage ? 'rgba(255,255,255,1)' : 'rgba(255,255,255,0.6)',
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: 500,
              fontFamily: "'Outfit', sans-serif",
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              transition: 'color 0.2s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'rgba(255,255,255,1)'}
            onMouseLeave={(e) => {
              if (!isEventsPage) e.currentTarget.style.color = 'rgba(255,255,255,0.6)'
            }}
          >
            Explore Events
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <main style={{ paddingTop: 60 }}>
        {children}
      </main>

      {/* Bottom Nav */}
      <nav style={{
        padding: '20px 40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <img src="/logo.png" alt="MPB" style={{ width: '20px', height: '20px', objectFit: 'contain' }} />
            <span style={{
              fontFamily: "'Outfit', sans-serif",
              fontWeight: 600,
              fontSize: '12px',
              color: 'rgba(255,255,255,0.4)'
            }}>/MPB</span>
          </div>
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
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" style={{ color: 'white' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
            </svg>
          </a>
          <a href="https://x.com" target="_blank" rel="noopener noreferrer" style={{ color: 'white' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </a>
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" style={{ color: 'white' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
            </svg>
          </a>
        </div>
      </nav>

      <SubscribePanel isOpen={subscribeOpen} onClose={() => setSubscribeOpen(false)} />
    </div>
  )
}
```

**Step 2:** Commit.

```bash
git add src/components/Layout.jsx
git commit -m "feat: add shared Layout component with global nav"
```

---

## Task 5: Create Location Selector Component

**Files:**
- Create: `src/components/LocationSelector.jsx`

**Step 1:** Create dropdown location selector.

```jsx
import { useState, useRef, useEffect } from 'react'
import { useLocation } from '../context/LocationContext'

export default function LocationSelector() {
  const { location, updateLocation, REGIONS } = useLocation()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  // Close on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const selectLocation = (region, city = null) => {
    const label = city || (region === 'all' ? 'All Locations' : region === 'virtual' ? 'Virtual' : region.split('-').map(w => w[0].toUpperCase() + w.slice(1)).join(' '))
    updateLocation({ region, city, label })
    setOpen(false)
  }

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          background: 'none',
          border: '1px solid rgba(255,255,255,0.2)',
          borderRadius: '6px',
          padding: '6px 12px',
          color: 'white',
          fontSize: '14px',
          fontFamily: "'Outfit', sans-serif",
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}
      >
        {location.label}
        <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" style={{ opacity: 0.6 }}>
          <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" fill="none" />
        </svg>
      </button>

      {open && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          marginTop: '8px',
          background: 'rgba(20,20,20,0.98)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '8px',
          padding: '8px 0',
          minWidth: '200px',
          maxHeight: '400px',
          overflowY: 'auto',
          zIndex: 1000
        }}>
          <button
            onClick={() => selectLocation('all')}
            style={{
              display: 'block',
              width: '100%',
              padding: '8px 16px',
              background: location.region === 'all' ? 'rgba(255,255,255,0.1)' : 'none',
              border: 'none',
              color: 'white',
              fontSize: '14px',
              fontFamily: "'Outfit', sans-serif",
              textAlign: 'left',
              cursor: 'pointer'
            }}
          >
            All Locations
          </button>

          <button
            onClick={() => selectLocation('virtual')}
            style={{
              display: 'block',
              width: '100%',
              padding: '8px 16px',
              background: location.region === 'virtual' ? 'rgba(255,255,255,0.1)' : 'none',
              border: 'none',
              color: 'white',
              fontSize: '14px',
              fontFamily: "'Outfit', sans-serif",
              textAlign: 'left',
              cursor: 'pointer'
            }}
          >
            Virtual
          </button>

          <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', margin: '8px 0' }} />

          {Object.entries(REGIONS).map(([regionKey, cities]) => (
            <div key={regionKey}>
              <div style={{
                padding: '8px 16px',
                color: 'rgba(255,255,255,0.5)',
                fontSize: '12px',
                fontFamily: "'Outfit', sans-serif",
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                {regionKey.split('-').map(w => w[0].toUpperCase() + w.slice(1)).join(' ')}
              </div>
              {cities.map(city => (
                <button
                  key={city}
                  onClick={() => selectLocation(regionKey, city)}
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '6px 16px 6px 24px',
                    background: location.city === city ? 'rgba(255,255,255,0.1)' : 'none',
                    border: 'none',
                    color: 'white',
                    fontSize: '14px',
                    fontFamily: "'Outfit', sans-serif",
                    textAlign: 'left',
                    cursor: 'pointer'
                  }}
                >
                  {city}
                </button>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
```

**Step 2:** Commit.

```bash
git add src/components/LocationSelector.jsx
git commit -m "feat: add LocationSelector dropdown component"
```

---

## Task 6: Create EventCard Component

**Files:**
- Create: `src/components/EventCard.jsx`

**Step 1:** Create horizontal event card component.

```jsx
const TYPE_COLORS = {
  conference: '#ff6b35',
  meetup: '#00d4aa',
  chapter: '#a78bfa',
  workshop: '#facc15',
  webinar: '#38bdf8',
  ctf: '#f472b6'
}

const TYPE_ICONS = {
  conference: '🎤',
  meetup: '👥',
  chapter: '🏛️',
  workshop: '🛠️',
  webinar: '💻',
  ctf: '🚩'
}

function formatDate(dateStr, endDateStr) {
  const date = new Date(dateStr)
  const endDate = endDateStr ? new Date(endDateStr) : null

  const dateOpts = { month: 'short', day: 'numeric' }
  const timeOpts = { hour: 'numeric', minute: '2-digit' }

  const dateFormatted = date.toLocaleDateString('en-US', dateOpts)
  const timeFormatted = date.toLocaleTimeString('en-US', timeOpts)

  if (endDate && endDate.toDateString() !== date.toDateString()) {
    const endDateFormatted = endDate.toLocaleDateString('en-US', dateOpts)
    return `${dateFormatted} – ${endDateFormatted}`
  }

  const endTimeFormatted = endDate ? endDate.toLocaleTimeString('en-US', timeOpts) : null
  return `${dateFormatted} · ${timeFormatted}${endTimeFormatted ? ` – ${endTimeFormatted}` : ''}`
}

export default function EventCard({ event }) {
  const isExternal = event.url?.startsWith('http')
  const color = TYPE_COLORS[event.type] || '#fff'

  const handleClick = () => {
    if (isExternal) {
      window.open(event.url, '_blank', 'noopener,noreferrer')
    } else {
      window.location.href = event.url || `/events/${event.slug}`
    }
  }

  return (
    <div
      onClick={handleClick}
      style={{
        display: 'flex',
        gap: '16px',
        padding: '16px',
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '12px',
        cursor: 'pointer',
        transition: 'all 0.2s ease'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'rgba(255,255,255,0.06)'
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'
        e.currentTarget.style.transform = 'translateY(-2px)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'rgba(255,255,255,0.03)'
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'
        e.currentTarget.style.transform = 'translateY(0)'
      }}
    >
      {/* Image */}
      <div style={{
        width: '100px',
        height: '100px',
        flexShrink: 0,
        borderRadius: '8px',
        background: event.image ? `url(${event.image}) center/cover` : 'rgba(255,255,255,0.05)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '32px'
      }}>
        {!event.image && TYPE_ICONS[event.type]}
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
          <h3 style={{
            margin: 0,
            fontSize: '16px',
            fontWeight: 600,
            color: 'white',
            fontFamily: "'Outfit', sans-serif",
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical'
          }}>
            {event.name}
          </h3>
          {isExternal && (
            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px', flexShrink: 0 }}>↗</span>
          )}
        </div>

        <div style={{
          marginTop: '6px',
          fontSize: '13px',
          color: 'rgba(255,255,255,0.6)',
          fontFamily: "'Outfit', sans-serif"
        }}>
          📅 {formatDate(event.date, event.endDate)}
        </div>

        <div style={{
          marginTop: '4px',
          fontSize: '13px',
          color: 'rgba(255,255,255,0.6)',
          fontFamily: "'Outfit', sans-serif"
        }}>
          📍 {event.city}
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '10px' }}>
          <span style={{
            padding: '3px 8px',
            borderRadius: '4px',
            fontSize: '11px',
            fontWeight: 500,
            background: `${color}20`,
            color: color,
            fontFamily: "'JetBrains Mono', monospace",
            textTransform: 'capitalize'
          }}>
            {event.type}
          </span>
          <span style={{
            padding: '3px 8px',
            borderRadius: '4px',
            fontSize: '11px',
            fontWeight: 500,
            background: 'rgba(255,255,255,0.1)',
            color: 'rgba(255,255,255,0.7)',
            fontFamily: "'JetBrains Mono', monospace",
            textTransform: 'capitalize'
          }}>
            {event.format?.replace('-', ' ')}
          </span>
          <span style={{
            padding: '3px 8px',
            borderRadius: '4px',
            fontSize: '11px',
            fontWeight: 500,
            background: event.cost === 'Free' ? 'rgba(0,212,170,0.2)' : 'rgba(255,255,255,0.1)',
            color: event.cost === 'Free' ? '#00d4aa' : 'rgba(255,255,255,0.7)',
            fontFamily: "'JetBrains Mono', monospace"
          }}>
            {event.cost}
          </span>
        </div>

        {event.tags && event.tags.length > 0 && (
          <div style={{
            marginTop: '8px',
            fontSize: '11px',
            color: 'rgba(255,255,255,0.4)',
            fontFamily: "'Outfit', sans-serif"
          }}>
            {event.tags.join(' · ')}
          </div>
        )}
      </div>
    </div>
  )
}
```

**Step 2:** Commit.

```bash
git add src/components/EventCard.jsx
git commit -m "feat: add EventCard component"
```

---

## Task 7: Create CategoryCard Component

**Files:**
- Create: `src/components/CategoryCard.jsx`

**Step 1:** Create category card for the grid.

```jsx
import { Link } from 'react-router-dom'

export default function CategoryCard({ category, eventCount }) {
  return (
    <Link
      to={`/events/category/${category.slug}`}
      style={{
        display: 'block',
        padding: '16px',
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '10px',
        textDecoration: 'none',
        transition: 'all 0.2s ease'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'rgba(255,255,255,0.06)'
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'rgba(255,255,255,0.03)'
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'
      }}
    >
      <div style={{
        fontSize: '15px',
        fontWeight: 600,
        color: 'white',
        fontFamily: "'Outfit', sans-serif",
        marginBottom: '4px'
      }}>
        {category.name}
      </div>
      <div style={{
        fontSize: '13px',
        color: 'rgba(255,255,255,0.5)',
        fontFamily: "'Outfit', sans-serif"
      }}>
        {eventCount} Events
      </div>
    </Link>
  )
}
```

**Step 2:** Commit.

```bash
git add src/components/CategoryCard.jsx
git commit -m "feat: add CategoryCard component"
```

---

## Task 8: Create EventList Component

**Files:**
- Create: `src/components/EventList.jsx`

**Step 1:** Create date-grouped event list.

```jsx
import EventCard from './EventCard'

function groupEventsByDate(events) {
  const groups = {}
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  events.forEach(event => {
    const eventDate = new Date(event.date)
    eventDate.setHours(0, 0, 0, 0)

    let label
    if (eventDate.getTime() === today.getTime()) {
      label = 'Today'
    } else if (eventDate.getTime() === tomorrow.getTime()) {
      label = 'Tomorrow'
    } else {
      const opts = { weekday: 'long', month: 'short', day: 'numeric' }
      label = eventDate.toLocaleDateString('en-US', opts)
    }

    if (!groups[label]) {
      groups[label] = { date: eventDate, events: [] }
    }
    groups[label].events.push(event)
  })

  return Object.entries(groups)
    .sort(([, a], [, b]) => a.date - b.date)
    .map(([label, { events }]) => ({ label, events }))
}

export default function EventList({ events }) {
  if (!events || events.length === 0) {
    return (
      <div style={{
        padding: '60px 20px',
        textAlign: 'center',
        color: 'rgba(255,255,255,0.5)',
        fontFamily: "'Outfit', sans-serif"
      }}>
        <p style={{ fontSize: '16px', marginBottom: '8px' }}>No events match your filters.</p>
        <p style={{ fontSize: '14px' }}>Try broadening your search.</p>
      </div>
    )
  }

  const grouped = groupEventsByDate(events)

  return (
    <div>
      {grouped.map(({ label, events }) => (
        <div key={label} style={{ marginBottom: '32px' }}>
          <h3 style={{
            fontSize: '14px',
            fontWeight: 600,
            color: 'rgba(255,255,255,0.5)',
            fontFamily: "'Outfit', sans-serif",
            marginBottom: '16px',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            {label}
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
            gap: '16px'
          }}>
            {events.map(event => (
              <EventCard key={event.slug} event={event} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
```

**Step 2:** Commit.

```bash
git add src/components/EventList.jsx
git commit -m "feat: add EventList component with date grouping"
```

---

## Task 9: Create Filters Component

**Files:**
- Create: `src/components/EventFilters.jsx`

**Step 1:** Create format tabs and event type dropdown.

```jsx
import { useState, useRef, useEffect } from 'react'

const EVENT_TYPES = [
  { value: 'all', label: 'All Types' },
  { value: 'conference', label: 'Conference' },
  { value: 'meetup', label: 'Meetup' },
  { value: 'workshop', label: 'Workshop' },
  { value: 'webinar', label: 'Webinar' },
  { value: 'chapter', label: 'Chapter Meeting' },
  { value: 'ctf', label: 'CTF & Hackathon' }
]

export default function EventFilters({ format, onFormatChange, type, onTypeChange }) {
  const [typeOpen, setTypeOpen] = useState(false)
  const typeRef = useRef(null)

  useEffect(() => {
    const handleClick = (e) => {
      if (typeRef.current && !typeRef.current.contains(e.target)) {
        setTypeOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const selectedType = EVENT_TYPES.find(t => t.value === type) || EVENT_TYPES[0]

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: '16px',
      padding: '16px 0',
      borderBottom: '1px solid rgba(255,255,255,0.08)'
    }}>
      {/* Format Tabs */}
      <div style={{ display: 'flex', gap: '24px' }}>
        {['all', 'in-person', 'virtual'].map(f => (
          <button
            key={f}
            onClick={() => onFormatChange(f)}
            style={{
              background: 'none',
              border: 'none',
              padding: '8px 0',
              fontSize: '14px',
              fontWeight: 500,
              fontFamily: "'Outfit', sans-serif",
              color: format === f ? 'white' : 'rgba(255,255,255,0.5)',
              cursor: 'pointer',
              borderBottom: format === f ? '2px solid white' : '2px solid transparent',
              transition: 'all 0.2s ease'
            }}
          >
            {f === 'all' ? 'All' : f === 'in-person' ? 'In-Person' : 'Virtual'}
          </button>
        ))}
      </div>

      {/* Event Type Dropdown */}
      <div ref={typeRef} style={{ position: 'relative' }}>
        <button
          onClick={() => setTypeOpen(!typeOpen)}
          style={{
            background: 'none',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '6px',
            padding: '8px 12px',
            color: 'white',
            fontSize: '14px',
            fontFamily: "'Outfit', sans-serif",
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          {selectedType.label}
          <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" style={{ opacity: 0.6 }}>
            <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" fill="none" />
          </svg>
        </button>

        {typeOpen && (
          <div style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            marginTop: '8px',
            background: 'rgba(20,20,20,0.98)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '8px',
            padding: '8px 0',
            minWidth: '160px',
            zIndex: 100
          }}>
            {EVENT_TYPES.map(t => (
              <button
                key={t.value}
                onClick={() => {
                  onTypeChange(t.value)
                  setTypeOpen(false)
                }}
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '8px 16px',
                  background: type === t.value ? 'rgba(255,255,255,0.1)' : 'none',
                  border: 'none',
                  color: 'white',
                  fontSize: '14px',
                  fontFamily: "'Outfit', sans-serif",
                  textAlign: 'left',
                  cursor: 'pointer'
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
```

**Step 2:** Commit.

```bash
git add src/components/EventFilters.jsx
git commit -m "feat: add EventFilters component"
```

---

## Task 10: Create ExploreEvents Page

**Files:**
- Create: `src/pages/ExploreEvents.jsx`

**Step 1:** Create main explore events page.

```jsx
import { useState, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import Layout from '../components/Layout'
import EventFilters from '../components/EventFilters'
import EventList from '../components/EventList'
import CategoryCard from '../components/CategoryCard'
import { useLocation } from '../context/LocationContext'
import events from '../data/events.json'
import categories from '../data/categories.json'

function countEventsForCategory(events, categoryName) {
  return events.filter(e => e.tags?.includes(categoryName)).length
}

export default function ExploreEvents() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { location } = useLocation()

  const format = searchParams.get('format') || 'all'
  const type = searchParams.get('type') || 'all'

  const setFormat = (f) => {
    const params = new URLSearchParams(searchParams)
    if (f === 'all') params.delete('format')
    else params.set('format', f)
    setSearchParams(params)
  }

  const setType = (t) => {
    const params = new URLSearchParams(searchParams)
    if (t === 'all') params.delete('type')
    else params.set('type', t)
    setSearchParams(params)
  }

  const filteredEvents = useMemo(() => {
    return events
      .filter(e => {
        // Format filter
        if (format !== 'all') {
          if (format === 'in-person' && e.format !== 'in-person' && e.format !== 'hybrid') return false
          if (format === 'virtual' && e.format !== 'virtual' && e.format !== 'hybrid') return false
        }
        // Type filter
        if (type !== 'all' && e.type !== type) return false
        // Location filter
        if (location.region !== 'all') {
          if (location.region === 'virtual' && e.format !== 'virtual') return false
          if (location.region !== 'virtual' && e.region !== location.region) return false
          if (location.city && !e.city?.toLowerCase().includes(location.city.toLowerCase())) return false
        }
        // Only future events
        if (new Date(e.date) < new Date()) return false
        return true
      })
      .sort((a, b) => new Date(a.date) - new Date(b.date))
  }, [events, format, type, location])

  return (
    <Layout>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{
            fontSize: '36px',
            fontWeight: 700,
            color: 'white',
            fontFamily: "'Outfit', sans-serif",
            margin: 0
          }}>
            Explore Events
          </h1>
          <p style={{
            fontSize: '16px',
            color: 'rgba(255,255,255,0.6)',
            fontFamily: "'Outfit', sans-serif",
            margin: '8px 0 0'
          }}>
            Conferences, meetups, and workshops — sorted by what's happening next.
          </p>
        </div>

        {/* Filters */}
        <EventFilters
          format={format}
          onFormatChange={setFormat}
          type={type}
          onTypeChange={setType}
        />

        {/* Categories Grid */}
        <div style={{ margin: '32px 0' }}>
          <h2 style={{
            fontSize: '14px',
            fontWeight: 600,
            color: 'rgba(255,255,255,0.5)',
            fontFamily: "'Outfit', sans-serif",
            marginBottom: '16px',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            Browse by Category
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
            gap: '12px'
          }}>
            {categories.map(cat => (
              <CategoryCard
                key={cat.slug}
                category={cat}
                eventCount={countEventsForCategory(filteredEvents, cat.name)}
              />
            ))}
          </div>
        </div>

        {/* Event List */}
        <EventList events={filteredEvents} />
      </div>
    </Layout>
  )
}
```

**Step 2:** Commit.

```bash
git add src/pages/ExploreEvents.jsx
git commit -m "feat: add ExploreEvents page"
```

---

## Task 11: Create CategoryPage

**Files:**
- Create: `src/pages/CategoryPage.jsx`

**Step 1:** Create category events page.

```jsx
import { useMemo } from 'react'
import { useParams, useSearchParams, Link } from 'react-router-dom'
import Layout from '../components/Layout'
import EventFilters from '../components/EventFilters'
import EventList from '../components/EventList'
import { useLocation } from '../context/LocationContext'
import events from '../data/events.json'
import categories from '../data/categories.json'

export default function CategoryPage() {
  const { slug } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const { location } = useLocation()

  const category = categories.find(c => c.slug === slug)

  const format = searchParams.get('format') || 'all'
  const type = searchParams.get('type') || 'all'

  const setFormat = (f) => {
    const params = new URLSearchParams(searchParams)
    if (f === 'all') params.delete('format')
    else params.set('format', f)
    setSearchParams(params)
  }

  const setType = (t) => {
    const params = new URLSearchParams(searchParams)
    if (t === 'all') params.delete('type')
    else params.set('type', t)
    setSearchParams(params)
  }

  const filteredEvents = useMemo(() => {
    return events
      .filter(e => {
        // Category filter
        if (!e.tags?.includes(category?.name)) return false
        // Format filter
        if (format !== 'all') {
          if (format === 'in-person' && e.format !== 'in-person' && e.format !== 'hybrid') return false
          if (format === 'virtual' && e.format !== 'virtual' && e.format !== 'hybrid') return false
        }
        // Type filter
        if (type !== 'all' && e.type !== type) return false
        // Location filter
        if (location.region !== 'all') {
          if (location.region === 'virtual' && e.format !== 'virtual') return false
          if (location.region !== 'virtual' && e.region !== location.region) return false
          if (location.city && !e.city?.toLowerCase().includes(location.city.toLowerCase())) return false
        }
        // Only future events
        if (new Date(e.date) < new Date()) return false
        return true
      })
      .sort((a, b) => new Date(a.date) - new Date(b.date))
  }, [events, category, format, type, location])

  if (!category) {
    return (
      <Layout>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px', textAlign: 'center' }}>
          <h1 style={{ color: 'white', fontFamily: "'Outfit', sans-serif" }}>Category not found</h1>
          <Link to="/events" style={{ color: 'rgba(255,255,255,0.6)' }}>Back to Events</Link>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
        {/* Breadcrumb */}
        <Link
          to="/events"
          style={{
            fontSize: '14px',
            color: 'rgba(255,255,255,0.5)',
            textDecoration: 'none',
            fontFamily: "'Outfit', sans-serif",
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            marginBottom: '16px'
          }}
        >
          ← Back to Events
        </Link>

        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{
            fontSize: '36px',
            fontWeight: 700,
            color: 'white',
            fontFamily: "'Outfit', sans-serif",
            margin: 0
          }}>
            {category.name}
          </h1>
          <p style={{
            fontSize: '16px',
            color: 'rgba(255,255,255,0.6)',
            fontFamily: "'Outfit', sans-serif",
            margin: '8px 0 0'
          }}>
            {category.description}
          </p>
          <p style={{
            fontSize: '14px',
            color: 'rgba(255,255,255,0.4)',
            fontFamily: "'Outfit', sans-serif",
            margin: '8px 0 0'
          }}>
            {filteredEvents.length} Events
          </p>
        </div>

        {/* Filters */}
        <EventFilters
          format={format}
          onFormatChange={setFormat}
          type={type}
          onTypeChange={setType}
        />

        {/* Event List */}
        <div style={{ marginTop: '32px' }}>
          <EventList events={filteredEvents} />
        </div>
      </div>
    </Layout>
  )
}
```

**Step 2:** Commit.

```bash
git add src/pages/CategoryPage.jsx
git commit -m "feat: add CategoryPage"
```

---

## Task 12: Update App Router and Add Context Provider

**Files:**
- Modify: `src/App.jsx`
- Modify: `src/main.jsx`

**Step 1:** Update App.jsx with new routes.

```jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Homepage from './pages/Homepage'
import Bunker from './pages/Bunker'
import ExploreEvents from './pages/ExploreEvents'
import CategoryPage from './pages/CategoryPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/bunker" element={<Bunker />} />
        <Route path="/events" element={<ExploreEvents />} />
        <Route path="/events/category/:slug" element={<CategoryPage />} />
        <Route path="/submit" element={<div style={{ color: 'white', padding: 40 }}>Submit page coming soon</div>} />
      </Routes>
    </BrowserRouter>
  )
}
```

**Step 2:** Wrap app with LocationProvider in main.jsx.

```jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { LocationProvider } from './context/LocationContext'
import './styles/animations.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <LocationProvider>
      <App />
    </LocationProvider>
  </React.StrictMode>
)
```

**Step 3:** Commit.

```bash
git add src/App.jsx src/main.jsx
git commit -m "feat: add routes and LocationProvider"
```

---

## Task 13: Create context directory

**Files:**
- Create: `src/context/` directory (done in Task 3)

This was already handled in Task 3.

---

## Verification

1. Run `npm run dev` in /Users/kwis/MPB
2. Visit http://localhost:5173/events
3. Confirm:
   - Location dropdown in nav auto-detects or defaults to "All Locations"
   - Category grid shows all 11 categories with event counts
   - Events display in date-grouped list
   - Format tabs filter correctly (All/In-Person/Virtual)
   - Event type dropdown filters correctly
   - Clicking category card navigates to `/events/category/[slug]`
   - Category page shows header with name/description and filtered events
   - URL params update when filters change
   - Event cards show image placeholder, badges, external link icon where appropriate
