// Event-filter rules shared by /events, the city pages, and the category
// pages, so the listings can never disagree on what counts as upcoming or
// matching.

// An event stays visible for the whole of its start day.
export function todayCutoff() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return today
}

export function isUpcoming(event, cutoff = todayCutoff()) {
  return new Date(event.date) >= cutoff
}

// Hybrid events count as both in-person and virtual.
export function matchesFormat(event, format) {
  if (format === 'all') return true
  if (format === 'in-person') return event.format === 'in-person' || event.format === 'hybrid'
  if (format === 'virtual') return event.format === 'virtual' || event.format === 'hybrid'
  return true
}

export function matchesType(event, type) {
  return type === 'all' || event.type === type
}
