import NewsCard from './NewsCard'

function groupNewsByDay(items) {
  const groups = {}
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  items.forEach(item => {
    const day = new Date(item.publishedAt)
    day.setHours(0, 0, 0, 0)

    let label
    if (day.getTime() === today.getTime()) {
      label = 'Today'
    } else if (day.getTime() === yesterday.getTime()) {
      label = 'Yesterday'
    } else {
      label = day.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
    }

    if (!groups[label]) groups[label] = { date: day, items: [] }
    groups[label].items.push(item)
  })

  return Object.entries(groups)
    .sort(([, a], [, b]) => b.date - a.date)
    .map(([label, { items }]) => ({ label, items }))
}

export default function NewsList({ items }) {
  if (!items || items.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '48px 0', color: 'rgba(255,255,255,0.5)' }}>
        No stories match your filters. Try broadening your search.
      </div>
    )
  }

  const grouped = groupNewsByDay(items)

  return (
    <div>
      {grouped.map(group => (
        <div key={group.label} style={{ marginBottom: 32 }}>
          <h3
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: 'rgba(255,255,255,0.5)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: 16
            }}
          >
            {group.label}
          </h3>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 16
            }}
          >
            {group.items.map(item => (
              <NewsCard key={item.slug} item={item} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
