const { Router } = require('express');
const { getWeatherByCity } = require('../controllers/weatherController');

const router = Router();

// GET /api/weather?city=Montevideo no sabemos bien todavia
router.get('/', getWeatherByCity);

module.exports = router;
