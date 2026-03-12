import { useParams, Link } from 'react-router-dom'
import Layout from '../components/Layout'
import MetaTags from '../components/MetaTags'
import GenerativePattern from '../components/GenerativePattern'
import events from '../data/events.json'

const TYPE_COLORS = {
  conference: '#ff6b35',
  meetup: '#00d4aa',
  chapter: '#a78bfa',
  workshop: '#facc15',
  webinar: '#38bdf8',
  ctf: '#f472b6',
}

function formatFullDate(dateStr) {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  })
}

function formatTimeRange(startStr, endStr) {
  const start = new Date(startStr)
  const formatTime = (d) => {
    let hours = d.getHours()
    const minutes = d.getMinutes()
    const ampm = hours >= 12 ? 'PM' : 'AM'
    hours = hours % 12 || 12
    const minStr = minutes < 10 ? `0${minutes}` : minutes
    return `${hours}:${minStr} ${ampm}`
  }
  const tz = start.toLocaleTimeString('en-US', { timeZoneName: 'short' }).split(' ').pop()
  if (!endStr) return `${formatTime(start)} ${tz}`
  const end = new Date(endStr)
  return `${formatTime(start)} - ${formatTime(end)} ${tz}`
}

function buildJsonLd(event) {
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: event.name,
    startDate: event.date,
    description: event.description || '',
    eventAttendanceMode: event.format === 'virtual'
      ? 'https://schema.org/OnlineEventAttendanceMode'
      : event.format === 'hybrid'
        ? 'https://schema.org/MixedEventAttendanceMode'
        : 'https://schema.org/OfflineEventAttendanceMode',
  }
  if (event.endDate) ld.endDate = event.endDate
  if (event.city) {
    ld.location = event.format === 'virtual'
      ? { '@type': 'VirtualLocation', url: event.url }
      : { '@type': 'Place', name: event.city }
  }
  if (event.cost) {
    ld.offers = {
      '@type': 'Offer',
      price: event.cost === 'Free' ? '0' : event.cost.replace(/[^0-9.]/g, ''),
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
      url: event.url
    }
  }
  if (event.organizer) {
    ld.organizer = { '@type': 'Organization', name: event.organizer }
  }
  if (event.image) ld.image = event.image
  return ld
}

