import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getWeatherData } from "../services/weatherApi";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Thermometer,
  Wind,
  CloudRain,
  Droplets,
  Activity,
  TrendingUp,
  Info,
  AlertTriangle,
  CheckCircle,
  MessageSquareQuote,
  Download,
  FileText,
  Database,
} from "lucide-react";
import "./Results.css";

export default function Results({ coords, dates, selectedMetrics }) {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location.state;

  useEffect(() => {
    async function fetchData() {
      const finalCoords = locationState?.latitude 
        ? { lat: locationState.latitude, lng: locationState.longitude }
        : coords;
      
      const finalDate = locationState?.date || dates.from;

      if (!finalCoords || !finalDate) return;
      setLoading(true);
      setError(null);
      try {
        const data = await getWeatherData(finalCoords.lat, finalCoords.lng, finalDate);
        setWeather(data);
      } catch (error) {
        console.error(error);
        setError("Error fetching weather data");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [coords, dates, locationState]);

  const formatRange = (range) => {
    if (!range) return "—";
    return `${range.min} - ${range.max}`;
  };

  // Interpretación en lenguaje natural
  function interpretWeather(weather) {
    if (!weather) return "Sin datos disponibles";
    
    const messages = [];
    const isForecast = weather.type === "forecast" || weather.type === "forecast_real";

    let temp = 0;
    if (isForecast && weather.predicted?.temperature) {
      temp = (weather.predicted.temperature.max.value + weather.predicted.temperature.min.value) / 2;
    } else if (weather.temperature) {
      temp = (weather.temperature.max + weather.temperature.min) / 2;
    }

    const wind = isForecast
      ? weather.predicted?.wind_speed?.value || 0
      : weather.wind_speed || 0;

    const rain = isForecast
      ? weather.predicted?.precipitation?.expected_mm || weather.predicted?.precipitation?.probability_of_rain || 0
      : weather.precipitation || 0;

    const humidity = isForecast
      ? weather.predicted?.humidity?.value || 0
      : weather.humidity || 0;

    if (temp > 30) messages.push("Hace mucho calor 🔥");
    else if (temp >= 25) messages.push("El día será cálido ☀️");
    else if (temp >= 18) messages.push("Temperaturas agradables 🌤️");
    else if (temp >= 10) messages.push("Día fresco 🌥️");
    else messages.push("Clima frío 🧊");

    if (wind > 7) messages.push("Habrá mucho viento 💨");
    else if (wind > 4) messages.push("Algo de viento 🌬️");
    else messages.push("Poco viento 🍃");

    if (rain > 5) messages.push("Probabilidad de lluvia fuerte 🌧️");
    else if (rain > 1) messages.push("Posibles lloviznas ☔");
    else messages.push("Sin lluvias 🌞");

    if (humidity > 80) messages.push("Ambiente muy húmedo 💦");
    else if (humidity > 60) messages.push("Humedad moderada 🌫️");
    else messages.push("Ambiente seco 🌵");

    return messages.join(" • ");
  }

  const downloadJSON = () => {
    const dataToDownload = {
      ...weather,
      selectedMetrics,
      downloadDate: new Date().toISOString(),
    };
    
    const blob = new Blob([JSON.stringify(dataToDownload, null, 2)], {
      type: 'application/json',
    });
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `weather-forecast-${weather.date}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const downloadCSV = () => {
    const csvData = [];
    
    csvData.push(['Metric', 'Value', 'Unit', 'Range Min', 'Range Max']);
    
    csvData.push(['Date', weather.date, '', '', '']);
    csvData.push(['Type', weather.type, '', '', '']);
    csvData.push(['Latitude', weather.location.latitude, '°', '', '']);
    csvData.push(['Longitude', weather.location.longitude, '°', '', '']);
    
    if (weather.confidence) {
      csvData.push(['Confidence', weather.confidence, '%', '', '']);
    }
    
    if (selectedMetrics.temperature && weather.predicted?.temperature) {
      csvData.push(['Temperature Max', weather.predicted.temperature.max.value, '°C', 
                   weather.predicted.temperature.max.range.min, weather.predicted.temperature.max.range.max]);
      csvData.push(['Temperature Min', weather.predicted.temperature.min.value, '°C', 
                   weather.predicted.temperature.min.range.min, weather.predicted.temperature.min.range.max]);
    }
    
    if (selectedMetrics.wind && weather.predicted?.wind_speed) {
      csvData.push(['Wind Speed', weather.predicted.wind_speed.value, 'm/s', 
                   weather.predicted.wind_speed.range.min, weather.predicted.wind_speed.range.max]);
    }
    
    if (selectedMetrics.precipitation && weather.predicted?.precipitation) {
      csvData.push(['Rain Probability', weather.predicted.precipitation.probability_of_rain, '%', '', '']);
      csvData.push(['Expected Precipitation', weather.predicted.precipitation.expected_mm, 'mm', 
                   weather.predicted.precipitation.range.min, weather.predicted.precipitation.range.max]);
    }
    
    if (selectedMetrics.humidity && weather.predicted?.humidity) {
      csvData.push(['Humidity', weather.predicted.humidity.value, '%', 
                   weather.predicted.humidity.range.min, weather.predicted.humidity.range.max]);
    }
    
    const csvContent = csvData.map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `weather-forecast-${weather.date}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };


  return (
    <div className="results-root">
      {/* Header */}
      <div className="results-header">
        <button className="results-back" onClick={() => navigate("/")}>
          <ArrowLeft size={18} />
          Back to Home
        </button>
        <h1 className="results-title">Weather Forecast Results</h1>
        <p className="results-subtitle">
          Meteorological analysis for the selected location
        </p>
        
        {/* Download buttons - show only when data is available */}
        {!loading && !error && weather && (
          <div className="download-actions">
            <button className="download-btn json-btn" onClick={downloadJSON}>
              <Database size={16} />
              Download JSON
            </button>
            <button className="download-btn csv-btn" onClick={downloadCSV}>
              <FileText size={16} />
              Download CSV
            </button>
          </div>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="results-loading">
          <div className="results-spinner">
            <Activity size={24} />
          </div>
          <p>Analyzing weather data...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="results-error">
          <h3>
            <AlertTriangle size={20} />
            Error
          </h3>
          <p>{error}</p>
        </div>
      )}

      {/* Data Results */}
      {!loading && !error && weather && (
        <div className="results-content">
          {/* Overview Card */}
          <div className="results-card results-overview">
            <h3>
              <Activity size={20} />
              General Information
            </h3>
            <div className="overview-grid">
              <div className="overview-item">
                <Calendar size={18} />
                <span className="overview-label">Date</span>
                <span className="overview-value">{weather.date}</span>
              </div>
              <div className="overview-item">
                <CheckCircle size={18} />
                <span className="overview-label">Type</span>
                <span className="overview-value">
                  {weather.type === "forecast" || weather.type === "forecast_real" 
                    ? "Forecast" 
                    : weather.type === "historical" 
                    ? "Historical" 
                    : weather.type}
                </span>
              </div>
              <div className="overview-item">
                <MapPin size={18} />
                <span className="overview-label">Location</span>
                <span className="overview-value">
                  {weather.location.latitude.toFixed(4)},{" "}
                  {weather.location.longitude.toFixed(4)}
                </span>
              </div>
              {weather.confidence && (
                <div className="overview-item">
                  <TrendingUp size={18} />
                  <span className="overview-label">Confidence</span>
                  <span className="overview-value confidence">
                    {weather.confidence.toFixed(1)}%
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="results-card results-interpretation">
            <h3>
              <MessageSquareQuote size={20} />
              Weather Summary
            </h3>
            <p className="interpretation-text">
              {interpretWeather(weather)}
            </p>
          </div>

          {/* Temperature Card */}
          {selectedMetrics.temperature && (
            <div className="results-card">
              <h3>
                <Thermometer size={20} />
                Temperature
              </h3>
              <div className="weather-metrics">
                {(weather.type === "forecast" || weather.type === "forecast_real") && weather.predicted ? (
                  <>
                    <div className="metric">
                      <div className="metric-header">
                        <span className="metric-label">Maximum</span>
                        <span className="metric-value hot">
                          {weather.predicted.temperature?.max?.value || 'N/A'}°C
                        </span>
                      </div>
                      {weather.predicted.temperature?.max?.range && (
                        <div className="metric-range">
                          Range:{" "}
                          {formatRange(weather.predicted.temperature.max.range)}°C
                        </div>
                      )}
                    </div>
                    <div className="metric">
                      <div className="metric-header">
                        <span className="metric-label">Minimum</span>
                        <span className="metric-value cold">
                          {weather.predicted.temperature?.min?.value || 'N/A'}°C
                        </span>
                      </div>
                      {weather.predicted.temperature?.min?.range && (
                        <div className="metric-range">
                          Range:{" "}
                          {formatRange(weather.predicted.temperature.min.range)}°C
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="metric">
                    <div className="metric-header">
                      <span className="metric-label">Average</span>
                      <span className="metric-value primary">
                        {weather.temperature?.avg || 'N/A'}°C
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Wind Card */}
          {selectedMetrics.wind_speed && (
            <div className="results-card">
              <h3>
                <Wind size={20} />
                Wind
              </h3>
              <div className="weather-metrics">
                <div className="metric">
                  <div className="metric-header">
                    <span className="metric-label">Speed</span>
                    <span className="metric-value primary">
                      {(weather.type === "forecast" || weather.type === "forecast_real") && weather.predicted
                        ? `${weather.predicted.wind_speed?.value || 'N/A'} m/s`
                        : `${weather.wind_speed || 'N/A'} m/s`}
                    </span>
                  </div>
                  {(weather.type === "forecast" || weather.type === "forecast_real") &&
                    weather.predicted?.wind_speed?.range && (
                      <div className="metric-range">
                        Range: {formatRange(weather.predicted.wind_speed.range)}{" "}
                        m/s
                      </div>
                    )}
                </div>
              </div>
            </div>
          )}

          {/* Precipitation Card */}
          {selectedMetrics.precipitation && (
            <div className="results-card">
              <h3>
                <CloudRain size={20} />
                Precipitation
              </h3>
              <div className="weather-metrics">
                {(weather.type === "forecast" || weather.type === "forecast_real") && weather.predicted ? (
                  <>
                    <div className="metric">
                      <div className="metric-header">
                        <span className="metric-label">Rain Probability</span>
                        <span className="metric-value primary">
                          {weather.predicted.precipitation?.probability_of_rain || 'N/A'}%
                        </span>
                      </div>
                    </div>
                    <div className="metric">
                      <div className="metric-header">
                        <span className="metric-label">Expected Amount</span>
                        <span className="metric-value secondary">
                          {weather.predicted.precipitation?.expected_mm || 'N/A'} mm
                        </span>
                      </div>
                      {weather.predicted.precipitation?.range && (
                        <div className="metric-range">
                          Range:{" "}
                          {formatRange(weather.predicted.precipitation.range)} mm
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="metric">
                    <div className="metric-header">
                      <span className="metric-label">Amount</span>
                      <span className="metric-value primary">
                        {weather.precipitation || 'N/A'} mm
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Humidity Card */}
          {selectedMetrics.humidity && (
            <div className="results-card">
              <h3>
                <Droplets size={20} />
                Humidity
              </h3>
              <div className="weather-metrics">
                <div className="metric">
                  <div className="metric-header">
                    <span className="metric-label">Level</span>
                    <span className="metric-value primary">
                      {(weather.type === "forecast" || weather.type === "forecast_real") && weather.predicted
                        ? `${weather.predicted.humidity?.value || 'N/A'}%`
                        : `${weather.humidity || 'N/A'}%`}
                    </span>
                  </div>
                  {(weather.type === "forecast" || weather.type === "forecast_real") &&
                    weather.predicted?.humidity?.range && (
                      <div className="metric-range">
                        Range: {formatRange(weather.predicted.humidity.range)}%
                      </div>
                    )}
                </div>
              </div>
            </div>
          )}

          {/* Extra Info */}
          {(weather.type === "forecast" || weather.type === "forecast_real") && (
            <div className="results-card results-info">
              <h3>
                <Info size={20} />
                Additional Information
              </h3>
              <div className="info-content">
                {weather.historical_years_analyzed && (
                  <p>
                    <strong>Years analyzed:</strong>{" "}
                    {weather.historical_years_analyzed}
                  </p>
                )}
                {weather.source && (
                  <p>
                    <strong>Source:</strong> {weather.source}
                  </p>
                )}
                {weather.disclaimer && (
                  <div className="disclaimer">
                    <p>
                      <strong>Disclaimer:</strong> {weather.disclaimer}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
