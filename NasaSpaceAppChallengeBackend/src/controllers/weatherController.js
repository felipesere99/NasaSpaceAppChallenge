const weatherService = require('../services/weatherService');

const getWeatherByCoordinates = async (req, res, next) => {
  try {
    const { latitude, longitude, date } = req.query;
    
    if (!latitude || !longitude || !date) {
      return res.status(400).json({ 
        error: 'Faltan parámetros requeridos: latitude, longitude, date' 
      });
    }
    
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return res.status(400).json({ 
        error: 'Formato de fecha inválido. Use YYYY-MM-DD' 
      });
    }
    
    const lat = parseFloat(latitude);
    const lon = parseFloat(longitude);
    
    if (isNaN(lat) || lat < -90 || lat > 90) {
      return res.status(400).json({ 
        error: 'Latitud inválida. Debe estar entre -90 y 90' 
      });
    }
    
    if (isNaN(lon) || lon < -180 || lon > 180) {
      return res.status(400).json({ 
        error: 'Longitud inválida. Debe estar entre -180 y 180' 
      });
    }

    const data = await weatherService.fetchWeather(lat, lon, date);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

module.exports = { getWeatherByCoordinates };
