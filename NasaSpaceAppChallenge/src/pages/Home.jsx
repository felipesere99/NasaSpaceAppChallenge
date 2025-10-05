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
        <h1 className="home-title">Explora Patrones Climáticos Mundiales</h1>
        <p className="home-sub">Utilizando datos avanzados de satélites de la NASA para predecir condiciones meteorológicas</p>
        <button className="home-cta" onClick={onStart}>
          <Rocket size={18} />
          Verificar mi Clima
          <Zap size={16} />
        </button>
        <div className="home-features">
          <div className="feature">
            <Satellite size={20} />
            <span>Datos Satelitales</span>
          </div>
          <div className="feature">
            <MapPin size={20} />
            <span>Basado en Ubicación</span>
          </div>
        </div>
      </header>
    </div>
  )
}
