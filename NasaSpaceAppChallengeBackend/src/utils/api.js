const axios = require('axios');

const api = axios.create({
  baseURL: 'link',
  timeout: 5000,
});

module.exports = { api };
