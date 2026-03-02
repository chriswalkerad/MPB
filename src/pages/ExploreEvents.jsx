import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useLocation, METRO_AREAS } from '../context/LocationContext'
import Layout from '../components/Layout'
import EventFilters from '../components/EventFilters'
import EventList from '../components/EventList'
import EventDetailDrawer from '../components/EventDetailDrawer'
import CategoryCard from '../components/CategoryCard'
import events from '../data/events.json'
import categories from '../data/categories.json'

function countEventsForCategory(events, categoryName) {
  return events.filter(e => e.tags?.includes(categoryName)).length
}

export default function ExploreEvents() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { location } = useLocation()
  const [selectedEvent, setSelectedEvent] = useState(null)

  // Get filter state from URL params
  const format = searchParams.get('format') || 'all'
  const type = searchParams.get('type') || 'all'
  const eventSlug = searchParams.get('event')

  // Open drawer if event slug is in URL
  useEffect(() => {
    if (eventSlug) {
      const event = events.find(e => e.slug === eventSlug)
      if (event) {
        setSelectedEvent(event)
      }
    }
  }, [eventSlug])

  // Update URL params when filters change
  const handleFormatChange = (newFormat) => {
    const params = new URLSearchParams(searchParams)
    if (newFormat === 'all') {
      params.delete('format')
    } else {
      params.set('format', newFormat)
    }
    setSearchParams(params)
  }

  const handleTypeChange = (newType) => {
    const params = new URLSearchParams(searchParams)
    if (newType === 'all') {
      params.delete('type')
    } else {
      params.set('type', newType)
    }
    setSearchParams(params)
  }

  // Filter events
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const filteredEvents = events
    .filter(event => {
      // Only show future events
      const eventDate = new Date(event.date)
      if (eventDate < today) return false

      // Format filter: 'all', 'in-person', 'virtual'
      // Hybrid shows in both in-person and virtual
      if (format !== 'all') {
        if (format === 'in-person') {
          if (event.format !== 'in-person' && event.format !== 'hybrid') return false
        } else if (format === 'virtual') {
          if (event.format !== 'virtual' && event.format !== 'hybrid') return false
        }
      }

      // Type filter
      if (type !== 'all' && event.type !== type) return false

      // Location filter
      if (location?.region) {
        // Virtual events are always shown
        if (event.region === 'virtual') return true

        // Filter by region first
        if (event.region !== location.region) return false

        // If user selected a specific city, check metro area
        if (location.city) {
          const metroCities = METRO_AREAS[location.city] || [location.city]
          if (!metroCities.includes(event.city)) return false
        }
      }

      return true
    })
    .sort((a, b) => new Date(a.date) - new Date(b.date))

  return (
    <Layout>
      <div
        style={{
          maxWidth: '800px',
          margin: '0 auto',
          padding: '40px 20px'
        }}
      >
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
            Explore Events
          </h1>
          <p
            style={{
              fontSize: '16px',
              color: 'rgba(255,255,255,0.6)',
              margin: '8px 0 0 0',
              fontFamily: "'Outfit', sans-serif"
            }}
          >
            Discover cybersecurity conferences, meetups, and workshops near you
          </p>
        </div>

        {/* Category Grid */}
        <div style={{ marginBottom: '32px' }}>
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
            Browse by Category
          </h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
              gap: '12px'
            }}
          >
            {categories.map(category => (
              <CategoryCard
                key={category.slug}
                category={category}
                eventCount={countEventsForCategory(filteredEvents, category.name)}
              />
            ))}
          </div>
        </div>

        {/* Filters */}
        <EventFilters
          format={format}
          onFormatChange={handleFormatChange}
          type={type}
          onTypeChange={handleTypeChange}
        />

        {/* Event List */}
        <div style={{ marginTop: '24px' }}>
          <EventList events={filteredEvents} onEventClick={setSelectedEvent} />
        </div>
      </div>

      {/* Event Detail Drawer */}
      <EventDetailDrawer
        event={selectedEvent}
        events={filteredEvents}
        isOpen={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
        onNavigate={setSelectedEvent}
      />
    </Layout>
  )
}
