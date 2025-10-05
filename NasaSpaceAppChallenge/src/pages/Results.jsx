import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getWeatherData } from "../services/weatherApi";
import "./Results.css";

export default function Results({ coords, dates }) {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchData() {
      if (!coords || !dates.from) return;
      setLoading(true);
      try {
        const data = await getWeatherData(coords.lat, coords.lng, dates.from);
        setWeather(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [coords, dates]);

  return (
    <div style={{ padding: 24 }}>
      <button onClick={() => navigate("/")} style={{ marginBottom: 12 }}>
        ← Back to Home
      </button>

      <h2>Results</h2>

      {loading && <p>Loading weather data...</p>}

      {!loading && weather && (
        <div>
          <h3>Date: {weather.date}</h3>
          <p>
            📍 Location: {weather.location.latitude.toFixed(2)},{" "}
            {weather.location.longitude.toFixed(2)}
          </p>

          {weather.type === "historical" && (
            <>
              <p>🌡️ Temperature: {weather.temperature.avg} °C</p>
              <p>💨 Wind Speed: {weather.wind_speed} m/s</p>
              <p>💧 Humidity: {weather.humidity} %</p>
              <p>🌧️ Precipitation: {weather.precipitation} mm</p>
            </>
          )}

          {weather.type === "forecast" && (
            <>
              <h4>Predicted Forecast</h4>
              <p>🌡️ Avg Temp: {weather.predicted.temperature.max.value} °C</p>
              <p>💨 Wind: {weather.predicted.wind_speed.value} m/s</p>
              <p>
                🌧️ Rain probability:{" "}
                {weather.predicted.precipitation.probability_of_rain}%
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
