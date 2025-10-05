const { Router } = require('express');
const { getWeatherByCoordinates, exportWeatherData } = require('../controllers/weatherController');

const router = Router();

router.get('/', getWeatherByCoordinates);
router.post('/export', exportWeatherData);

module.exports = router;
