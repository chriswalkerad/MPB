import { useMemo, useState } from 'react'
import { useParams, useSearchParams, Link } from 'react-router-dom'
import Layout from '../components/Layout'
import EventFilters from '../components/EventFilters'
import EventList from '../components/EventList'
import EventDetailDrawer from '../components/EventDetailDrawer'
import { useLocation } from '../context/LocationContext'
import events from '../data/events.json'
import categories from '../data/categories.json'

export default function CategoryPage() {
  const { slug } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const { location } = useLocation()
  const [selectedEvent, setSelectedEvent] = useState(null)

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
        // Category filter - match events that have this category in their tags
        if (!e.tags?.includes(category?.name)) return false
        // Format filter
        if (format !== 'all') {
          if (format === 'in-person' && e.format !== 'in-person' && e.format !== 'hybrid') return false
          if (format === 'virtual' && e.format !== 'virtual' && e.format !== 'hybrid') return false
        }
        // Type filter
        if (type !== 'all' && e.type !== type) return false
        // Location filter
        if (location?.region && location.region !== 'all') {
          if (location.region === 'virtual' && e.format !== 'virtual') return false
          if (location.region !== 'virtual' && e.region !== location.region) return false
          if (location.city && !e.city?.toLowerCase().includes(location.city.toLowerCase())) return false
        }
        // Only future events
        if (new Date(e.date) < new Date()) return false
        return true
      })
      .sort((a, b) => new Date(a.date) - new Date(b.date))
  }, [category, format, type, location])

  // Category not found state
  if (!category) {
    return (
      <Layout>
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px', textAlign: 'center' }}>
          <h1 style={{
            fontSize: '36px',
            fontWeight: 700,
            color: 'white',
            fontFamily: "'Outfit', sans-serif",
            marginBottom: '16px'
          }}>
            Category not found
          </h1>
          <Link
            to="/events"
            style={{
              fontSize: '14px',
              color: 'rgba(255,255,255,0.6)',
              textDecoration: 'none',
              fontFamily: "'Outfit', sans-serif"
            }}
          >
            Back to Events
          </Link>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px' }}>
        {/* Breadcrumb / Back link */}
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

        {/* Page Header */}
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
