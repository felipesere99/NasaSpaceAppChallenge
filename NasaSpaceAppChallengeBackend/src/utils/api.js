const axios = require('axios');

const apiClient = axios.create({
  baseURL: 'link',
  timeout: 5000,
});

module.exports = { apiClient };
