import { useState, useRef, useEffect } from 'react'
import { useIsMobile } from '../hooks/useIsMobile'

const CATEGORY_TABS = [
  { value: 'all', label: 'All' },
  { value: 'threats', label: 'Threats' },
  { value: 'vulnerabilities', label: 'Vulns' },
  { value: 'msp-channel', label: 'MSP' },
  { value: 'ai-security', label: 'AI' },
  { value: 'defense', label: 'Defense' },
  { value: 'industry', label: 'Industry' }
]

export default function NewsFilters({ category, onCategoryChange, source, onSourceChange, sources }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)
  const isMobile = useIsMobile()

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const sourceOptions = [{ value: 'all', label: 'All Sources' }, ...sources.map(s => ({ value: s, label: s }))]
  const selectedSourceLabel = sourceOptions.find(s => s.value === source)?.label || 'All Sources'

  return (
    <div style={{
      display: 'flex',
      flexDirection: isMobile ? 'column' : 'row',
      justifyContent: 'space-between',
      alignItems: isMobile ? 'stretch' : 'center',
      gap: '12px',
      marginBottom: '24px'
    }}>
      {/* Category Tabs: horizontal scroll on mobile instead of wrapping */}
      <div style={{
        display: 'flex',
        gap: '20px',
        overflowX: isMobile ? 'auto' : 'visible',
        whiteSpace: 'nowrap',
        scrollbarWidth: 'none'
      }}>
        {CATEGORY_TABS.map(tab => (
          <button
            key={tab.value}
            onClick={() => onCategoryChange(tab.value)}
            style={{
              background: 'none',
              border: 'none',
              padding: '8px 0',
              color: category === tab.value ? 'white' : 'rgba(255,255,255,0.5)',
              borderBottom: category === tab.value ? '2px solid white' : '2px solid transparent',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 500,
              flexShrink: 0,
              transition: 'color 0.2s, border-color 0.2s'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Source Dropdown */}
      <div ref={dropdownRef} style={{ position: 'relative' }}>
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          style={{
            background: 'transparent',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '6px',
            padding: '6px 12px',
            color: 'white',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '14px',
            fontFamily: 'Outfit, sans-serif',
            minWidth: '150px',
            justifyContent: 'space-between',
            transition: 'border-color 0.2s ease',
            outline: 'none'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'
          }}
        >
          <span>{selectedSourceLabel}</span>
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
            top: 'calc(100% + 8px)',
            right: 0,
            background: 'rgba(20,20,20,0.98)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '8px',
            padding: '8px 0',
            zIndex: 100,
            minWidth: '180px',
            maxHeight: '400px',
            overflowY: 'auto',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)'
          }}>
            {sourceOptions.map(option => (
              <button
                key={option.value}
                onClick={() => {
                  onSourceChange(option.value)
                  setIsDropdownOpen(false)
                }}
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '10px 16px',
                  background: source === option.value ? 'rgba(255,255,255,0.1)' : 'transparent',
                  border: 'none',
                  color: 'white',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontFamily: 'Outfit, sans-serif',
                  transition: 'background 0.15s ease'
                }}
                onMouseEnter={e => {
                  if (source !== option.value) {
                    e.target.style.background = 'rgba(255,255,255,0.05)'
                  }
                }}
                onMouseLeave={e => {
                  if (source !== option.value) {
                    e.target.style.background = 'transparent'
                  }
                }}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
