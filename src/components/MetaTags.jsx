import { useEffect } from 'react'

const SITE_NAME = 'My Printer Broke'
const DEFAULT_DESCRIPTION = 'Discover cybersecurity conferences, meetups, and workshops near you. Find in-person and virtual cyber events across the US.'
const BASE_URL = 'https://myprinterbroke.com'

export default function MetaTags({ title, description, path, image, type = 'website', jsonLd }) {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} | Every Cyber Event Near You`
  const desc = description || DEFAULT_DESCRIPTION
  const url = `${BASE_URL}${path || ''}`
  const img = image || `${BASE_URL}/logo.png`

  useEffect(() => {
    document.title = fullTitle

    const setMeta = (attr, key, value) => {
      let el = document.querySelector(`meta[${attr}="${key}"]`)
      if (!el) {
        el = document.createElement('meta')
        el.setAttribute(attr, key)
        document.head.appendChild(el)
      }
      el.setAttribute('content', value)
    }

    setMeta('name', 'description', desc)
    setMeta('property', 'og:title', fullTitle)
    setMeta('property', 'og:description', desc)
    setMeta('property', 'og:url', url)
    setMeta('property', 'og:image', img)
    setMeta('property', 'og:type', type)
    setMeta('name', 'twitter:title', fullTitle)
    setMeta('name', 'twitter:description', desc)
    setMeta('name', 'twitter:image', img)

    // Set canonical link
    let canonical = document.querySelector('link[rel="canonical"]')
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.setAttribute('rel', 'canonical')
      document.head.appendChild(canonical)
    }
    canonical.setAttribute('href', url)

    // JSON-LD structured data
    let scriptEl = document.querySelector('script[data-meta-jsonld]')
    if (jsonLd) {
      if (!scriptEl) {
        scriptEl = document.createElement('script')
        scriptEl.setAttribute('type', 'application/ld+json')
        scriptEl.setAttribute('data-meta-jsonld', 'true')
        document.head.appendChild(scriptEl)
      }
      scriptEl.textContent = JSON.stringify(jsonLd)
    } else if (scriptEl) {
      scriptEl.remove()
    }

    return () => {
      if (scriptEl && scriptEl.parentNode) scriptEl.remove()
    }
  }, [fullTitle, desc, url, img, type, jsonLd])

  return null
}
