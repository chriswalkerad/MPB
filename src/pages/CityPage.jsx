import { useMemo, useState } from 'react'
import { useParams, useSearchParams, Link } from 'react-router-dom'
import Layout from '../components/Layout'
import EventFilters from '../components/EventFilters'
import EventList from '../components/EventList'
import EventDetailDrawer from '../components/EventDetailDrawer'
import MetaTags from '../components/MetaTags'
import events from '../data/events.json'
import { getCities, eventsForCity } from '../lib/cities'
import { todayCutoff, isUpcoming, matchesFormat, matchesType } from '../lib/filterEvents'
import { SITE_ORIGIN } from '../lib/site'

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

  const { upcomingEvents, pastEvents } = useMemo(() => {
    const cutoff = todayCutoff()
    const matching = eventsForCity(events, slug)
      .filter(e => matchesFormat(e, format) && matchesType(e, type))
    return {
      upcomingEvents: matching
        .filter(e => isUpcoming(e, cutoff))
        .sort((a, b) => new Date(a.date) - new Date(b.date)),
      pastEvents: matching
        .filter(e => !isUpcoming(e, cutoff))
        .sort((a, b) => new Date(b.date) - new Date(a.date)),
    }
  }, [slug, format, type])

  const jsonLd = useMemo(() => {
    if (!city || upcomingEvents.length === 0) return null
    return {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: `Cybersecurity Events in ${city.name}`,
      itemListElement: upcomingEvents.slice(0, 30).map((e, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: e.name,
        url: `${SITE_ORIGIN}/events/${e.slug}`,
      })),
    }
  }, [city, upcomingEvents])

  if (!city) {
    return (
      <Layout>
        <MetaTags title="City Not Found" path={`/events/city/${slug}`} />
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

  const description = upcomingEvents.length > 0
    ? `${upcomingEvents.length} upcoming cybersecurity conferences, meetups, and workshops in ${city.name}. Dates, venues, and registration links, curated weekly.`
    : `Cybersecurity events in ${city.name} — past conferences and meetups, with new events added as they're announced.`

  return (
    <Layout>
      <MetaTags
        title={`Cybersecurity Events in ${city.name}`}
        description={description}
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
            {upcomingEvents.length} Upcoming Events
          </p>
        </div>

        {/* Filters */}
        <EventFilters
          format={format}
          onFormatChange={setFormat}
          type={type}
          onTypeChange={setType}
        />

        {/* Upcoming Events */}
        <div style={{ marginTop: '32px' }}>
          <EventList events={upcomingEvents} onEventClick={setSelectedEvent} />
        </div>

        {/* Past Events */}
        {pastEvents.length > 0 && (
          <div style={{ marginTop: '48px' }}>
            <h2 style={{
              fontSize: '14px',
              fontWeight: 600,
              color: 'rgba(255,255,255,0.5)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '16px',
              fontFamily: "'Outfit', sans-serif"
            }}>
              Past Events in {city.name}
            </h2>
            <EventList events={pastEvents} onEventClick={setSelectedEvent} />
          </div>
        )}
      </div>

      {/* Event Detail Drawer */}
      <EventDetailDrawer
        event={selectedEvent}
        events={[...upcomingEvents, ...pastEvents]}
        isOpen={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
        onNavigate={setSelectedEvent}
      />
    </Layout>
  )
}
