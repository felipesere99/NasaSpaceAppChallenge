import { useState } from 'react'
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthProvider'
import Header from './components/Header'
import Home from './pages/Home.jsx'
import Dates from './pages/Dates.jsx'
import Results from './pages/Results.jsx'
import FavoriteForecast from './pages/FavoriteForecast.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Profile from './pages/Profile.jsx'

function App() {
  const [dates, setDates] = useState({ from: '' })
  const [coords, setCoords] = useState(null)
  const [selectedMetrics, setSelectedMetrics] = useState({
    temperature: false,
    wind_speed: false,
    precipitation: false,
    humidity: false
  })

  return (
    <AuthProvider>
      <BrowserRouter>
        <Header />
        <Routes>
          <Route path="/" element={<HomeWrapper />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/favorite-forecast" element={<FavoriteForecast />} />
          <Route
            path="/dates"
            element={
              <DatesWrapper 
                dates={dates} 
                setDates={setDates} 
                setCoords={setCoords}
                selectedMetrics={selectedMetrics}
                setSelectedMetrics={setSelectedMetrics}
              />
            }
          />
          <Route 
            path="/results" 
            element={
              <Results 
                coords={coords} 
                dates={dates} 
                selectedMetrics={selectedMetrics}
              />
            } 
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

function HomeWrapper() {
  const navigate = useNavigate();
  return <Home onStart={() => navigate("/dates")} />;
}

function DatesWrapper({ dates, setDates, setCoords, selectedMetrics, setSelectedMetrics }) {
  const navigate = useNavigate();
  return (
    <Dates
      onBack={() => navigate("/")}
      dates={dates}
      setDates={setDates}
      setCoords={setCoords}
      onNext={() => navigate("/results")}
      selectedMetrics={selectedMetrics}
      setSelectedMetrics={setSelectedMetrics}
    />
  );
}

export default App;
