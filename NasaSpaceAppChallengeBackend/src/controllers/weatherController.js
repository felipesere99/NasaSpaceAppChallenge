const { fetchWeather } = require('../services/weatherService');

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

    const data = await fetchWeather(lat, lon, date);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

const convertToCSV = (data) => {
  if (data.type === 'historical') {
    return `Date,Type,Latitude,Longitude,Temperature Max,Temperature Min,Wind Speed,Precipitation,Humidity
${data.date},${data.type},${data.location.latitude},${data.location.longitude},${data.temperature.max},${data.temperature.min},${data.wind_speed},${data.precipitation},${data.humidity}`;
  } else if (data.type === 'forecast') {
    const temp = data.predicted.temperature;
    const wind = data.predicted.wind_speed;
    const precip = data.predicted.precipitation;
    const humidity = data.predicted.humidity;
    
    return `Date,Type,Latitude,Longitude,Confidence,Historical Years,Temp Max,Temp Max Range Min,Temp Max Range Max,Temp Min,Temp Min Range Min,Temp Min Range Max,Wind Speed,Wind Speed Range Min,Wind Speed Range Max,Expected Precipitation,Rain Probability,Precipitation Range Max,Humidity,Humidity Range Min,Humidity Range Max
${data.date},${data.type},${data.location.latitude},${data.location.longitude},${data.confidence},${data.historical_years_analyzed},${temp.max.value},${temp.max.range.min},${temp.max.range.max},${temp.min.value},${temp.min.range.min},${temp.min.range.max},${wind.value},${wind.range.min},${wind.range.max},${precip.expected_mm},${precip.probability_of_rain},${precip.range.max},${humidity.value},${humidity.range.min},${humidity.range.max}`;
  }
  
  return '';
};

const exportWeatherData = async (req, res, next) => {
  try {
    const { latitude, longitude, date, format } = req.body;
    
    if (!latitude || !longitude || !date) {
      return res.status(400).json({ 
        error: 'Faltan parámetros requeridos: latitude, longitude, date' 
      });
    }
    
    if (!format || !['json', 'csv'].includes(format.toLowerCase())) {
      return res.status(400).json({ 
        error: 'Formato inválido. Use "json" o "csv"' 
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

    const data = await fetchWeather(lat, lon, date);
    
    const formatLower = format.toLowerCase();
    const filename = `weather_${date}_${lat}_${lon}.${formatLower}`;
    
    if (formatLower === 'json') {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.json(data);
    } else if (formatLower === 'csv') {
      const csvData = convertToCSV(data);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(csvData);
    }
  } catch (err) {
    next(err);
  }
};

module.exports = { getWeatherByCoordinates, exportWeatherData };
