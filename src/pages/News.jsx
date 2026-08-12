import { useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import Layout from '../components/Layout'
import NewsFilters from '../components/NewsFilters'
import NewsList from '../components/NewsList'
import MetaTags from '../components/MetaTags'
import news from '../data/news.json'
import briefs from '../data/briefs.json'

function formatBriefDate(dateStr) {
  const today = new Date().toISOString().slice(0, 10)
  if (dateStr === today) return "Today's"
  return new Date(`${dateStr}T12:00:00Z`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + "'s"
}

export default function News() {
  const [searchParams, setSearchParams] = useSearchParams()
  const category = searchParams.get('category') || 'all'
  const source = searchParams.get('source') || 'all'

  const handleCategoryChange = (newCategory) => {
    const params = new URLSearchParams(searchParams)
    if (newCategory === 'all') {
      params.delete('category')
    } else {
      params.set('category', newCategory)
    }
    setSearchParams(params)
  }

  const handleSourceChange = (newSource) => {
    const params = new URLSearchParams(searchParams)
    if (newSource === 'all') {
      params.delete('source')
    } else {
      params.set('source', newSource)
    }
    setSearchParams(params)
  }

  const sources = useMemo(
    () => [...new Set(news.map(item => item.source.name))].sort(),
    []
  )

  const filteredNews = useMemo(() => {
    return news
      .filter(item => {
        if (category !== 'all' && item.category !== category) return false
        if (source !== 'all' && item.source.name !== source) return false
        return true
      })
      .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
  }, [category, source])

  return (
    <Layout>
      <MetaTags
        title="Cybersecurity News"
        description="Curated cybersecurity and AI security news for MSPs, IT admins, and security pros. Hand-picked sources, no noise, updated every 6 hours."
        path="/news"
      />
      <div
        style={{
          maxWidth: '800px',
          margin: '0 auto',
          padding: '40px 20px'
        }}
      >
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
            News
          </h1>
          <p
            style={{
              fontSize: '16px',
              color: 'rgba(255,255,255,0.6)',
              margin: '8px 0 0 0',
              fontFamily: "'Outfit', sans-serif"
            }}
          >
            The security stories worth your time, curated for MSPs and IT pros
          </p>
        </div>

        {/* Latest Brief Banner */}
        {briefs.length > 0 && (
          <Link
            to={`/brief/${briefs[0].slug}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '12px',
              padding: '14px 16px',
              marginBottom: '24px',
              textDecoration: 'none',
              transition: 'border-color 0.2s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)'}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'}
          >
            <span
              style={{
                padding: '3px 8px',
                borderRadius: '4px',
                fontSize: '11px',
                fontFamily: '"JetBrains Mono", monospace',
                fontWeight: 500,
                textTransform: 'uppercase',
                background: 'rgba(255,255,255,0.1)',
                color: 'rgba(255,255,255,0.9)',
                flexShrink: 0
              }}
            >
              {formatBriefDate(briefs[0].date)} Brief
            </span>
            <span
              style={{
                fontSize: '14px',
                color: 'rgba(255,255,255,0.8)',
                fontWeight: 500,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                flex: 1
              }}
            >
              {briefs[0].title}
            </span>
            <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', flexShrink: 0 }}>→</span>
          </Link>
        )}

        {/* Filters */}
        <NewsFilters
          category={category}
          onCategoryChange={handleCategoryChange}
          source={source}
          onSourceChange={handleSourceChange}
          sources={sources}
        />

        {/* News List */}
        <div style={{ marginTop: '24px' }}>
          <NewsList items={filteredNews} />
        </div>
      </div>
    </Layout>
  )
}
