const { apiClient } = require('../utils/api');
const { fetchWeatherForecast, isDateInFuture } = require('./forecastService');

const fetchHistoricalWeather = async (latitude, longitude, date) => {
  const dateFormatted = date.replace(/-/g, '');
  
  const response = await apiClient.get('', {
    params: {
      latitude: latitude,
      longitude: longitude,
      start: dateFormatted,
      end: dateFormatted,
      community: 'AG',
      parameters: 'T2M_MAX,T2M_MIN,WS10M,PRECTOTCORR,RH2M',
      format: 'JSON'
    },
  });
  
  const data = response.data.properties.parameter;
  
  return {
    date: date,
    type: 'historical',
    location: {
      latitude: latitude,
      longitude: longitude
    },
    temperature: {
      max: data.T2M_MAX[dateFormatted],
      min: data.T2M_MIN[dateFormatted]
    },
    wind_speed: data.WS10M[dateFormatted],
    precipitation: data.PRECTOTCORR[dateFormatted],
    humidity: data.RH2M[dateFormatted]
  };
};

const fetchWeather = async (latitude, longitude, date) => {
  if (isDateInFuture(date)) {
    return await fetchWeatherForecast(latitude, longitude, date);
  } else {
    return await fetchHistoricalWeather(latitude, longitude, date);
  }
};

module.exports = { fetchWeather };