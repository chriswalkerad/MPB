import { useState } from 'react'
import { Link } from 'react-router-dom'
import BunkerBackground from '../components/BunkerBackground'
import FloatingCard from '../components/FloatingCard'
import SubscribePanel from '../components/SubscribePanel'
import events from '../data/events.json'

const NAV_HEIGHT = 60

// Card positions for organic scatter
const CARD_POSITIONS = [
  { top: '5%', left: '10%' },
  { top: '18%', right: '5%' },
  { top: '35%', left: '20%' },
  { top: '48%', right: '10%' },
  { top: '62%', left: '5%' },
  { top: '75%', right: '15%' }
]

export default function Homepage() {
  const [subscribeOpen, setSubscribeOpen] = useState(false)

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', position: 'relative' }}>
      {/* 3D Background */}
      <BunkerBackground />

      {/* Content Overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 10,
          pointerEvents: 'none'
        }}
      >
        {/* Top Nav */}
        <nav
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            height: NAV_HEIGHT,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 40px',
            zIndex: 100,
            animation: 'navFade 1s ease-out 0.2s both',
            pointerEvents: 'auto'
          }}
        >
          <Link
            to="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              textDecoration: 'none'
            }}
          >
            <span style={{ fontSize: '20px' }}>💻</span>
            <span
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontWeight: 600,
                fontSize: '15px',
                color: 'rgba(255,255,255,0.9)',
                letterSpacing: '-0.02em'
              }}
            >
              mycomputerbroke
            </span>
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <button
              onClick={() => setSubscribeOpen(true)}
              style={{
                background: 'none',
                border: 'none',
                color: 'rgba(255,255,255,0.5)',
                fontSize: '14px',
                fontWeight: 400,
                fontFamily: "'Outfit', sans-serif",
                cursor: 'pointer',
                transition: 'color 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.9)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.5)'}
            >
              Subscribe
            </button>
            <Link
              to="/events"
              style={{
                color: 'rgba(255,255,255,0.6)',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: 500,
                fontFamily: "'Outfit', sans-serif",
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                transition: 'color 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'rgba(255,255,255,1)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}
            >
              Explore Events <span style={{ fontSize: '12px' }}>↗</span>
            </Link>
          </div>
        </nav>

        {/* Main Content */}
        <div
          style={{
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            padding: '0 40px'
          }}
        >
          {/* Left Column - Copy */}
          <div
            style={{
              flex: '0 0 45%',
              maxWidth: '540px',
              paddingLeft: '20px',
              pointerEvents: 'auto'
            }}
          >
            {/* Badge */}
            <div style={{ animation: 'fadeUp 0.8s ease-out 0.3s both' }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '6px 14px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '100px',
                  marginBottom: '32px',
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '12px',
                  color: 'rgba(255,255,255,0.5)'
                }}
              >
                <span
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: '#00d4aa',
                    boxShadow: '0 0 6px #00d4aa66',
                    animation: 'blink 2s ease-in-out infinite'
                  }}
                />
                cybersecurity events, one place
              </div>
            </div>

            {/* Headline */}
            <h1
              style={{
                fontSize: 'clamp(48px, 5.5vw, 72px)',
                fontWeight: 800,
                lineHeight: 1.05,
                letterSpacing: '-0.035em',
                color: 'white',
                margin: '0 0 24px 0',
                animation: 'fadeUp 0.8s ease-out 0.5s both',
                fontFamily: "'Outfit', sans-serif"
              }}
            >
              Every cyber
              <br />
              event.
              <br />
              <span style={{ color: '#FF0000' }}>Found here</span>
              <span
                style={{
                  background: 'linear-gradient(135deg, #ff6b35, #ff8f65, #ff6b35)',
                  backgroundSize: '200% auto',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  animation: 'shimmer 4s linear infinite'
                }}
              >.</span>
            </h1>

            {/* Subhead */}
            <p
              style={{
                fontSize: '17px',
                lineHeight: 1.6,
                color: 'rgba(255,255,255,0.45)',
                margin: '0 0 40px 0',
                maxWidth: '400px',
                fontWeight: 400,
                animation: 'fadeUp 0.8s ease-out 0.7s both',
                fontFamily: "'Outfit', sans-serif"
              }}
            >
              Conferences, meetups, and workshops — curated weekly so you never miss what matters.
            </p>

            {/* CTA */}
            <div style={{ animation: 'fadeUp 0.8s ease-out 0.9s both' }}>
              <Link
                to="/events"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '14px 32px',
                  background: 'white',
                  color: '#09090b',
                  textDecoration: 'none',
                  borderRadius: '100px',
                  fontSize: '15px',
                  fontWeight: 600,
                  fontFamily: "'Outfit', sans-serif",
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 8px 32px rgba(255,255,255,0.15)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                Attend Your First Event
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M6 3L11 8L6 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Right Column - Floating Cards */}
          <div
            style={{
              flex: 1,
              position: 'relative',
              height: '70%'
            }}
          >
            {events.slice(0, 6).map((event, i) => (
              <FloatingCard
                key={event.slug}
                event={event}
                style={CARD_POSITIONS[i]}
                delay={0.4 + i * 0.2}
              />
            ))}
          </div>
        </div>

        {/* Bottom Nav */}
        <nav
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '20px 40px',
            zIndex: 100,
            animation: 'navFade 1s ease-out 0.4s both',
            pointerEvents: 'auto'
          }}
        >
          {/* Left: logo + submit */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '14px' }}>💻</span>
              <span
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontWeight: 500,
                  fontSize: '12px',
                  color: 'rgba(255,255,255,0.4)'
                }}
              >
                mycomputerbroke
              </span>
            </div>
            <Link
              to="/submit"
              style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: '12px',
                color: 'rgba(255,255,255,0.25)',
                textDecoration: 'none',
                transition: 'color 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.25)'}
            >
              Submit An Event
            </Link>
          </div>

          {/* Right: social icons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'rgba(255,255,255,0.3)', transition: 'color 0.2s ease' }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.8)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.3)'}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
            </a>
            <a
              href="https://x.com"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'rgba(255,255,255,0.3)', transition: 'color 0.2s ease' }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.8)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.3)'}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'rgba(255,255,255,0.3)', transition: 'color 0.2s ease' }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.8)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.3)'}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
              </svg>
            </a>
          </div>
        </nav>
      </div>

      {/* Subscribe Panel */}
      <SubscribePanel isOpen={subscribeOpen} onClose={() => setSubscribeOpen(false)} />
    </div>
  )
}
