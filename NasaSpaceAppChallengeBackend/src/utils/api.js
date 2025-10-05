const axios = require('axios');

const apiClient = axios.create({
  // power api de la NASA publica sin api key
  baseURL: 'https://power.larc.nasa.gov/api/temporal/daily/point',
  timeout: 10000,
});

module.exports = { apiClient };
