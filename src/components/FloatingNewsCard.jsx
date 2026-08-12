import { useState } from 'react'

const CATEGORY_COLORS = {
  threats: '#f87171',
  vulnerabilities: '#fb923c',
  'msp-channel': '#60a5fa',
  'ai-security': '#c084fc',
  defense: '#4ade80',
  industry: '#94a3b8'
}

function sourceFlag(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '')
}

export default function FloatingNewsCard({ item, style, delay = 0 }) {
  const [hovered, setHovered] = useState(false)
  const color = CATEGORY_COLORS[item.category] || '#fff'
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
      <a
        href={item.url}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: 'block',
          background: 'rgba(0,0,0,0.85)',
          border: `1px solid ${borderColor}`,
          padding: '12px 16px',
          minWidth: '280px',
          maxWidth: '320px',
          cursor: 'pointer',
          transition: 'border-color 0.2s ease',
          fontFamily: "'JetBrains Mono', monospace",
          textDecoration: 'none'
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
          {' news '}
          <span style={{ color }}>--source={sourceFlag(item.source.name)}</span>
        </div>

        {/* Headline */}
        <div style={{
          fontSize: '13px',
          color: 'rgba(255,255,255,0.9)',
          fontWeight: 500,
          marginBottom: '4px',
          lineHeight: 1.4
        }}>
          {item.title}
          <span style={{
            marginLeft: '4px',
            animation: 'cursorBlink 1s step-end infinite',
            visibility: hovered ? 'visible' : 'hidden'
          }}>█</span>
        </div>

        {/* Category with tree character */}
        <div style={{
          fontSize: '11px',
          color: 'rgba(255,255,255,0.35)'
        }}>
          └─ {item.category} ↗
        </div>
      </a>
    </div>
  )
}
