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
      label = eventDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })
    }

    if (!groups[label]) groups[label] = { date: eventDate, events: [] }
    groups[label].events.push(event)
  })

  return Object.entries(groups)
    .sort(([, a], [, b]) => a.date - b.date)
    .map(([label, { events }]) => ({ label, events }))
}

export default function EventList({ events, onEventClick }) {
  if (!events || events.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '48px 0', color: 'rgba(255,255,255,0.5)' }}>
        No events match your filters. Try broadening your search.
      </div>
    )
  }

  const groupedEvents = groupEventsByDate(events)

  return (
    <div>
      {groupedEvents.map(group => (
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
                onClick={onEventClick}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
