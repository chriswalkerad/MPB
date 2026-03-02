import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/react'
import Homepage from './pages/Homepage'
import Bunker from './pages/Bunker'
import ExploreEvents from './pages/ExploreEvents'
import CategoryPage from './pages/CategoryPage'
import SubmitEvent from './pages/SubmitEvent'
import PastEvents from './pages/PastEvents'

export default function App() {
  return (
    <BrowserRouter>
      <Analytics />
      <SpeedInsights />
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/bunker" element={<Bunker />} />
        <Route path="/events" element={<ExploreEvents />} />
        <Route path="/events/category/:slug" element={<CategoryPage />} />
        <Route path="/submit" element={<SubmitEvent />} />
        <Route path="/events/archive" element={<PastEvents />} />
      </Routes>
    </BrowserRouter>
  )
}
