import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Homepage from './pages/Homepage'
import Bunker from './pages/Bunker'
import ExploreEvents from './pages/ExploreEvents'
import CategoryPage from './pages/CategoryPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/bunker" element={<Bunker />} />
        <Route path="/events" element={<ExploreEvents />} />
        <Route path="/events/category/:slug" element={<CategoryPage />} />
        <Route path="/submit" element={<div style={{ color: 'white', padding: 40 }}>Submit page coming soon</div>} />
      </Routes>
    </BrowserRouter>
  )
}
