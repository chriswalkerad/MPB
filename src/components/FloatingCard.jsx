import { useState } from 'react'

const TYPE_COLORS = {
  conference: '#ff6b35',
  meetup: '#00d4aa',
  chapter: '#a78bfa',
  virtual: '#f472b6',
  workshop: '#facc15',
  webinar: '#38bdf8'
}

export default function FloatingCard({ event, style, delay = 0 }) {
  const [hovered, setHovered] = useState(false)
  const color = TYPE_COLORS[event.type] || '#fff'
  const borderColor = hovered ? color : 'rgba(255,255,255,0.15)'

  return (
    <div
      style={{
        ...style,
        position: 'absolute',
        animation: `floatIn 0.8s ease-out ${delay}s both, gentleFloat 8s ease-in-out ${delay}s infinite`,
        pointerEvents: 'auto'
      }}
    >
      <div
        style={{
          background: 'rgba(0,0,0,0.85)',
          border: `1px solid ${borderColor}`,
          padding: '12px 16px',
          minWidth: '280px',
          cursor: 'default',
          transition: 'border-color 0.2s ease',
          fontFamily: "'JetBrains Mono', monospace"
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Command header */}
        <div style={{
          fontSize: '11px',
          color: 'rgba(255,255,255,0.4)',
          marginBottom: '8px'
        }}>
          <span style={{ color: 'rgba(255,255,255,0.6)' }}>$</span>
          {' event '}
          <span style={{ color }}>--type={event.type}</span>
        </div>

        {/* Event name + date row */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '4px'
        }}>
          <span style={{
            fontSize: '13px',
            color: 'rgba(255,255,255,0.9)',
            fontWeight: 500
          }}>
            {event.name}
          </span>
          <span style={{
            fontSize: '11px',
            color: 'rgba(255,255,255,0.5)',
            marginLeft: '12px',
            flexShrink: 0
          }}>
            {event.date}
            {hovered && (
              <span style={{
                marginLeft: '4px',
                animation: 'cursorBlink 1s step-end infinite'
              }}>█</span>
            )}
          </span>
        </div>

        {/* Location with tree character */}
        <div style={{
          fontSize: '11px',
          color: 'rgba(255,255,255,0.35)'
        }}>
          └─ {event.city}
        </div>
      </div>
    </div>
  )
}
