import { useState } from 'react'
import { Link } from 'react-router-dom'
import BunkerBackground from '../components/BunkerBackground'
import FloatingCard from '../components/FloatingCard'
import SubscribePanel from '../components/SubscribePanel'
import events from '../data/events.json'
import { useIsMobile } from '../hooks/useIsMobile'

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
  const [logoHovered, setLogoHovered] = useState(false)
  const isMobile = useIsMobile()

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
            padding: isMobile ? '0 20px' : '0 40px',
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
            onMouseEnter={() => setLogoHovered(true)}
            onMouseLeave={() => setLogoHovered(false)}
          >
            <img src="/logo.png" alt="MPB" width="28" height="28" style={{ width: '28px', height: '28px', objectFit: 'contain' }} />
            <span
              style={{
                fontFamily: "'Outfit', sans-serif",
                fontWeight: 600,
                fontSize: '22px',
                color: 'rgba(255,255,255,0.9)',
                letterSpacing: '-0.02em',
                lineHeight: 1,
                display: 'inline-grid',
                whiteSpace: 'nowrap'
              }}
            >
              <span style={{
                gridArea: '1 / 1',
                transition: 'opacity 0.3s ease',
                opacity: logoHovered ? 0 : 1
              }}>
                /MPB
              </span>
              <span style={{
                gridArea: '1 / 1',
                transition: 'opacity 0.3s ease',
                opacity: logoHovered ? 1 : 0
              }}>
                /My Printer Broke
              </span>
            </span>
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button
              onClick={() => setSubscribeOpen(true)}
              className="nav-link-hover"
              style={{
                background: 'none',
                border: 'none',
                color: 'rgba(255,255,255,0.6)',
                fontSize: '14px',
                fontWeight: 500,
                fontFamily: "'Outfit', sans-serif",
                cursor: 'pointer'
              }}
            >
              Subscribe
            </button>
            <Link
              to="/events"
              className="nav-link-hover"
              style={{
                color: 'rgba(255,255,255,0.6)',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: 500,
                fontFamily: "'Outfit', sans-serif",
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                whiteSpace: 'nowrap'
              }}
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
            flexDirection: isMobile ? 'column' : 'row',
            alignItems: 'center',
            justifyContent: 'center',
            padding: isMobile ? '0 20px' : '0 40px',
            textAlign: isMobile ? 'center' : 'left'
          }}
        >
          {/* Left Column - Copy */}
          <div
            style={{
              flex: isMobile ? 'none' : '0 0 45%',
              width: isMobile ? '100%' : 'auto',
              maxWidth: isMobile ? '100%' : '540px',
              paddingLeft: isMobile ? '0' : '20px',
              pointerEvents: 'auto'
            }}
          >
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
              Every cyber security event.
            </h1>

            {/* Subhead */}
            <p
              style={{
                fontSize: '17px',
                lineHeight: 1.6,
                color: 'white',
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
                className="cta-button-hover"
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
                  fontFamily: "'Outfit', sans-serif"
                }}
              >
                Attend Your First Event
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M6 3L11 8L6 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Right Column - Floating Cards (hidden on mobile) */}
          {!isMobile && (
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
          )}
        </div>

        {/* Bottom Nav */}
        <nav
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            alignItems: 'center',
            justifyContent: isMobile ? 'center' : 'space-between',
            gap: isMobile ? '16px' : '0',
            padding: isMobile ? '20px' : '20px 40px',
            zIndex: 100,
            animation: 'navFade 1s ease-out 0.4s both',
            pointerEvents: 'auto'
          }}
        >
          {/* Left: logo + submit */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <img src="/logo.png" alt="MPB" width="20" height="20" style={{ width: '20px', height: '20px', objectFit: 'contain' }} />
              <span
                style={{
                  fontFamily: "'Outfit', sans-serif",
                  fontWeight: 600,
                  fontSize: '12px',
                  color: 'rgba(255,255,255,0.4)'
                }}
              >
                /MPB
              </span>
            </div>
            <Link
              to="/submit"
              style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: '12px',
                color: 'white',
                textDecoration: 'none'
              }}
            >
              Submit An Event
            </Link>
            <a
              href="mailto:newsletter@myprinterbroke.com"
              style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: '12px',
                color: 'rgba(255,255,255,0.5)',
                textDecoration: 'none'
              }}
            >
              Contact Us
            </a>
          </div>

          {/* Right: social icons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <a
              href="https://www.linkedin.com/company/my-printer-broke"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'white' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
            </a>
            <a
              href="https://bsky.app/profile/myprinterbroke.bsky.social"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'white' }}
            >
              <svg width="18" height="18" viewBox="0 0 568 501" fill="currentColor">
                <path d="M123.121 33.6637C188.241 82.5526 258.281 181.681 284 234.873C309.719 181.681 379.759 82.5526 444.879 33.6637C491.866 -1.61183 568 -28.9064 568 57.9464C568 75.2916 558.055 203.659 552.222 224.501C531.947 296.954 458.067 315.434 392.347 304.249C507.222 323.8 536.444 388.56 473.333 453.32C353.473 576.312 301.061 422.461 287.631 googletag-384.098C285.169 375.637 284.017 371.687 284 379.008C283.983 371.687 282.831 375.637 280.369 384.098C266.939 422.461 214.527 576.312 94.6667 453.32C31.5556 388.56 60.7778 323.8 175.653 304.249C109.933 315.434 36.0535 296.954 15.7778 224.501C9.94525 203.659 0 75.2916 0 57.9464C0 -28.9064 76.1345 -1.61183 123.121 33.6637Z" />
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
