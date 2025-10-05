import React from 'react'
import './Home.css'

export default function Home({ onStart }) {
  return (
    <div className="home-container">
      <header className="home-header">
        <div className="logos">
          <img src="./src/img/NASA.png" alt="NASA" className="logo nasa-logo" />
          <img src="./src/img/UCU.png" alt="UCU" className="logo ucu-logo" />
        </div>
        <h1 className="home-title">Explore Weather Patterns Worldwide</h1>
        <p className="home-sub">Using NASA's advanced satellite data to predict weather conditions for your outdoor activities</p>
        <button className="home-cta" onClick={onStart}>Check Your Weather</button>
        <div className="home-features">
          <div className="feature">
            <span className="feature-icon">🛰️</span>
            <span>Satellite Data</span>
          </div>
          <div className="feature">
            <span className="feature-icon">📍</span>
            <span>Location Based</span>
          </div>
          <div className="feature">
            <span className="feature-icon">📅</span>
            <span>14-Day Forecast</span>
          </div>
        </div>
      </header>
    </div>
  )
}
