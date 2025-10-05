import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import './App.css'
import Home from './pages/Home.jsx'
import Dates from './pages/Dates.jsx'
import MapPage from './pages/Map.jsx'
import Results from './pages/Results.jsx'

function App() {
  const [coords, setCoords] = useState(null)
  const [dates, setDates] = useState({ from: null, to: null })

  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomeWrapper />} />
        <Route path="/dates" element={<DatesWrapper dates={dates} setDates={setDates} />} />
        <Route path="/map" element={<MapWrapper coords={coords} setCoords={setCoords} />} />
        <Route path="/results" element={<Results coords={coords} dates={dates} />} />
      </Routes>
    </Router>
  )
  
}


function HomeWrapper() {
  const navigate = useNavigate()
  return <Home onStart={() => navigate('/dates')} />
}

function DatesWrapper({ dates, setDates }) {
  const navigate = useNavigate()
  return (
    <Dates
      onBack={() => navigate('/')}
      dates={dates}
      setDates={setDates}
      onNext={() => navigate('/map')}
    />
  )
}

function MapWrapper({ coords, setCoords }) {
  const navigate = useNavigate()
  return (
    <MapPage
      onBack={() => navigate('/dates')}
      coords={coords}
      setCoords={setCoords}
      onCalculate={() => navigate('/results')}
    />
  )
}
export default App