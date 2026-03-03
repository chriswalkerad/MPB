import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/react'
import ExploreEvents from './pages/ExploreEvents'
import CategoryPage from './pages/CategoryPage'
import SubmitEvent from './pages/SubmitEvent'
import PastEvents from './pages/PastEvents'

const Homepage = lazy(() => import('./pages/Homepage'))
const Bunker = lazy(() => import('./pages/Bunker'))

export default function App() {
  return (
    <BrowserRouter>
      <Analytics />
      <SpeedInsights />
      <Suspense fallback={<div style={{ background: '#000', width: '100vw', height: '100vh' }} />}>
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/bunker" element={<Bunker />} />
          <Route path="/events" element={<ExploreEvents />} />
          <Route path="/events/category/:slug" element={<CategoryPage />} />
          <Route path="/submit" element={<SubmitEvent />} />
          <Route path="/events/archive" element={<PastEvents />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
