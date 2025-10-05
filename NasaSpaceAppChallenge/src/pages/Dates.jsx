import React, { useState } from 'react'
import './Dates.css'

export default function Dates({ onBack, dates, setDates, onNext }) {
  const [selected, setSelected] = useState({
    wind: false,
    precipitation: false,
    temperature: false,
    cloud: false
  })

  const toggle = field => setSelected(prev => ({ ...prev, [field]: !prev[field] }))

  return (
    <div className="weather-root">
      <h1 className="weather-title">Weather Guru</h1>

      <div className="weather-card">
        <div className="weather-row">
          <label>
            Date
            <input
              type="date"
              value={dates.from || ''}
              onChange={e => setDates({ ...dates, from: e.target.value })}
            />
          </label>

          <label>
            Location
            <button className="map-btn" onClick={() => onNext('map')}>
              map
            </button>
          </label>
        </div>

        <div className="weather-row checkboxes">
          <label><input type="checkbox" checked={selected.wind} onChange={() => toggle('wind')} /> Wind</label>
          <label><input type="checkbox" checked={selected.precipitation} onChange={() => toggle('precipitation')} /> Precipitation</label>
          <label><input type="checkbox" checked={selected.temperature} onChange={() => toggle('temperature')} /> Temperature</label>
          <label><input type="checkbox" checked={selected.cloud} onChange={() => toggle('cloud')} /> Cloud cover</label>
        </div>

        <button className="forecast-btn" onClick={onNext}>
          Get forecast!
        </button>
      </div>
    </div>
  )
}