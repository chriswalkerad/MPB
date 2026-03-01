import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Homepage from './pages/Homepage'
import Bunker from './pages/Bunker'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/bunker" element={<Bunker />} />
        {/* Placeholder routes for future pages */}
        <Route path="/events" element={<div style={{ color: 'white', padding: 40 }}>Events page coming soon</div>} />
        <Route path="/submit" element={<div style={{ color: 'white', padding: 40 }}>Submit page coming soon</div>} />
      </Routes>
    </BrowserRouter>
  )
}
