import { useState } from 'react'

const NAV_HEIGHT = 60

export default function SubscribePanel({ isOpen, onClose }) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('idle') // idle | loading | success | error

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email) return

    setStatus('loading')

    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      })

      if (response.ok) {
        setStatus('success')
        setEmail('')
      } else {
        setStatus('error')
      }
    } catch (error) {
      setStatus('error')
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
          background: 'rgba(0,0,0,0.5)',
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
          width: '380px',
          height: `calc(100vh - ${NAV_HEIGHT}px)`,
          background: 'rgba(0,0,0,0.8)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderLeft: '1px solid rgba(255,255,255,0.1)',
          zIndex: 100,
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.3s ease',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '40px'
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'none',
            border: 'none',
            color: 'rgba(255,255,255,0.5)',
            fontSize: '24px',
            cursor: 'pointer',
            padding: '8px',
            lineHeight: 1
          }}
        >
          ×
        </button>

        <h2
          style={{
            fontSize: '24px',
            fontWeight: 700,
            color: 'white',
            marginBottom: '8px',
            fontFamily: "'Outfit', sans-serif"
          }}
        >
          Weekly cyber events
          <br />
          in your inbox.
        </h2>

        <p
          style={{
            fontSize: '15px',
            color: 'rgba(255,255,255,0.5)',
            marginBottom: '32px',
            fontFamily: "'Outfit', sans-serif"
          }}
        >
          Curated. No spam.
        </p>

        {status === 'success' ? (
          <div
            style={{
              padding: '16px',
              background: 'rgba(0,212,170,0.1)',
              border: '1px solid rgba(0,212,170,0.3)',
              borderRadius: '12px',
              color: '#00d4aa',
              fontSize: '14px',
              fontFamily: "'Outfit', sans-serif"
            }}
          >
            You're in! Check your inbox to confirm.
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              required
              style={{
                width: '100%',
                padding: '14px 16px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                color: 'white',
                fontSize: '15px',
                fontFamily: "'Outfit', sans-serif",
                marginBottom: '16px',
                outline: 'none'
              }}
            />
            <button
              type="submit"
              disabled={status === 'loading'}
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
                cursor: status === 'loading' ? 'wait' : 'pointer',
                opacity: status === 'loading' ? 0.7 : 1,
                transition: 'all 0.2s ease'
              }}
            >
              {status === 'loading' ? 'Subscribing...' : 'Subscribe'}
            </button>
          </form>
        )}
      </div>
    </>
  )
}
