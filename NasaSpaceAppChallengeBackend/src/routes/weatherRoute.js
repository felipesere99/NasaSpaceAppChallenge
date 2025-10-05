const { Router } = require('express');
const { getWeatherByCity } = require('../controllers/weatherController');

const router = Router();

router.get('/', getWeatherByCity);

module.exports = router;
