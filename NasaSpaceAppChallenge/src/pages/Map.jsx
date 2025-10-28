import React from 'react'
import './Map.css'
import MapPicker from '../components/MapPicker.jsx'
import { ArrowLeft, Activity, MapPin } from 'lucide-react'

export default function MapPage({ onBack, coords, setCoords, onCalculate }) {
  return (
    <div className="map-page">
      <div className="map-header">
        <button className="map-back" onClick={onBack}>
          <ArrowLeft size={18} />
          Atrás
        </button>
        <h2>Selecciona tu ubicación</h2>
      </div>

      <div className="map-body">
        <MapPicker onSelect={setCoords} />
      </div>

      <div className="map-actions">
        <button 
          className="calculate-button" 
          onClick={onCalculate} 
          disabled={!coords}
        >
          <Activity size={18} />
          Calcular Pronóstico
        </button>
      </div>

      {coords && (
        <div className="coords">
          <MapPin size={16} />
          <strong>Lat:</strong> {coords.lat.toFixed(4)}
          {' '}<strong>Lng:</strong> {coords.lng.toFixed(4)}
        </div>
      )}
    </div>
  )
}
