const axios = require('axios');
require('dotenv').config();

class ForecastService {
  static async getForecastForLocations(locations, daysAhead = 7) {
    try {
      const forecastsPromises = locations.map(async (location) => {
        return this.getForecastForLocation(location, daysAhead);
      });

      const forecasts = await Promise.all(forecastsPromises);
      return forecasts.filter(f => f !== null);
    } catch (error) {
      console.error('Error fetching forecasts for locations:', error.message);
      throw new Error('Error fetching forecasts for locations');
    }
  }

  static async getForecastForLocation(location, daysAhead = 7) {
    try {
      const dates = this.getNextDates(daysAhead);

      const response = await axios.get('https://api.open-meteo.com/v1/forecast', {
        params: {
          latitude: location.latitude,
          longitude: location.longitude,
          start_date: dates[0],
          end_date: dates[dates.length - 1],
          daily: 'temperature_2m_max,temperature_2m_min,precipitation_sum,windspeed_10m_max,relative_humidity_2m_max',
          timezone: 'auto'
        }
      });

      const dailyData = response.data.daily;

      const forecastDays = dailyData.time.map((date, index) => ({
        date: date,
        temperature: {
          max: dailyData.temperature_2m_max[index],
          min: dailyData.temperature_2m_min[index]
        },
        wind_speed: dailyData.windspeed_10m_max[index],
        precipitation: dailyData.precipitation_sum[index],
        humidity: dailyData.relative_humidity_2m_max[index]
      }));

      return {
        location: {
          id: location.id,
          name: location.name,
          latitude: location.latitude,
          longitude: location.longitude,
          city: location.city,
          country: location.country
        },
        forecast: forecastDays,
        daysCount: forecastDays.length,
        source: 'Open-Meteo API'
      };
    } catch (error) {
      console.error(`Error fetching forecast for ${location.name}:`, error.message);
      return null;
    }
  }

  static getNextDates(daysAhead = 7) {
    const dates = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < daysAhead; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }

    return dates;
  }

  static async getAggregatedForecast(locations, daysAhead = 7) {
    try {
      const forecasts = await this.getForecastForLocations(locations, daysAhead);

      if (forecasts.length === 0) {
        throw new Error('No forecasts available');
      }

      const dates = this.getNextDates(daysAhead);
      const aggregated = [];

      dates.forEach((date, index) => {
        const dayForecasts = forecasts
          .map(f => f.forecast[index])
          .filter(f => f && f.date === date);

        if (dayForecasts.length > 0) {
          const avgTemp = {
            max: dayForecasts.reduce((sum, f) => sum + f.temperature.max, 0) / dayForecasts.length,
            min: dayForecasts.reduce((sum, f) => sum + f.temperature.min, 0) / dayForecasts.length
          };

          const avgWindSpeed = dayForecasts.reduce((sum, f) => sum + f.wind_speed, 0) / dayForecasts.length;
          const avgPrecipitation = dayForecasts.reduce((sum, f) => sum + f.precipitation, 0) / dayForecasts.length;
          const avgHumidity = dayForecasts.reduce((sum, f) => sum + f.humidity, 0) / dayForecasts.length;

          aggregated.push({
            date: date,
            temperature: {
              max: parseFloat(avgTemp.max.toFixed(1)),
              min: parseFloat(avgTemp.min.toFixed(1))
            },
            wind_speed: parseFloat(avgWindSpeed.toFixed(1)),
            precipitation: parseFloat(avgPrecipitation.toFixed(2)),
            humidity: parseFloat(avgHumidity.toFixed(1))
          });
        }
      });

      return {
        aggregated: true,
        locationsCount: forecasts.length,
        forecast: aggregated,
        source: 'Open-Meteo API (Aggregated)'
      };
    } catch (error) {
      console.error('Error getting aggregated forecast:', error.message);
      throw new Error('Error getting aggregated forecast');
    }
  }
}

module.exports = ForecastService;
