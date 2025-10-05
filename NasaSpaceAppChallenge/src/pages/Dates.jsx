import React, { useState } from "react";
import "./Dates.css";
import Modal from "../components/Modal";
import MapPicker from "../components/MapPicker";
import { Map } from 'lucide-react';


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
      <h1 className="weather-title">Weather Guru</h1>

      <div className="weather-card">
        <div className="weather-row">
          <label>
            Date
            <input
              type="date"
              value={dates.from || ""}
              onChange={(e) => setDates({ ...dates, from: e.target.value })}
            />
          </label>

          <label>
            Location
            <button
              className="map-btn"
              onClick={() => setIsModalOpen(true)}
            >
              <Map size={20} style={{ marginRight: 6 }} />
            </button>
          </label>
        </div>

        {/* Muestra la ubicación elegida debajo */}
        {location && (
          <p className="selected-location">
            📍 {location.lat.toFixed(2)}, {location.lng.toFixed(2)}
          </p>
        )}

        <div className="weather-row checkboxes">
          <label>
            <input
              type="checkbox"
              checked={selected.wind}
              onChange={() => toggle("wind")}
            />{" "}
            Wind
          </label>
          <label>
            <input
              type="checkbox"
              checked={selected.precipitation}
              onChange={() => toggle("precipitation")}
            />{" "}
            Precipitation
          </label>
          <label>
            <input
              type="checkbox"
              checked={selected.temperature}
              onChange={() => toggle("temperature")}
            />{" "}
            Temperature
          </label>
          <label>
            <input
              type="checkbox"
              checked={selected.cloud}
              onChange={() => toggle("cloud")}
            />{" "}
            Cloud cover
          </label>
        </div>

        <button
          className="forecast-btn"
          onClick={onNext}
          disabled={!dates.from || !location}
        >
          Get forecast!
        </button>
      </div>

      {/* Modal con el mapa */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <h3 style={{ textAlign: "center" }}>Selecciona tu ubicación</h3>
        <MapPicker onSelect={handleLocationSelect} />
      </Modal>
    </div>
  );
}
