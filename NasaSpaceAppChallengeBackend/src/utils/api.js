const axios = require('axios');

const apiClient = axios.create({
  baseURL: 'https://power.larc.nasa.gov/api/temporal/daily/point',
  timeout: 10000,
});

module.exports = { apiClient };
