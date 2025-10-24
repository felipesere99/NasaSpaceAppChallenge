import { test } from 'node:test'
import assert from 'node:assert/strict'
import { formatRange, interpretWeather } from '../src/utils/weather.js'

test('formatRange returns formatted string when min and max exist', () => {
  const result = formatRange({ min: 10, max: 20 })
  assert.equal(result, '10 - 20')
})

test('formatRange returns em dash when range is missing', () => {
  assert.equal(formatRange(null), '—')
  assert.equal(formatRange({}), '—')
})

test('interpretWeather describes hot and stormy forecast', () => {
  const forecast = {
    type: 'forecast',
    predicted: {
      temperature: {
        max: { value: 35, range: { min: 30, max: 38 } },
        min: { value: 28, range: { min: 26, max: 30 } }
      },
      wind_speed: { value: 8 },
      precipitation: { expected_mm: 6 },
      humidity: { value: 85 }
    }
  }

  const message = interpretWeather(forecast)
  assert.match(message, /Hace mucho calor 🔥/)
  assert.match(message, /Habrá mucho viento 💨/)
  assert.match(message, /Probabilidad de lluvia fuerte 🌧️/)
  assert.match(message, /Ambiente muy húmedo 💦/)
})

test('interpretWeather describes mild and dry forecast', () => {
  const forecast = {
    type: 'forecast_real',
    predicted: {
      temperature: {
        max: { value: 22 },
        min: { value: 18 }
      },
      wind_speed: { value: 2 },
      precipitation: { expected_mm: 0 },
      humidity: { value: 40 }
    }
  }

  const message = interpretWeather(forecast)
  assert.match(message, /Temperaturas agradables 🌤️/)
  assert.match(message, /Poco viento 🍃/)
  assert.match(message, /Sin lluvias 🌞/)
  assert.match(message, /Ambiente seco 🌵/)
})

test('interpretWeather handles historical cold weather data', () => {
  const record = {
    type: 'historical',
    temperature: { max: 8, min: 2 },
    wind_speed: 5,
    precipitation: 2,
    humidity: 65
  }

  const message = interpretWeather(record)
  assert.match(message, /Clima frío 🧊/)
  assert.match(message, /Algo de viento 🌬️/)
  assert.match(message, /Posibles lloviznas ☔/)
  assert.match(message, /Humedad moderada 🌫️/)
})

test('interpretWeather returns fallback message when weather is missing', () => {
  const message = interpretWeather(null)
  assert.equal(message, 'Sin datos disponibles')
})
