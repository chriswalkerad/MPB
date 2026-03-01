const TYPE_COLORS = {
  conference: '#ff6b35',
  meetup: '#00d4aa',
  chapter: '#a78bfa',
  virtual: '#f472b6',
  workshop: '#facc15',
  webinar: '#38bdf8'
}

export default function FloatingCard({ event, style, delay = 0 }) {
  const color = TYPE_COLORS[event.type] || '#fff'

  return (
    <div
      style={{
        ...style,
        position: 'absolute',
        animation: `floatIn 0.8s ease-out ${delay}s both, gentleFloat 6s ease-in-out ${delay}s infinite`,
        pointerEvents: 'auto'
      }}
    >
      <div
        style={{
          background: 'rgba(255,255,255,0.04)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '16px',
          padding: '16px 20px',
          minWidth: '240px',
          cursor: 'default',
          transition: 'all 0.3s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(255,255,255,0.08)'
          e.currentTarget.style.border = `1px solid ${color}33`
          e.currentTarget.style.transform = 'scale(1.03)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
          e.currentTarget.style.border = '1px solid rgba(255,255,255,0.08)'
          e.currentTarget.style.transform = 'scale(1)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <div
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: color,
              boxShadow: `0 0 8px ${color}66`
            }}
          />
          <span
            style={{
              fontSize: '11px',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: color,
              fontFamily: "'JetBrains Mono', monospace"
            }}
          >
            {event.type}
          </span>
          <span
            style={{
              fontSize: '11px',
              color: 'rgba(255,255,255,0.35)',
              marginLeft: 'auto',
              fontFamily: "'JetBrains Mono', monospace"
            }}
          >
            {event.date}
          </span>
        </div>
        <div
          style={{
            fontSize: '14px',
            fontWeight: 500,
            color: 'rgba(255,255,255,0.9)',
            marginBottom: '4px',
            fontFamily: "'Outfit', sans-serif"
          }}
        >
          {event.name}
        </div>
        <div
          style={{
            fontSize: '12px',
            color: 'rgba(255,255,255,0.35)',
            fontFamily: "'Outfit', sans-serif"
          }}
        >
          {event.city}
        </div>
      </div>
    </div>
  )
}
