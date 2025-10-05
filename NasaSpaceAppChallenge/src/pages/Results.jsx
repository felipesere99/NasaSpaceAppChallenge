import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
} from "lucide-react";
import "./Results.css";

export default function Results({ coords, dates, selectedMetrics }) {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchData() {
      if (!coords || !dates.from) return;
      setLoading(true);
      setError(null);
      try {
        const data = await getWeatherData(coords.lat, coords.lng, dates.from);
        setWeather(data);
      } catch (error) {
        console.error(error);
        setError("Error fetching weather data");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [coords, dates]);

  const formatRange = (range) => {
    if (!range) return "—";
    return `${range.min} - ${range.max}`;
  };

  // 🧠 Interpretación en lenguaje natural
  function interpretWeather(weather) {
  const messages = [];
  const isForecast = weather.type === "forecast";

  const temp = isForecast
    ? (weather.predicted.temperature.max.value + weather.predicted.temperature.min.value) / 2
    : (weather.temperature.max + weather.temperature.min) / 2;

  const wind = isForecast
    ? weather.predicted.wind_speed.value
    : weather.wind_speed;

  const rain = isForecast
    ? weather.predicted.precipitation.expected_mm
    : weather.precipitation;

  const humidity = isForecast
    ? weather.predicted.humidity.value
    : weather.humidity;

  // ---- Temperatura ----
  if (temp > 30) messages.push("Hace mucho calor 🔥");
  else if (temp >= 25) messages.push("El día será cálido ☀️");
  else if (temp >= 18) messages.push("Temperaturas agradables 🌤️");
  else if (temp >= 10) messages.push("Día fresco 🌥️");
  else messages.push("Clima frío 🧊");

  // ---- Viento ----
  if (wind > 7) messages.push("Habrá mucho viento 💨");
  else if (wind > 4) messages.push("Algo de viento 🌬️");
  else messages.push("Poco viento 🍃");

  // ---- Precipitación ----
  if (rain > 5) messages.push("Probabilidad de lluvia fuerte 🌧️");
  else if (rain > 1) messages.push("Posibles lloviznas ☔");
  else messages.push("Sin lluvias 🌞");

  // ---- Humedad ----
  if (humidity > 80) messages.push("Ambiente muy húmedo 💦");
  else if (humidity > 60) messages.push("Humedad moderada 🌫️");
  else messages.push("Ambiente seco 🌵");

  return messages.join(" • ");
}


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
                  {weather.type === "forecast" ? "Forecast" : "Historical"}
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

          {/* 🗣️ Interpretación (comentario humano) */}
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
                {weather.type === "forecast" && weather.predicted ? (
                  <>
                    <div className="metric">
                      <div className="metric-header">
                        <span className="metric-label">Maximum</span>
                        <span className="metric-value primary">
                          {weather.predicted.temperature.max.value}°C
                        </span>
                      </div>
                      <div className="metric-range">
                        Range:{" "}
                        {formatRange(weather.predicted.temperature.max.range)}°C
                      </div>
                    </div>
                    <div className="metric">
                      <div className="metric-header">
                        <span className="metric-label">Minimum</span>
                        <span className="metric-value secondary">
                          {weather.predicted.temperature.min.value}°C
                        </span>
                      </div>
                      <div className="metric-range">
                        Range:{" "}
                        {formatRange(weather.predicted.temperature.min.range)}°C
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="metric">
                    <div className="metric-header">
                      <span className="metric-label">Average</span>
                      <span className="metric-value primary">
                        {weather.temperature?.avg}°C
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Wind Card */}
          {selectedMetrics.wind && (
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
                      {weather.type === "forecast" && weather.predicted
                        ? `${weather.predicted.wind_speed.value} m/s`
                        : `${weather.wind_speed} m/s`}
                    </span>
                  </div>
                  {weather.type === "forecast" &&
                    weather.predicted?.wind_speed.range && (
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
                {weather.type === "forecast" && weather.predicted ? (
                  <>
                    <div className="metric">
                      <div className="metric-header">
                        <span className="metric-label">Rain Probability</span>
                        <span className="metric-value primary">
                          {weather.predicted.precipitation.probability_of_rain}%
                        </span>
                      </div>
                    </div>
                    <div className="metric">
                      <div className="metric-header">
                        <span className="metric-label">Expected Amount</span>
                        <span className="metric-value secondary">
                          {weather.predicted.precipitation.expected_mm} mm
                        </span>
                      </div>
                      <div className="metric-range">
                        Range:{" "}
                        {formatRange(weather.predicted.precipitation.range)} mm
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="metric">
                    <div className="metric-header">
                      <span className="metric-label">Amount</span>
                      <span className="metric-value primary">
                        {weather.precipitation} mm
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
                      {weather.type === "forecast" && weather.predicted
                        ? `${weather.predicted.humidity.value}%`
                        : `${weather.humidity}%`}
                    </span>
                  </div>
                  {weather.type === "forecast" &&
                    weather.predicted?.humidity.range && (
                      <div className="metric-range">
                        Range: {formatRange(weather.predicted.humidity.range)}%
                      </div>
                    )}
                </div>
              </div>
            </div>
          )}

          {/* Extra Info */}
          {weather.type === "forecast" && (
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
