const { fetchWeather } = require('../services/weatherService');

const getWeatherByCity = async (req, res, next) => {
  try {
    const { city } = req.query;
    if (!city) {
      return res.status(400).json({ error: 'Falta el parametro' });
    }

    const data = await fetchWeather(city);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

module.exports = { getWeatherByCity };
