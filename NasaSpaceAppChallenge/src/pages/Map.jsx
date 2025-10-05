import React from 'react'
import './Map.css'
import MapPicker from '../components/MapPicker.jsx'

export default function MapPage({ onBack, coords, setCoords, onCalculate }) {
  return (
    <div className="map-page">
      <div className="map-header">
        <button className="map-back" onClick={onBack}>← Back</button>
        <h2>Select your location</h2>
      </div>

      <div className="map-body">
        <MapPicker onSelect={setCoords} />
      </div>

      <div style={{ marginTop: 12 }}>
        <button className="calculate" onClick={onCalculate} disabled={!coords}>
          Calculate
        </button>
      </div>

      {coords && (
        <div className="coords">
          <strong>📍 Lat:</strong> {coords.lat.toFixed(4)}
          {' '}<strong>Lng:</strong> {coords.lng.toFixed(4)}
        </div>
      )}
    </div>
  )
}
