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
  CheckCircle
} from "lucide-react";
import "./Results.css";

export default function Results({ coords, dates }) {
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
        setError("Error al obtener los datos meteorológicos");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [coords, dates]);

  const formatRange = (range) => {
    return `${range.min} - ${range.max}`;
  };

  return (
    <div className="results-root">
      <div className="results-header">
        <button className="results-back" onClick={() => navigate("/")}>
          <ArrowLeft size={18} />
          Volver al inicio
        </button>
        <h1 className="results-title">Resultados del Pronóstico</h1>
        <p className="results-subtitle">
          Análisis meteorológico para la ubicación seleccionada
        </p>
      </div>

      {loading && (
        <div className="results-loading">
          <div className="results-spinner">
            <Activity size={24} />
          </div>
          <p>Analizando datos meteorológicos...</p>
        </div>
      )}

      {error && (
        <div className="results-error">
          <h3>
            <AlertTriangle size={20} />
            Error
          </h3>
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && weather && (
        <div className="results-content">
          {/* Header Card */}
          <div className="results-card results-overview">
            <h3>
              <Activity size={20} />
              Información General
            </h3>
            <div className="overview-grid">
              <div className="overview-item">
                <Calendar size={18} />
                <span className="overview-label">Fecha</span>
                <span className="overview-value">{weather.date}</span>
              </div>
              <div className="overview-item">
                <CheckCircle size={18} />
                <span className="overview-label">Tipo</span>
                <span className="overview-value">
                  {weather.type === "forecast" ? "Pronóstico" : "Histórico"}
                </span>
              </div>
              <div className="overview-item">
                <MapPin size={18} />
                <span className="overview-label">Ubicación</span>
                <span className="overview-value">
                  {weather.location.latitude.toFixed(4)}, {weather.location.longitude.toFixed(4)}
                </span>
              </div>
              {weather.confidence && (
                <div className="overview-item">
                  <TrendingUp size={18} />
                  <span className="overview-label">Confianza</span>
                  <span className="overview-value confidence">
                    {weather.confidence.toFixed(1)}%
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Temperature Card */}
          <div className="results-card">
            <h3>
              <Thermometer size={20} />
              Temperatura
            </h3>
            <div className="weather-metrics">
              {weather.type === "forecast" && weather.predicted ? (
                <>
                  <div className="metric">
                    <div className="metric-header">
                      <span className="metric-label">Máxima</span>
                      <span className="metric-value primary">
                        {weather.predicted.temperature.max.value}°C
                      </span>
                    </div>
                    <div className="metric-range">
                      Rango: {formatRange(weather.predicted.temperature.max.range)}°C
                    </div>
                  </div>
                  <div className="metric">
                    <div className="metric-header">
                      <span className="metric-label">Mínima</span>
                      <span className="metric-value secondary">
                        {weather.predicted.temperature.min.value}°C
                      </span>
                    </div>
                    <div className="metric-range">
                      Rango: {formatRange(weather.predicted.temperature.min.range)}°C
                    </div>
                  </div>
                </>
              ) : (
                <div className="metric">
                  <div className="metric-header">
                    <span className="metric-label">Promedio</span>
                    <span className="metric-value primary">
                      {weather.temperature?.avg}°C
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Wind Card */}
          <div className="results-card">
            <h3>
              <Wind size={20} />
              Viento
            </h3>
            <div className="weather-metrics">
              <div className="metric">
                <div className="metric-header">
                  <span className="metric-label">Velocidad</span>
                  <span className="metric-value primary">
                    {weather.type === "forecast" && weather.predicted
                      ? `${weather.predicted.wind_speed.value} m/s`
                      : `${weather.wind_speed} m/s`
                    }
                  </span>
                </div>
                {weather.type === "forecast" && weather.predicted?.wind_speed.range && (
                  <div className="metric-range">
                    Rango: {formatRange(weather.predicted.wind_speed.range)} m/s
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Precipitation Card */}
          <div className="results-card">
            <h3>
              <CloudRain size={20} />
              Precipitación
            </h3>
            <div className="weather-metrics">
              {weather.type === "forecast" && weather.predicted ? (
                <>
                  <div className="metric">
                    <div className="metric-header">
                      <span className="metric-label">Probabilidad de lluvia</span>
                      <span className="metric-value primary">
                        {weather.predicted.precipitation.probability_of_rain}%
                      </span>
                    </div>
                  </div>
                  <div className="metric">
                    <div className="metric-header">
                      <span className="metric-label">Cantidad esperada</span>
                      <span className="metric-value secondary">
                        {weather.predicted.precipitation.expected_mm} mm
                      </span>
                    </div>
                    <div className="metric-range">
                      Rango: {formatRange(weather.predicted.precipitation.range)} mm
                    </div>
                  </div>
                </>
              ) : (
                <div className="metric">
                  <div className="metric-header">
                    <span className="metric-label">Cantidad</span>
                    <span className="metric-value primary">
                      {weather.precipitation} mm
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Humidity Card */}
          <div className="results-card">
            <h3>
              <Droplets size={20} />
              Humedad
            </h3>
            <div className="weather-metrics">
              <div className="metric">
                <div className="metric-header">
                  <span className="metric-label">Nivel</span>
                  <span className="metric-value primary">
                    {weather.type === "forecast" && weather.predicted
                      ? `${weather.predicted.humidity.value}%`
                      : `${weather.humidity}%`
                    }
                  </span>
                </div>
                {weather.type === "forecast" && weather.predicted?.humidity.range && (
                  <div className="metric-range">
                    Rango: {formatRange(weather.predicted.humidity.range)}%
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Additional Info Card */}
          {weather.type === "forecast" && (
            <div className="results-card results-info">
              <h3>
                <Info size={20} />
                Información Adicional
              </h3>
              <div className="info-content">
                {weather.historical_years_analyzed && (
                  <p><strong>Años analizados:</strong> {weather.historical_years_analyzed}</p>
                )}
                {weather.disclaimer && (
                  <div className="disclaimer">
                    <p><strong>Aviso:</strong> {weather.disclaimer}</p>
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