export default function EventDetail() {
  const { slug } = useParams()
  const event = events.find(e => e.slug === slug)

  if (!event) {
    return (
      <Layout>
        <MetaTags title="Event Not Found" path={`/events/${slug}`} />
        <div style={{ maxWidth: '600px', margin: '0 auto', padding: '80px 20px', textAlign: 'center' }}>
          <h1 style={{ color: 'white', fontSize: '24px', fontFamily: "'Outfit', sans-serif", marginBottom: '16px' }}>
            Event not found
          </h1>
          <Link to="/events" style={{ color: 'rgba(255,255,255,0.6)', fontFamily: "'Outfit', sans-serif" }}>
            Browse all events
          </Link>
        </div>
      </Layout>
    )
  }

  const typeColor = TYPE_COLORS[event.type] || '#888'
  const descSnippet = event.description ? event.description.slice(0, 155).trim() + (event.description.length > 155 ? '...' : '') : ''

  return (
    <Layout>
      <MetaTags
        title={`${event.name} - ${event.city}`}
        description={descSnippet}
        path={`/events/${event.slug}`}
        image={event.image}
        type="website"
        jsonLd={buildJsonLd(event)}
      />
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '40px 20px 80px' }}>
        {/* Breadcrumb */}
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
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          All Events
        </Link>

        {/* Cover Image */}
        <div style={{ aspectRatio: '16 / 9', borderRadius: '12px', overflow: 'hidden', marginBottom: '24px', background: 'rgba(255,255,255,0.05)' }}>
          {event.image ? (
            <img src={event.image} alt={event.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <div style={{ width: '100%', height: '100%' }}>
              <GenerativePattern seed={event.slug} size={600} />
            </div>
          )}
        </div>

        {/* Title */}
        <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'white', margin: '0 0 16px', fontFamily: "'Outfit', sans-serif", lineHeight: 1.3 }}>
          {event.name}
        </h1>

        {/* Badges */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '24px' }}>
          <span style={{ padding: '4px 10px', borderRadius: '4px', fontSize: '12px', fontFamily: '"JetBrains Mono", monospace', fontWeight: 500, textTransform: 'uppercase', background: `${typeColor}20`, color: typeColor }}>
            {event.type}
          </span>
          {event.format && (
            <span style={{ padding: '4px 10px', borderRadius: '4px', fontSize: '12px', fontFamily: '"JetBrains Mono", monospace', fontWeight: 500, textTransform: 'uppercase', background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)' }}>
              {event.format}
            </span>
          )}
          {event.cost && (
            <span style={{ padding: '4px 10px', borderRadius: '4px', fontSize: '12px', fontFamily: '"JetBrains Mono", monospace', fontWeight: 500, textTransform: 'uppercase', background: event.cost === 'Free' ? 'rgba(0,212,170,0.2)' : 'rgba(255,255,255,0.1)', color: event.cost === 'Free' ? '#00d4aa' : 'rgba(255,255,255,0.7)' }}>
              {event.cost}
            </span>
          )}
        </div>

        {/* Date */}
        <div style={{ display: 'flex', gap: '12px', padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', marginBottom: '12px' }}>
          <div style={{ width: '40px', height: '40px', background: 'rgba(255,255,255,0.1)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
            </svg>
          </div>
          <div>
            <div style={{ fontSize: '15px', fontWeight: 600, color: 'white', fontFamily: "'Outfit', sans-serif" }}>
              {formatFullDate(event.date)}
            </div>
            <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', fontFamily: "'Outfit', sans-serif", marginTop: '2px' }}>
              {formatTimeRange(event.date, event.endDate)}
            </div>
          </div>
        </div>

        {/* Location */}
        {event.city && (
          <div style={{ display: 'flex', gap: '12px', padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', marginBottom: '24px' }}>
            <div style={{ width: '40px', height: '40px', background: 'rgba(255,255,255,0.1)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
              </svg>
            </div>
            <div>
              <div style={{ fontSize: '15px', fontWeight: 600, color: 'white', fontFamily: "'Outfit', sans-serif" }}>{event.city}</div>
              {event.format === 'virtual' && (
                <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', fontFamily: "'Outfit', sans-serif", marginTop: '2px' }}>Virtual Event</div>
              )}
            </div>
          </div>
        )}

        {/* Description */}
        {event.description && (
          <div style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px', fontFamily: "'Outfit', sans-serif" }}>
              About Event
            </h2>
            <p style={{ fontSize: '15px', lineHeight: 1.7, color: 'rgba(255,255,255,0.8)', fontFamily: "'Outfit', sans-serif", margin: 0, whiteSpace: 'pre-wrap' }}>
              {event.description}
            </p>
          </div>
        )}

        {/* Categories */}
        {event.tags && event.tags.length > 0 && (
          <div style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px', fontFamily: "'Outfit', sans-serif" }}>
              Categories
            </h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {event.tags.map(tag => (
                <span key={tag} style={{ padding: '6px 12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '100px', fontSize: '13px', color: 'rgba(255,255,255,0.6)', fontFamily: "'Outfit', sans-serif" }}>
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* RSVP Button */}
        {event.url && (
          <a
            href={event.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              width: '100%', padding: '14px', background: 'white', color: '#09090b',
              border: 'none', borderRadius: '100px', fontSize: '15px', fontWeight: 600,
              fontFamily: "'Outfit', sans-serif", textDecoration: 'none', transition: 'all 0.2s ease'
            }}
          >
            RSVP
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M7 17L17 7M7 7h10v10" />
            </svg>
          </a>
        )}
      </div>
    </Layout>
  )
}
