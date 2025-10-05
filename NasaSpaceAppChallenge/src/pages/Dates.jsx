import React, { useState } from "react";
import "./Dates.css";
import Modal from "../components/Modal";
import MapPicker from "../components/MapPicker";
import { Map, Calendar, Wind, CloudRain, Thermometer, Cloud, MapPin, Activity } from 'lucide-react';


export default function Dates({ onBack, dates, setDates, setCoords, onNext, selectedMetrics, setSelectedMetrics }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [location, setLocation] = useState(null);

  // metricas disponibles desde el back
  const availableMetrics = [
    { key: 'temperature', label: 'Temperature', icon: Thermometer },
    { key: 'wind_speed', label: 'Wind Speed', icon: Wind },
    { key: 'precipitation', label: 'Precipitation', icon: CloudRain },
    { key: 'humidity', label: 'Humidity', icon: Cloud }
  ];

  const toggleMetric = (metricKey) => {
    setSelectedMetrics(prev => ({
      ...prev,
      [metricKey]: !prev[metricKey]
    }));
  };

  const selectAll = () => {
    const allSelected = {};
    availableMetrics.forEach(metric => {
      allSelected[metric.key] = true;
    });
    setSelectedMetrics(allSelected);
  };

  const deselectAll = () => {
    const noneSelected = {};
    availableMetrics.forEach(metric => {
      noneSelected[metric.key] = false;
    });
    setSelectedMetrics(noneSelected);
  };

  const hasSelectedMetrics = Object.values(selectedMetrics).some(Boolean);

  const handleLocationSelect = ({ lat, lng }) => {
    setCoords({ lat, lng });
    setLocation({ lat, lng });
    setIsModalOpen(false);
  };

  return (
    <div className="weather-root">
      <h1 className="weather-title">Weather Forecast Configuration</h1>

      <div className="weather-card">
        <div className="weather-row">
          <label>
            <Calendar size={18} />
            Query Date
            <input
              type="date"
              value={dates.from || ""}
              onChange={(e) => setDates({ ...dates, from: e.target.value })}
            />
          </label>

          <label>
            <MapPin size={18} />
            Location
            <button
              className="map-btn"
              onClick={() => setIsModalOpen(true)}
            >
              <Map size={20} style={{ marginRight: 6 }} />
              Select on Map
            </button>
          </label>
        </div>

        {/* Display selected location */}
        {location && (
          <div className="selected-location">
            <MapPin size={16} />
            <span>Location: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}</span>
          </div>
        )}

        <div className="metrics-section">
          <div className="metrics-header">
            <h3>Select Weather Data</h3>
            <div className="quick-actions">
              <button 
                type="button" 
                className="quick-btn select-all"
                onClick={selectAll}
              >
                Select All
              </button>
              <button 
                type="button" 
                className="quick-btn deselect-all"
                onClick={deselectAll}
              >
                Deselect All
              </button>
            </div>
          </div>
          
          <div className="checkboxes">
            {availableMetrics.map(metric => {
              const IconComponent = metric.icon;
              return (
                <label key={metric.key}>
                  <input
                    type="checkbox"
                    checked={selectedMetrics[metric.key] || false}
                    onChange={() => toggleMetric(metric.key)}
                  />
                  <IconComponent size={16} />
                  {metric.label}
                </label>
              );
            })}
          </div>
        </div>

        <button
          className="forecast-btn"
          onClick={onNext}
          disabled={!dates.from || !location || !hasSelectedMetrics}
        >
          <Activity size={18} />
          Get Forecast
        </button>
      </div>

      {/* Modal with map */}
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
            Select your location
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
