import React, { useState } from "react";
import "./Dates.css";
import Modal from "../components/Modal";
import MapPicker from "../components/MapPicker";
import { Map, Calendar, Wind, CloudRain, Thermometer, Cloud, MapPin, Activity } from 'lucide-react';


export default function Dates({ onBack, dates, setDates, setCoords, onNext }) {
  const [selected, setSelected] = useState({
    wind: false,
    precipitation: false,
    temperature: false,
    cloud: false,
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [location, setLocation] = useState(null);

  const toggle = (field) =>
    setSelected((prev) => ({ ...prev, [field]: !prev[field] }));

  const handleLocationSelect = ({ lat, lng }) => {
    setCoords({ lat, lng });
    setLocation({ lat, lng });
    setIsModalOpen(false);
  };

  return (
    <div className="weather-root">
      <h1 className="weather-title">Configuración del Pronóstico</h1>

      <div className="weather-card">
        <div className="weather-row">
          <label>
            <Calendar size={18} />
            Fecha de consulta
            <input
              type="date"
              value={dates.from || ""}
              onChange={(e) => setDates({ ...dates, from: e.target.value })}
            />
          </label>

          <label>
            <MapPin size={18} />
            Ubicación
            <button
              className="map-btn"
              onClick={() => setIsModalOpen(true)}
            >
              <Map size={20} style={{ marginRight: 6 }} />
              Seleccionar en Mapa
            </button>
          </label>
        </div>

        {/* Muestra la ubicación elegida debajo */}
        {location && (
          <div className="selected-location">
            <MapPin size={16} />
            <span>Ubicación: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}</span>
          </div>
        )}

        <div className="checkboxes">
          <label>
            <input
              type="checkbox"
              checked={selected.wind}
              onChange={() => toggle("wind")}
            />
            <Wind size={16} />
            Viento
          </label>
          <label>
            <input
              type="checkbox"
              checked={selected.precipitation}
              onChange={() => toggle("precipitation")}
            />
            <CloudRain size={16} />
            Precipitación
          </label>
          <label>
            <input
              type="checkbox"
              checked={selected.temperature}
              onChange={() => toggle("temperature")}
            />
            <Thermometer size={16} />
            Temperatura
          </label>
          <label>
            <input
              type="checkbox"
              checked={selected.cloud}
              onChange={() => toggle("cloud")}
            />
            <Cloud size={16} />
            Cobertura Nubes
          </label>
        </div>

        <button
          className="forecast-btn"
          onClick={onNext}
          disabled={!dates.from || !location}
        >
          <Activity size={18} />
          Obtener Pronóstico
        </button>
      </div>

      {/* Modal con el mapa */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div style={{ 
          textAlign: "center", 
          padding: "2rem",
          background: "transparent"
        }}>
          <h3 style={{ 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center", 
            gap: "0.5rem", 
            margin: "0 0 1.5rem 0",
            color: "var(--text-primary)",
            fontSize: "1.5rem",
            fontWeight: "600"
          }}>
            <Map size={24} />
            Selecciona tu ubicación
          </h3>
          <div style={{ 
            borderRadius: "12px", 
            overflow: "hidden",
            border: "1px solid var(--border-subtle)"
          }}>
            <MapPicker onSelect={handleLocationSelect} />
          </div>
        </div>
      </Modal>
    </div>
  );
}
