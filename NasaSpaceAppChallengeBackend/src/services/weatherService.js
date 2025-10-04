const { apiClient } = require('../utils/api');

const fetchWeather = async (city) => {
  const response = await apiClient.get(`/weather`, {
    params: { q: city, units: 'metric'},
  });
  // ejeplo, dsp tenemos q ver bien la api de power
  return {
    city: response.data.name,
    temp: response.data.main.temp,
    description: response.data.weather[0].description,
  };
};

module.exports = { fetchWeather };
