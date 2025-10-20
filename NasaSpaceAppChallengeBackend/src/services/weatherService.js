const { apiClient } = require('../utils/api');
const { fetchWeatherForecast, isDateInFuture, isDateToday } = require('./forecastService');

const isDatePast = (dateString) => {
  const inputDate = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return inputDate < today;
};

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
  if (isDatePast(date)) {
    return await fetchHistoricalWeather(latitude, longitude, date);
  }
  
  return await fetchWeatherForecast(latitude, longitude, date);
};

module.exports = { fetchWeather };