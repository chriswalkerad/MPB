import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import Layout from '../components/Layout'
import NewsFilters from '../components/NewsFilters'
import NewsList from '../components/NewsList'
import MetaTags from '../components/MetaTags'
import news from '../data/news.json'

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
