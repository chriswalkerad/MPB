import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../components/Layout'
import MetaTags from '../components/MetaTags'
import categories from '../data/categories.json'

const EVENT_TYPES = [
  { value: 'conference', label: 'Conference' },
  { value: 'meetup', label: 'Meetup' },
  { value: 'workshop', label: 'Workshop' },
  { value: 'webinar', label: 'Webinar' },
  { value: 'chapter', label: 'Chapter Meeting' },
  { value: 'ctf', label: 'CTF' }
]

const EVENT_FORMATS = [
  { value: 'in-person', label: 'In-Person' },
  { value: 'virtual', label: 'Virtual' },
  { value: 'hybrid', label: 'Hybrid' }
]

const inputStyle = {
  width: '100%',
  padding: '14px 16px',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '12px',
  color: 'white',
  fontSize: '15px',
  fontFamily: "'Outfit', sans-serif",
  outline: 'none',
  transition: 'all 0.2s ease'
}

const labelStyle = {
  display: 'block',
  fontSize: '14px',
  fontWeight: 500,
  color: 'rgba(255,255,255,0.7)',
  marginBottom: '8px',
  fontFamily: "'Outfit', sans-serif"
}

const sectionStyle = {
  marginBottom: '24px'
}

export default function SubmitEvent() {
  const fileInputRef = useRef(null)
  const [dragActive, setDragActive] = useState(false)
  const [imagePreview, setImagePreview] = useState(null)
  const [status, setStatus] = useState('idle') // idle | loading | success | error

  const [formData, setFormData] = useState({
    name: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    location: '',
    description: '',
    type: '',
    format: '',
    cost: 'free',
    customCost: '',
    capacity: 'unlimited',
    customCapacity: '',
    selectedTags: []
  })

  // Auto-detect timezone
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleTagToggle = (tagName) => {
    setFormData(prev => ({
      ...prev,
      selectedTags: prev.selectedTags.includes(tagName)
        ? prev.selectedTags.filter(t => t !== tagName)
        : [...prev.selectedTags, tagName]
    }))
  }

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  const handleFile = (file) => {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => setImagePreview(e.target.result)
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus('loading')

    try {
      const response = await fetch('https://formspree.io/f/xwvnjlbq', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name,
          startDate: formData.startDate,
          startTime: formData.startTime,
          endDate: formData.endDate,
          endTime: formData.endTime,
          location: formData.location,
          description: formData.description,
          type: formData.type,
          format: formData.format,
          cost: formData.cost === 'custom' ? formData.customCost : 'Free',
          capacity: formData.capacity === 'custom' ? formData.customCapacity : 'Unlimited',
          categories: formData.selectedTags.join(', '),
          timezone
        })
      })

      if (response.ok) {
        setStatus('success')
      } else {
        setStatus('error')
      }
    } catch (error) {
      setStatus('error')
    }
  }

  const isFormValid = () => {
    return (
      formData.name.trim() &&
      formData.startDate &&
      formData.startTime &&
      formData.type &&
      formData.format &&
      formData.selectedTags.length > 0
    )
  }

  if (status === 'success') {
    return (
      <Layout>
        <div
          style={{
            maxWidth: '600px',
            margin: '0 auto',
            padding: '80px 20px',
            textAlign: 'center'
          }}
        >
          <div
            style={{
              width: '80px',
              height: '80px',
              background: 'rgba(0,212,170,0.1)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
              fontSize: '40px'
            }}
          >
            ✓
          </div>
          <h1
            style={{
              fontSize: '32px',
              fontWeight: 700,
              color: 'white',
              marginBottom: '12px',
              fontFamily: "'Outfit', sans-serif"
            }}
          >
            Event Submitted!
          </h1>
          <p
            style={{
              fontSize: '16px',
              color: 'rgba(255,255,255,0.6)',
              marginBottom: '32px',
              fontFamily: "'Outfit', sans-serif"
            }}
          >
            Thanks for contributing to the community. Your event will be reviewed and published soon.
          </p>
          <Link
            to="/events"
            style={{
              display: 'inline-block',
              padding: '14px 32px',
              background: 'white',
              color: '#09090b',
              borderRadius: '100px',
              fontSize: '15px',
              fontWeight: 600,
              fontFamily: "'Outfit', sans-serif",
              textDecoration: 'none',
              transition: 'all 0.2s ease'
            }}
          >
            Back to Events
          </Link>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <MetaTags
        title="Submit an Event"
        description="Submit your cybersecurity conference, meetup, or workshop to be featured on My Printer Broke."
        path="/submit"
      />
      <div
        style={{
          maxWidth: '800px',
          margin: '0 auto',
          padding: '40px 20px'
        }}
      >
        {/* Back Link */}
        <Link
          to="/events"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            color: 'rgba(255,255,255,0.5)',
            textDecoration: 'none',
            fontSize: '14px',
            fontFamily: "'Outfit', sans-serif",
            marginBottom: '24px',
            transition: 'color 0.2s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = 'white'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.5)'}
        >
          ← Back to Events
        </Link>

        {/* Page Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1
            style={{
              fontSize: '36px',
              fontWeight: 700,
              color: 'white',
              margin: 0,
              fontFamily: "'Outfit', sans-serif"
            }}
          >
            Submit an Event
          </h1>
          <p
            style={{
              fontSize: '16px',
              color: 'rgba(255,255,255,0.6)',
              margin: '8px 0 0 0',
              fontFamily: "'Outfit', sans-serif"
            }}
          >
            Share cybersecurity events with the community
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Two Column Layout */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(200px, 280px) 1fr',
              gap: '32px'
            }}
            className="submit-form-grid"
          >
            {/* Left Column - Image Upload */}
            <div>
              <label style={labelStyle}>Event Image</label>
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                style={{
                  aspectRatio: '16 / 9',
                  background: dragActive
                    ? 'rgba(255,255,255,0.1)'
                    : 'rgba(255,255,255,0.05)',
                  border: `2px dashed ${dragActive ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.1)'}`,
                  borderRadius: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  overflow: 'hidden',
                  position: 'relative'
                }}
              >
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                ) : (
                  <>
                    <svg
                      width="40"
                      height="40"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="rgba(255,255,255,0.3)"
                      strokeWidth="1.5"
                    >
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <path d="M21 15l-5-5L5 21" />
                    </svg>
                    <p
                      style={{
                        color: 'rgba(255,255,255,0.5)',
                        fontSize: '14px',
                        fontFamily: "'Outfit', sans-serif",
                        marginTop: '12px',
                        textAlign: 'center'
                      }}
                    >
                      Click to upload<br />
                      or drag & drop
                    </p>
                  </>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileInput}
                  style={{ display: 'none' }}
                />
              </div>
              {imagePreview && (
                <button
                  type="button"
                  onClick={() => setImagePreview(null)}
                  style={{
                    marginTop: '8px',
                    background: 'none',
                    border: 'none',
                    color: 'rgba(255,255,255,0.5)',
                    fontSize: '13px',
                    fontFamily: "'Outfit', sans-serif",
                    cursor: 'pointer'
                  }}
                >
                  Remove image
                </button>
              )}
            </div>

            {/* Right Column - Form Fields */}
            <div>
              {/* Event Name */}
              <div style={sectionStyle}>
                <label style={labelStyle}>Event Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. OWASP Monthly Meetup"
                  required
                  style={inputStyle}
                />
              </div>

              {/* Date & Time */}
              <div style={sectionStyle}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                  <div>
                    <label style={labelStyle}>Start Date *</label>
                    <input
                      type="date"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleChange}
                      required
                      style={{ ...inputStyle, colorScheme: 'dark' }}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Start Time *</label>
                    <input
                      type="time"
                      name="startTime"
                      value={formData.startTime}
                      onChange={handleChange}
                      required
                      style={{ ...inputStyle, colorScheme: 'dark' }}
                    />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={labelStyle}>End Date</label>
                    <input
                      type="date"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleChange}
                      style={{ ...inputStyle, colorScheme: 'dark' }}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>End Time</label>
                    <input
                      type="time"
                      name="endTime"
                      value={formData.endTime}
                      onChange={handleChange}
                      style={{ ...inputStyle, colorScheme: 'dark' }}
                    />
                  </div>
                </div>
                <p
                  style={{
                    fontSize: '13px',
                    color: 'rgba(255,255,255,0.4)',
                    marginTop: '8px',
                    fontFamily: "'Outfit', sans-serif"
                  }}
                >
                  Timezone: {timezone}
                </p>
              </div>

              {/* Location */}
              <div style={sectionStyle}>
                <label style={labelStyle}>
                  {formData.format === 'virtual' ? 'Virtual Link' : 'Location'}
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder={
                    formData.format === 'virtual'
                      ? 'https://zoom.us/j/...'
                      : 'City, State (e.g. Irvine, CA)'
                  }
                  style={inputStyle}
                />
              </div>

              {/* Description */}
              <div style={sectionStyle}>
                <label style={labelStyle}>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Tell attendees what to expect..."
                  rows={4}
                  style={{
                    ...inputStyle,
                    resize: 'vertical',
                    minHeight: '100px'
                  }}
                />
              </div>

              {/* Event Details */}
              <div style={sectionStyle}>
                <h3
                  style={{
                    fontSize: '14px',
                    fontWeight: 600,
                    color: 'rgba(255,255,255,0.5)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    marginBottom: '16px',
                    fontFamily: "'Outfit', sans-serif"
                  }}
                >
                  Event Details
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={labelStyle}>Event Type *</label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleChange}
                      required
                      style={{ ...inputStyle, cursor: 'pointer' }}
                    >
                      <option value="">Select type...</option>
                      {EVENT_TYPES.map(t => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Format *</label>
                    <select
                      name="format"
                      value={formData.format}
                      onChange={handleChange}
                      required
                      style={{ ...inputStyle, cursor: 'pointer' }}
                    >
                      <option value="">Select format...</option>
                      {EVENT_FORMATS.map(f => (
                        <option key={f.value} value={f.value}>{f.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Event Options */}
              <div style={sectionStyle}>
                <h3
                  style={{
                    fontSize: '14px',
                    fontWeight: 600,
                    color: 'rgba(255,255,255,0.5)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    marginBottom: '16px',
                    fontFamily: "'Outfit', sans-serif"
                  }}
                >
                  Event Options
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={labelStyle}>Ticket Price</label>
                    <select
                      name="cost"
                      value={formData.cost}
                      onChange={handleChange}
                      style={{ ...inputStyle, cursor: 'pointer' }}
                    >
                      <option value="free">Free</option>
                      <option value="custom">Custom</option>
                    </select>
                    {formData.cost === 'custom' && (
                      <input
                        type="text"
                        name="customCost"
                        value={formData.customCost}
                        onChange={handleChange}
                        placeholder="e.g. $50"
                        style={{ ...inputStyle, marginTop: '8px' }}
                      />
                    )}
                  </div>
                  <div>
                    <label style={labelStyle}>Capacity</label>
                    <select
                      name="capacity"
                      value={formData.capacity}
                      onChange={handleChange}
                      style={{ ...inputStyle, cursor: 'pointer' }}
                    >
                      <option value="unlimited">Unlimited</option>
                      <option value="custom">Limited</option>
                    </select>
                    {formData.capacity === 'custom' && (
                      <input
                        type="number"
                        name="customCapacity"
                        value={formData.customCapacity}
                        onChange={handleChange}
                        placeholder="e.g. 100"
                        style={{ ...inputStyle, marginTop: '8px' }}
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Categories */}
              <div style={sectionStyle}>
                <label style={labelStyle}>Categories * (select all that apply)</label>
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '8px'
                  }}
                >
                  {categories.map(cat => {
                    const isSelected = formData.selectedTags.includes(cat.name)
                    return (
                      <button
                        key={cat.slug}
                        type="button"
                        onClick={() => handleTagToggle(cat.name)}
                        style={{
                          padding: '8px 16px',
                          background: isSelected
                            ? 'rgba(255,255,255,0.15)'
                            : 'rgba(255,255,255,0.05)',
                          border: `1px solid ${isSelected ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.1)'}`,
                          borderRadius: '100px',
                          color: isSelected ? 'white' : 'rgba(255,255,255,0.6)',
                          fontSize: '13px',
                          fontFamily: "'Outfit', sans-serif",
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        {cat.name}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div
            style={{
              marginTop: '32px',
              paddingTop: '24px',
              borderTop: '1px solid rgba(255,255,255,0.1)'
            }}
          >
            <button
              type="submit"
              disabled={!isFormValid() || status === 'loading'}
              style={{
                width: '100%',
                padding: '16px',
                background: isFormValid() ? 'white' : 'rgba(255,255,255,0.1)',
                color: isFormValid() ? '#09090b' : 'rgba(255,255,255,0.3)',
                border: 'none',
                borderRadius: '100px',
                fontSize: '16px',
                fontWeight: 600,
                fontFamily: "'Outfit', sans-serif",
                cursor: isFormValid() && status !== 'loading' ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s ease'
              }}
            >
              {status === 'loading' ? 'Submitting...' : 'Submit Event'}
            </button>
          </div>
        </form>
      </div>

      {/* Responsive Styles */}
      <style>{`
        @media (max-width: 640px) {
          .submit-form-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </Layout>
  )
}
