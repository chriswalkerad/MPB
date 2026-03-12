import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../components/Layout'
import EventCard from '../components/EventCard'
import EventDetailDrawer from '../components/EventDetailDrawer'
import MetaTags from '../components/MetaTags'
import events from '../data/events.json'

function getMonthKey(dateStr) {
  const date = new Date(dateStr)
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]
  return `${monthNames[date.getMonth()]} ${date.getFullYear()}`
}

export default function PastEvents() {
  const [selectedEvent, setSelectedEvent] = useState(null)

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  // Filter to only past events
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const pastEvents = events
    .filter(event => {
      const eventDate = new Date(event.date)
      return eventDate < today
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date)) // Most recent first

  // Group events by month
  const groupedEvents = pastEvents.reduce((groups, event) => {
    const monthKey = getMonthKey(event.date)
    if (!groups[monthKey]) {
      groups[monthKey] = []
    }
    groups[monthKey].push(event)
    return groups
  }, {})

  // Get sorted month keys (most recent first)
  const sortedMonths = Object.keys(groupedEvents).sort((a, b) => {
    const [monthA, yearA] = a.split(' ')
    const [monthB, yearB] = b.split(' ')
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ]
    const dateA = new Date(parseInt(yearA), monthNames.indexOf(monthA))
    const dateB = new Date(parseInt(yearB), monthNames.indexOf(monthB))
    return dateB - dateA
  })

  return (
    <Layout>
      <MetaTags
        title="Past Events"
        description="Archive of past cybersecurity events from conferences, meetups, and workshops across the US."
        path="/events/archive"
      />
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
            color: 'rgba(255,255,255,0.6)',
            fontSize: '14px',
            fontFamily: "'Outfit', sans-serif",
            textDecoration: 'none',
            marginBottom: '24px',
            transition: 'color 0.2s ease'
          }}
          onMouseEnter={(e) => e.target.style.color = 'rgba(255,255,255,0.9)'}
          onMouseLeave={(e) => e.target.style.color = 'rgba(255,255,255,0.6)'}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back to Upcoming Events
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

        {/* Events grouped by month */}
        {sortedMonths.map(month => (
          <div key={month} style={{ marginBottom: '32px' }}>
            <h2
              style={{
                fontSize: '14px',
                fontWeight: 600,
                color: 'rgba(255,255,255,0.5)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '16px',
                fontFamily: "'Outfit', sans-serif"
              }}
            >
              {month}
            </h2>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}
            >
              {groupedEvents[month].map(event => (
                <EventCard
                  key={event.slug}
                  event={event}
                  onClick={() => setSelectedEvent(event)}
                />
              ))}
            </div>
          </div>
        ))}

        {pastEvents.length === 0 && (
          <div
            style={{
              textAlign: 'center',
              padding: '60px 20px',
              color: 'rgba(255,255,255,0.5)',
              fontFamily: "'Outfit', sans-serif"
            }}
          >
            No past events found
          </div>
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
