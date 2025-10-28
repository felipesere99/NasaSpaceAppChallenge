/**
 * Devuelve una representación textual del rango {min, max}.
 * Si falta el rango, regresa em dash.
 */
export function formatRange(range) {
  if (!range || typeof range.min === 'undefined' || typeof range.max === 'undefined') {
    return '—'
  }
  return `${range.min} - ${range.max}`
}

/**
 * Genera un resumen en lenguaje natural de las condiciones climáticas.
 * Acepta tanto objetos históricos como pronósticos (campo type).
 */
export function interpretWeather(weather) {
  if (!weather) return 'Sin datos disponibles'

  const messages = []
  const isForecast = weather.type === 'forecast' || weather.type === 'forecast_real'

  let temp = 0
  if (isForecast && weather.predicted?.temperature) {
    const max = weather.predicted.temperature.max?.value ?? 0
    const min = weather.predicted.temperature.min?.value ?? 0
    temp = (max + min) / 2
  } else if (weather.temperature) {
    const max = weather.temperature.max ?? 0
    const min = weather.temperature.min ?? 0
    temp = (max + min) / 2
  }

  const wind = isForecast
    ? weather.predicted?.wind_speed?.value ?? 0
    : weather.wind_speed ?? 0

  const rain = isForecast
    ? weather.predicted?.precipitation?.expected_mm ??
      weather.predicted?.precipitation?.probability_of_rain ??
      0
    : weather.precipitation ?? 0

  const humidity = isForecast
    ? weather.predicted?.humidity?.value ?? 0
    : weather.humidity ?? 0

  if (temp > 30) messages.push('Hace mucho calor 🔥')
  else if (temp >= 25) messages.push('El día será cálido ☀️')
  else if (temp >= 18) messages.push('Temperaturas agradables 🌤️')
  else if (temp >= 10) messages.push('Día fresco 🌥️')
  else messages.push('Clima frío 🧊')

  if (wind > 7) messages.push('Habrá mucho viento 💨')
  else if (wind > 4) messages.push('Algo de viento 🌬️')
  else messages.push('Poco viento 🍃')

  if (rain > 5) messages.push('Probabilidad de lluvia fuerte 🌧️')
  else if (rain > 1) messages.push('Posibles lloviznas ☔')
  else messages.push('Sin lluvias 🌞')

  if (humidity > 80) messages.push('Ambiente muy húmedo 💦')
  else if (humidity > 60) messages.push('Humedad moderada 🌫️')
  else messages.push('Ambiente seco 🌵')

  return messages.join(' • ')
}
