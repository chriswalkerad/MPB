import { useMemo, useState } from 'react'
import { useParams, useSearchParams, Link } from 'react-router-dom'
import Layout from '../components/Layout'
import EventFilters from '../components/EventFilters'
import EventList from '../components/EventList'
import EventDetailDrawer from '../components/EventDetailDrawer'
import MetaTags from '../components/MetaTags'
import events from '../data/events.json'
import { getCities, eventsForCity } from '../lib/cities'

const cities = getCities(events)

export default function CityPage() {
  const { slug } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const [selectedEvent, setSelectedEvent] = useState(null)

  const city = cities.find(c => c.slug === slug)

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
    return eventsForCity(events, slug)
      .filter(e => {
        if (format !== 'all') {
          if (format === 'in-person' && e.format !== 'in-person' && e.format !== 'hybrid') return false
          if (format === 'virtual' && e.format !== 'virtual' && e.format !== 'hybrid') return false
        }
        if (type !== 'all' && e.type !== type) return false
        if (new Date(e.date) < new Date()) return false
        return true
      })
      .sort((a, b) => new Date(a.date) - new Date(b.date))
  }, [slug, format, type])

  const jsonLd = useMemo(() => {
    if (!city || filteredEvents.length === 0) return null
    return {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: `Cybersecurity Events in ${city.name}`,
      itemListElement: filteredEvents.slice(0, 30).map((e, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: e.name,
        url: `https://www.myprinterbroke.com/events/${e.slug}`,
      })),
    }
  }, [city, filteredEvents])

  if (!city) {
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
            City not found
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
      <MetaTags
        title={`Cybersecurity Events in ${city.name}`}
        description={`${filteredEvents.length} upcoming cybersecurity conferences, meetups, and workshops in ${city.name}. Dates, venues, and registration links, curated weekly.`}
        path={`/events/city/${city.slug}`}
        jsonLd={jsonLd}
      />
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
            Cybersecurity Events in {city.name}
          </h1>
          <p style={{
            fontSize: '16px',
            color: 'rgba(255,255,255,0.6)',
            fontFamily: "'Outfit', sans-serif",
            margin: '8px 0 0'
          }}>
            Conferences, meetups, and workshops in {city.name} — curated weekly.
          </p>
          <p style={{
            fontSize: '14px',
            color: 'rgba(255,255,255,0.4)',
            fontFamily: "'Outfit', sans-serif",
            margin: '8px 0 0'
          }}>
            {filteredEvents.length} Upcoming Events
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
