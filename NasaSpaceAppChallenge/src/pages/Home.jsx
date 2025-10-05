import React from 'react'
import './Home.css'
import { Rocket, Zap, Satellite, MapPin, Calendar } from 'lucide-react'

export default function Home({ onStart }) {
  return (
    <div className="home-container">
      <header className="home-header">
        <div className="logos">
          <img src="./src/img/NASA.png" alt="NASA" className="logo nasa-logo" />
          <img src="./src/img/UCU.png" alt="UCU" className="logo ucu-logo" />
        </div>
        <h1 className="home-title">Explore Global Weather Patterns</h1>
        <p className="home-sub">Using advanced NASA satellite data to predict weather conditions</p>
        <button className="home-cta" onClick={onStart}>
          <Rocket size={18} />
          Check My Weather
          <Zap size={16} />
        </button>
        <div className="home-features">
          <div className="feature">
            <Satellite size={20} />
            <span>Satellite Data</span>
          </div>
          <div className="feature">
            <MapPin size={20} />
            <span>Location Based</span>
          </div>
        </div>
      </header>
    </div>
  )
}
