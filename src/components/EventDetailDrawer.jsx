import GenerativePattern from './GenerativePattern'

const NAV_HEIGHT = 60

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
    day: 'numeric'
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

  if (!endStr) {
    return `${formatTime(start)} ${tz}`
  }

  const end = new Date(endStr)
  return `${formatTime(start)} - ${formatTime(end)} ${tz}`
}

export default function EventDetailDrawer({ event, isOpen, onClose }) {
  if (!event && !isOpen) return null

  const typeColor = TYPE_COLORS[event?.type] || '#888'

  const handleRSVP = () => {
    if (event?.url) {
      window.open(event.url, '_blank', 'noopener,noreferrer')
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.6)',
          zIndex: 90,
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? 'auto' : 'none',
          transition: 'opacity 0.3s ease'
        }}
      />

      {/* Panel */}
      <div
        style={{
          position: 'fixed',
          top: NAV_HEIGHT,
          right: 0,
          width: '450px',
          maxWidth: '100vw',
          height: `calc(100vh - ${NAV_HEIGHT}px)`,
          background: 'rgba(9,9,11,0.95)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderLeft: '1px solid rgba(255,255,255,0.1)',
          zIndex: 100,
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.3s ease',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px',
            borderBottom: '1px solid rgba(255,255,255,0.1)'
          }}
        >
          <button
            onClick={onClose}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'none',
              border: 'none',
              color: 'rgba(255,255,255,0.6)',
              fontSize: '14px',
              fontFamily: "'Outfit', sans-serif",
              cursor: 'pointer',
              padding: '8px 0'
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Close
          </button>
        </div>

        {/* Scrollable Content */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '20px'
          }}
        >
          {event && (
            <>
              {/* Cover Image */}
              <div
                style={{
                  aspectRatio: '16 / 9',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  marginBottom: '20px',
                  background: 'rgba(255,255,255,0.05)'
                }}
              >
                {event.image ? (
                  <img
                    src={event.image}
                    alt={event.name}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                ) : (
                  <div style={{ width: '100%', height: '100%' }}>
                    <GenerativePattern seed={event.slug} size={410} />
                  </div>
                )}
              </div>

              {/* Title */}
              <h2
                style={{
                  fontSize: '24px',
                  fontWeight: 700,
                  color: 'white',
                  margin: '0 0 12px 0',
                  fontFamily: "'Outfit', sans-serif",
                  lineHeight: 1.3
                }}
              >
                {event.name}
              </h2>

              {/* Badges */}
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '8px',
                  marginBottom: '24px'
                }}
              >
                <span
                  style={{
                    padding: '4px 10px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontFamily: '"JetBrains Mono", monospace',
                    fontWeight: 500,
                    textTransform: 'uppercase',
                    background: `${typeColor}20`,
                    color: typeColor
                  }}
                >
                  {event.type}
                </span>
                {event.format && (
                  <span
                    style={{
                      padding: '4px 10px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontFamily: '"JetBrains Mono", monospace',
                      fontWeight: 500,
                      textTransform: 'uppercase',
                      background: 'rgba(255,255,255,0.1)',
                      color: 'rgba(255,255,255,0.7)'
                    }}
                  >
                    {event.format}
                  </span>
                )}
                {event.cost && (
                  <span
                    style={{
                      padding: '4px 10px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontFamily: '"JetBrains Mono", monospace',
                      fontWeight: 500,
                      textTransform: 'uppercase',
                      background: event.cost === 'Free' ? 'rgba(0,212,170,0.2)' : 'rgba(255,255,255,0.1)',
                      color: event.cost === 'Free' ? '#00d4aa' : 'rgba(255,255,255,0.7)'
                    }}
                  >
                    {event.cost}
                  </span>
                )}
              </div>

              {/* Date Section */}
              <div
                style={{
                  display: 'flex',
                  gap: '12px',
                  padding: '16px',
                  background: 'rgba(255,255,255,0.03)',
                  borderRadius: '12px',
                  marginBottom: '12px'
                }}
              >
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    background: 'rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" />
                    <path d="M16 2v4M8 2v4M3 10h18" />
                  </svg>
                </div>
                <div>
                  <div
                    style={{
                      fontSize: '15px',
                      fontWeight: 600,
                      color: 'white',
                      fontFamily: "'Outfit', sans-serif"
                    }}
                  >
                    {formatFullDate(event.date)}
                  </div>
                  <div
                    style={{
                      fontSize: '14px',
                      color: 'rgba(255,255,255,0.5)',
                      fontFamily: "'Outfit', sans-serif",
                      marginTop: '2px'
                    }}
                  >
                    {formatTimeRange(event.date, event.endDate)}
                  </div>
                </div>
              </div>

              {/* Location Section */}
              {event.city && (
                <div
                  style={{
                    display: 'flex',
                    gap: '12px',
                    padding: '16px',
                    background: 'rgba(255,255,255,0.03)',
                    borderRadius: '12px',
                    marginBottom: '24px'
                  }}
                >
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      background: 'rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: '15px',
                        fontWeight: 600,
                        color: 'white',
                        fontFamily: "'Outfit', sans-serif"
                      }}
                    >
                      {event.city}
                    </div>
                    {event.format === 'virtual' && (
                      <div
                        style={{
                          fontSize: '14px',
                          color: 'rgba(255,255,255,0.5)',
                          fontFamily: "'Outfit', sans-serif",
                          marginTop: '2px'
                        }}
                      >
                        Virtual Event
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* About Section */}
              {event.description && (
                <div style={{ marginBottom: '24px' }}>
                  <h3
                    style={{
                      fontSize: '12px',
                      fontWeight: 600,
                      color: 'rgba(255,255,255,0.5)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      marginBottom: '12px',
                      fontFamily: "'Outfit', sans-serif"
                    }}
                  >
                    About Event
                  </h3>
                  <p
                    style={{
                      fontSize: '14px',
                      lineHeight: 1.6,
                      color: 'rgba(255,255,255,0.8)',
                      fontFamily: "'Outfit', sans-serif",
                      margin: 0,
                      whiteSpace: 'pre-wrap'
                    }}
                  >
                    {event.description}
                  </p>
                </div>
              )}

              {/* Categories */}
              {event.tags && event.tags.length > 0 && (
                <div>
                  <h3
                    style={{
                      fontSize: '12px',
                      fontWeight: 600,
                      color: 'rgba(255,255,255,0.5)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      marginBottom: '12px',
                      fontFamily: "'Outfit', sans-serif"
                    }}
                  >
                    Categories
                  </h3>
                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '8px'
                    }}
                  >
                    {event.tags.map(tag => (
                      <span
                        key={tag}
                        style={{
                          padding: '6px 12px',
                          background: 'rgba(255,255,255,0.05)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '100px',
                          fontSize: '13px',
                          color: 'rgba(255,255,255,0.6)',
                          fontFamily: "'Outfit', sans-serif"
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Sticky Footer with RSVP Button */}
        {event?.url && (
          <div
            style={{
              padding: '16px 20px',
              borderTop: '1px solid rgba(255,255,255,0.1)',
              background: 'rgba(9,9,11,0.95)'
            }}
          >
            <button
              onClick={handleRSVP}
              style={{
                width: '100%',
                padding: '14px',
                background: 'white',
                color: '#09090b',
                border: 'none',
                borderRadius: '100px',
                fontSize: '15px',
                fontWeight: 600,
                fontFamily: "'Outfit', sans-serif",
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.2s ease'
              }}
            >
              RSVP
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M7 17L17 7M7 7h10v10" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </>
  )
}
