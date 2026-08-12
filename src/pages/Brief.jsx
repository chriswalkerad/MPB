import { Link, useParams } from 'react-router-dom'
import Layout from '../components/Layout'
import MetaTags from '../components/MetaTags'
import briefs from '../data/briefs.json'

const CATEGORY_COLORS = {
  threats: '#f87171',
  vulnerabilities: '#fb923c',
  'msp-channel': '#60a5fa',
  'ai-security': '#c084fc',
  defense: '#4ade80',
  industry: '#94a3b8',
}

function formatBriefDate(dateStr) {
  // noon UTC avoids timezone rollover shifting the displayed day
  return new Date(`${dateStr}T12:00:00Z`).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

export default function Brief() {
  const { slug } = useParams()
  const brief = slug ? briefs.find(b => b.slug === slug) : briefs[0]

  if (!brief) {
    return (
      <Layout>
        <MetaTags title="Daily Brief" description="The MPB Daily Brief: the day's security news for MSPs and IT pros, in two minutes." path="/brief" />
        <div style={{ maxWidth: '680px', margin: '0 auto', padding: '80px 20px', textAlign: 'center' }}>
          <h1 style={{ fontSize: '24px', color: 'white', fontFamily: "'Outfit', sans-serif" }}>
            {slug ? 'Brief not found' : 'No briefs yet'}
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontFamily: "'Outfit', sans-serif" }}>
            The daily brief lands every morning. Meanwhile, the feed is fresh:
          </p>
          <Link to="/news" style={{ color: 'white', fontFamily: "'Outfit', sans-serif" }}>
            Go to News →
          </Link>
        </div>
      </Layout>
    )
  }

  const index = briefs.findIndex(b => b.slug === brief.slug)
  const newer = index > 0 ? briefs[index - 1] : null
  const older = index < briefs.length - 1 ? briefs[index + 1] : null

  return (
    <Layout>
      <MetaTags
        title={`MPB Daily Brief, ${formatBriefDate(brief.date)}: ${brief.title}`}
        description={brief.intro}
        path={`/brief/${brief.slug}`}
        type="article"
      />
      <div style={{ maxWidth: '680px', margin: '0 auto', padding: '40px 20px', fontFamily: "'Outfit', sans-serif" }}>
        {/* Kicker */}
        <div
          style={{
            fontSize: '12px',
            fontWeight: 600,
            color: 'rgba(255,255,255,0.5)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            fontFamily: '"JetBrains Mono", monospace',
            marginBottom: '12px',
          }}
        >
          MPB Daily Brief · {formatBriefDate(brief.date)}
        </div>

        {/* Title + intro */}
        <h1 style={{ fontSize: '32px', fontWeight: 700, color: 'white', margin: '0 0 12px 0', lineHeight: 1.2 }}>
          {brief.title}
        </h1>
        <p style={{ fontSize: '17px', color: 'rgba(255,255,255,0.7)', margin: '0 0 40px 0', lineHeight: 1.6 }}>
          {brief.intro}
        </p>

        {/* Items */}
        {brief.items.map(item => (
          <div
            key={item.storySlug}
            style={{
              marginBottom: '32px',
              paddingLeft: '16px',
              borderLeft: `2px solid ${CATEGORY_COLORS[item.category] || 'rgba(255,255,255,0.2)'}`,
            }}
          >
            <h2 style={{ fontSize: '19px', fontWeight: 600, color: 'white', margin: '0 0 8px 0', lineHeight: 1.3 }}>
              {item.heading}
            </h2>
            <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.7)', margin: '0 0 8px 0', lineHeight: 1.7 }}>
              {item.body}
            </p>
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: '13px',
                color: 'rgba(255,255,255,0.5)',
                textDecoration: 'none',
                fontFamily: '"JetBrains Mono", monospace',
                transition: 'color 0.2s ease',
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.9)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.5)'}
            >
              Read at {item.source} ↗
            </a>
          </div>
        ))}

        {/* Sign-off */}
        <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.5)', margin: '40px 0', lineHeight: 1.6 }}>
          {brief.signOff}
        </p>

        {/* Prev / next */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            borderTop: '1px solid rgba(255,255,255,0.08)',
            paddingTop: '20px',
            fontSize: '14px',
          }}
        >
          <span>
            {older && (
              <Link to={`/brief/${older.slug}`} style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>
                ← {formatBriefDate(older.date)}
              </Link>
            )}
          </span>
          <span>
            {newer ? (
              <Link to={`/brief/${newer.slug}`} style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>
                {formatBriefDate(newer.date)} →
              </Link>
            ) : (
              <Link to="/news" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>
                Back to News →
              </Link>
            )}
          </span>
        </div>
      </div>
    </Layout>
  )
}
