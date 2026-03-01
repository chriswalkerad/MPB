import { useState, useRef, useEffect } from 'react'

const EVENT_TYPES = [
  { value: 'all', label: 'All Types' },
  { value: 'conference', label: 'Conference' },
  { value: 'meetup', label: 'Meetup' },
  { value: 'workshop', label: 'Workshop' },
  { value: 'webinar', label: 'Webinar' },
  { value: 'chapter', label: 'Chapter Meeting' },
  { value: 'ctf', label: 'CTF & Hackathon' }
]

const FORMAT_TABS = [
  { value: 'all', label: 'All' },
  { value: 'in-person', label: 'In-Person' },
  { value: 'virtual', label: 'Virtual' }
]

export default function EventFilters({ format, onFormatChange, type, onTypeChange }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const selectedTypeLabel = EVENT_TYPES.find(t => t.value === type)?.label || 'All Types'

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '24px'
    }}>
      {/* Format Tabs */}
      <div style={{ display: 'flex', gap: '24px' }}>
        {FORMAT_TABS.map(tab => (
          <button
            key={tab.value}
            onClick={() => onFormatChange(tab.value)}
            style={{
              background: 'none',
              border: 'none',
              padding: '8px 0',
              color: format === tab.value ? 'white' : 'rgba(255,255,255,0.5)',
              borderBottom: format === tab.value ? '2px solid white' : '2px solid transparent',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 500,
              transition: 'color 0.2s, border-color 0.2s'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Event Type Dropdown */}
      <div ref={dropdownRef} style={{ position: 'relative' }}>
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          style={{
            background: 'transparent',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '6px',
            padding: '8px 12px',
            color: 'white',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '14px',
            minWidth: '150px',
            justifyContent: 'space-between'
          }}
        >
          <span>{selectedTypeLabel}</span>
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            style={{
              transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s'
            }}
          >
            <path
              d="M2.5 4.5L6 8L9.5 4.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {isDropdownOpen && (
          <div style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            marginTop: '4px',
            background: '#1a1a2e',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '6px',
            overflow: 'hidden',
            zIndex: 100,
            minWidth: '180px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
          }}>
            {EVENT_TYPES.map(eventType => (
              <button
                key={eventType.value}
                onClick={() => {
                  onTypeChange(eventType.value)
                  setIsDropdownOpen(false)
                }}
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '10px 12px',
                  background: type === eventType.value ? 'rgba(255,255,255,0.1)' : 'transparent',
                  border: 'none',
                  color: 'white',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontSize: '14px',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={e => {
                  if (type !== eventType.value) {
                    e.target.style.background = 'rgba(255,255,255,0.05)'
                  }
                }}
                onMouseLeave={e => {
                  if (type !== eventType.value) {
                    e.target.style.background = 'transparent'
                  }
                }}
              >
                {eventType.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
