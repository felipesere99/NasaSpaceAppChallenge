const weatherService = require('../services/weatherService');
const redis = require('../lib/redisClient'); //agregamos redis

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

    // clave distinta para redis
    const cacheKey = `weather:${lat}:${lon}:${date}`;

    // revisamos si ya está en caché
    const cached = await redis.get(cacheKey);
    if (cached) {
      res.set('Cache-Control', 'no-store');//PARA QUE NO CACHEE 2 VECES CON EL NAVEGADOR
      console.log('Respuesta servida desde Redis');//para ver la respuesta
      return res.json(JSON.parse(cached));
    }

    // si no está cacheado pedimos los datos a la api
    const data = await weatherService.fetchWeather(lat, lon, date);

    // guardamos en caché por 10 minutos (600 segundos)
    await redis.setEx(cacheKey, 600, JSON.stringify(data));
    console.log('Respuesta guardada en Redis');
    res.set('Cache-Control', 'no-store');//MISMO
    res.json(data);
  } catch (err) {
    console.error('Error en getWeatherByCoordinates:', err);
    next(err);
  }
};

module.exports = { getWeatherByCoordinates };
