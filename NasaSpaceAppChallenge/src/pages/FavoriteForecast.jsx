import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../utils/api";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Thermometer,
  Wind,
  CloudRain,
  Droplets,
  Activity,
  AlertTriangle,
  Download,
  FileText,
  Database,
} from "lucide-react";
import "./FavoriteForecast.css";

export default function FavoriteForecast() {
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location.state;

  useEffect(() => {
    async function fetchForecast() {
      if (!locationState?.locationId) {
        setError("No location specified");
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const response = await api.get(
          `/favorite-locations/${locationState.locationId}/forecast`
        );
        
        setForecast(response.data);
      } catch {
        setError("Error fetching forecast data");
      } finally {
        setLoading(false);
      }
    }

    fetchForecast();
  }, [locationState?.locationId]);

  const downloadJSON = () => {
    if (!forecast) return;
    const jsonData = JSON.stringify(forecast, null, 2);
    const blob = new Blob([jsonData], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `forecast-${forecast.location.name}-${forecast.daysAhead}days.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const downloadCSV = () => {
    if (!forecast) return;
    const csvData = [];
    
    csvData.push([
      "Date",
      "Temp Max (°C)",
      "Temp Min (°C)",
      "Wind Speed (m/s)",
      "Precipitation (mm)",
      "Humidity (%)",
    ]);

    forecast.forecast.forEach((day) => {
      csvData.push([
        day.date,
        day.temperature.max,
        day.temperature.min,
        day.wind_speed,
        day.precipitation,
        day.humidity,
      ]);
    });

    const csvContent = csvData.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `forecast-${forecast.location.name}-${forecast.daysAhead}days.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getWeatherDescription = (day) => {
    const messages = [];
    const temp = (day.temperature.max + day.temperature.min) / 2;
    const wind = day.wind_speed;
    const rain = day.precipitation;
    const humidity = day.humidity;

    if (temp > 30) messages.push("Muy caluroso 🔥");
    else if (temp >= 25) messages.push("Cálido ☀️");
    else if (temp >= 18) messages.push("Agradable 🌤️");
    else if (temp >= 10) messages.push("Fresco 🌥️");
    else messages.push("Frío 🧊");

    if (wind > 20) messages.push("Mucho viento 💨");
    else if (wind > 10) messages.push("Algo de viento 🌬️");
    else messages.push("Poco viento 🍃");

    if (rain > 10) messages.push("Lluvia fuerte 🌧️");
    else if (rain > 0) messages.push("Lluvia ligera ☔");
    else messages.push("Sin lluvia 🌞");

    if (humidity > 80) messages.push("Muy húmedo 💦");
    else if (humidity > 60) messages.push("Humedad moderada 🌫️");
    else messages.push("Seco 🌵");

    return messages.join(" • ");
  };

  return (
    <div className="favorite-forecast-root">
      {/* Header */}
      <div className="favorite-forecast-header">
        <button className="favorite-forecast-back" onClick={() => navigate("/profile")}>
          <ArrowLeft size={18} />
          Back to Profile
        </button>
        <h1 className="favorite-forecast-title">7-Day Forecast</h1>
        <p className="favorite-forecast-subtitle">
          {forecast && `${forecast.location.name}, ${forecast.location.city}`}
        </p>

        {/* Download buttons */}
        {!loading && !error && forecast && (
          <div className="favorite-forecast-download-actions">
            <button className="favorite-forecast-download-btn json-btn" onClick={downloadJSON}>
              <Database size={16} />
              Download JSON
            </button>
            <button className="favorite-forecast-download-btn csv-btn" onClick={downloadCSV}>
              <FileText size={16} />
              Download CSV
            </button>
          </div>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="favorite-forecast-loading">
          <div className="favorite-forecast-spinner">
            <Activity size={24} />
          </div>
          <p>Loading forecast data...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="favorite-forecast-error">
          <h3>
            <AlertTriangle size={20} />
            Error
          </h3>
          <p>{error}</p>
        </div>
      )}

      {/* Data Results */}
      {!loading && !error && forecast && (
        <div className="favorite-forecast-content">
          {/* Location Info */}
          <div className="favorite-forecast-overview">
            <h3>
              <MapPin size={20} />
              Location Information
            </h3>
            <div className="favorite-forecast-overview-grid">
              <div className="favorite-forecast-overview-item">
                <MapPin size={18} />
                <span className="favorite-forecast-overview-label">Name</span>
                <span className="favorite-forecast-overview-value">{forecast.location.name}</span>
              </div>
              <div className="favorite-forecast-overview-item">
                <Calendar size={18} />
                <span className="favorite-forecast-overview-label">Days Ahead</span>
                <span className="favorite-forecast-overview-value">{forecast.daysAhead}</span>
              </div>
              <div className="favorite-forecast-overview-item">
                <span className="favorite-forecast-overview-label">City</span>
                <span className="favorite-forecast-overview-value">{forecast.location.city}</span>
              </div>
              <div className="favorite-forecast-overview-item">
                <span className="favorite-forecast-overview-label">Country</span>
                <span className="favorite-forecast-overview-value">
                  {forecast.location.country}
                </span>
              </div>
            </div>
          </div>

          {/* 7-Day Forecast Grid */}
          <div className="favorite-forecast-grid-container">
            <div className="favorite-forecast-grid">
              {forecast.forecast.map((day, index) => (
                <div key={index} className="favorite-forecast-card">
                  <div className="favorite-forecast-card-header">
                    <h4>
                      <Calendar size={16} />
                      {day.date}
                    </h4>
                  </div>

                  <div className="favorite-forecast-card-content">
                    <div className="favorite-forecast-metric">
                      <Thermometer size={16} />
                      <div>
                        <span className="favorite-forecast-label">Temperature</span>
                        <span className="favorite-forecast-value">
                          {day.temperature.max}°C / {day.temperature.min}°C
                        </span>
                      </div>
                    </div>

                    <div className="favorite-forecast-metric">
                      <Wind size={16} />
                      <div>
                        <span className="favorite-forecast-label">Wind</span>
                        <span className="favorite-forecast-value">{day.wind_speed} m/s</span>
                      </div>
                    </div>

                    <div className="favorite-forecast-metric">
                      <CloudRain size={16} />
                      <div>
                        <span className="favorite-forecast-label">Precipitation</span>
                        <span className="favorite-forecast-value">{day.precipitation} mm</span>
                      </div>
                    </div>

                    <div className="favorite-forecast-metric">
                      <Droplets size={16} />
                      <div>
                        <span className="favorite-forecast-label">Humidity</span>
                        <span className="favorite-forecast-value">{day.humidity}%</span>
                      </div>
                    </div>

                    <div className="favorite-forecast-description">
                      {getWeatherDescription(day)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Source Info */}
          <div className="favorite-forecast-info">
            <p>
              <strong>Source:</strong> {forecast.source}
            </p>
            <p>
              <strong>Data Updated:</strong> {new Date().toLocaleString()}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
