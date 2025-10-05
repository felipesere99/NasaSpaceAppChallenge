const { Router } = require('express');
const { getWeatherByCoordinates } = require('../controllers/weatherController');

const router = Router();

// HTTP GET /api/weather?latitude={data}&longitude={data}&date={data}
router.get('/', getWeatherByCoordinates);

module.exports = router;
