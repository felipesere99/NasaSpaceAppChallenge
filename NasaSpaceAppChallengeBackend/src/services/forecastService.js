const axios = require('axios');
const { apiClient } = require('../utils/api');
require('dotenv').config();

const isDateInFuture = (dateString) => {
  const inputDate = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return inputDate > today;
};

const isDateToday = (dateString) => {
  const inputDate = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return inputDate.getTime() === today.getTime();
};

const getDaysFromNow = (dateString) => {
  const inputDate = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const diffTime = inputDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
};

const isForecastableDate = (dateString) => {
  const daysFromNow = getDaysFromNow(dateString);
  const forecastDays = parseInt(process.env.FORECAST_API_DAYS) || 10;
  // Incluir día actual (0) y próximos días hasta FORECAST_API_DAYS
  return daysFromNow >= 0 && daysFromNow <= forecastDays;
};

// Obtener forecast de Open-Meteo (API real para próximos 10 días)
const fetchRealForecast = async (latitude, longitude, date) => {
  try {
    const response = await axios.get('https://api.open-meteo.com/v1/forecast', {
      params: {
        latitude: latitude,
        longitude: longitude,
        start_date: date,
        end_date: date,
        daily: 'temperature_2m_max,temperature_2m_min,precipitation_sum,windspeed_10m_max,relative_humidity_2m_max',
        timezone: 'auto'
      }
    });

    const dailyData = response.data.daily;
    const dateIndex = 0; // Solo estamos pidiendo un día

    if (!dailyData.time || dailyData.time.length === 0) {
      throw new Error('No forecast data available for the requested date');
    }

    return {
      date: date,
      type: 'forecast_real',
      source: 'Open-Meteo API',
      location: {
        latitude: latitude,
        longitude: longitude
      },
      predicted: {
        temperature: {
          max: {
            value: dailyData.temperature_2m_max[dateIndex],
            range: {
              min: dailyData.temperature_2m_min[dateIndex],
              max: dailyData.temperature_2m_max[dateIndex]
            }
          },
          min: {
            value: dailyData.temperature_2m_min[dateIndex],
            range: {
              min: dailyData.temperature_2m_min[dateIndex],
              max: dailyData.temperature_2m_max[dateIndex]
            }
          }
        },
        wind_speed: {
          value: dailyData.windspeed_10m_max[dateIndex],
          range: {
            min: 0,
            max: dailyData.windspeed_10m_max[dateIndex]
          }
        },
        precipitation: {
          expected_mm: dailyData.precipitation_sum[dateIndex],
          probability_of_rain: dailyData.precipitation_sum[dateIndex] > 0 ? 50 : 10,
          range: {
            min: 0,
            max: dailyData.precipitation_sum[dateIndex] * 1.5
          }
        },
        humidity: {
          value: dailyData.relative_humidity_2m_max[dateIndex],
          range: {
            min: Math.max(0, dailyData.relative_humidity_2m_max[dateIndex] - 20),
            max: Math.min(100, dailyData.relative_humidity_2m_max[dateIndex] + 10)
          }
        }
      },
      confidence: 95,
      disclaimer: "Real-time forecast data from Open-Meteo API"
    };
  } catch (error) {
    console.error('Error fetching real forecast:', error.message);
    throw new Error('Failed to fetch real forecast: ' + error.message);
  }
};

const getHistoricalDates = (dateString, yearsBack = 25) => {
  const targetDate = new Date(dateString);
  const dates = [];
  
  for (let i = 1; i <= yearsBack; i++) {
    const historicalYear = targetDate.getFullYear() - i;
    const historicalDate = new Date(targetDate);
    historicalDate.setFullYear(historicalYear);
    
    if (historicalDate <= new Date()) {
      dates.push(historicalDate.toISOString().split('T')[0]);
    }
  }
  
  return dates;
};

const fetchHistoricalData = async (latitude, longitude, dates) => {
  const promises = dates.map(async (date) => {
    try {
      const dateFormatted = date.replace(/-/g, '');
      const response = await apiClient.get('', {
        params: {
          latitude: latitude,
          longitude: longitude,
          start: dateFormatted,
          end: dateFormatted,
          community: 'AG',
          parameters: 'T2M_MAX,T2M_MIN,WS10M,PRECTOTCORR,RH2M',
          format: 'JSON'
        },
      });
      
      const data = response.data.properties.parameter;
      return {
        date: date,
        temperature: {
          max: data.T2M_MAX[dateFormatted],
          min: data.T2M_MIN[dateFormatted]
        },
        wind_speed: data.WS10M[dateFormatted],
        precipitation: data.PRECTOTCORR[dateFormatted],
        humidity: data.RH2M[dateFormatted]
      };
    } catch (error) {
      return null;
    }
  });
  
  const results = await Promise.all(promises);
  return results.filter(result => result !== null);
};

const calculateStatistics = (historicalData) => {
  if (historicalData.length === 0) return null;
  
  const values = {
    tempMax: historicalData.map(d => d.temperature.max),
    tempMin: historicalData.map(d => d.temperature.min),
    windSpeed: historicalData.map(d => d.wind_speed),
    precipitation: historicalData.map(d => d.precipitation),
    humidity: historicalData.map(d => d.humidity)
  };
  
  const rainyDays = historicalData.filter(d => d.precipitation > 0.5).length;
  const rainProbability = (rainyDays / historicalData.length) * 100;
  
  const calculateStats = (arr) => {
    const sorted = arr.sort((a, b) => a - b);
    const mean = arr.reduce((sum, val) => sum + val, 0) / arr.length;
    const variance = arr.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / arr.length;
    const stdDev = Math.sqrt(variance);
    
    return {
      min: Math.min(...arr),
      max: Math.max(...arr),
      mean: parseFloat(mean.toFixed(2)),
      median: sorted[Math.floor(sorted.length / 2)],
      stdDev: parseFloat(stdDev.toFixed(2))
    };
  };
  
  return {
    temperature: {
      max: calculateStats(values.tempMax),
      min: calculateStats(values.tempMin)
    },
    wind_speed: calculateStats(values.windSpeed),
    precipitation: calculateStats(values.precipitation),
    humidity: calculateStats(values.humidity),
    sampleSize: historicalData.length,
    rainProbability: parseFloat(rainProbability.toFixed(1))
  };
};

const generateForecast = (statistics, targetDate) => {
  if (!statistics) {
    throw new Error('Datos históricos insuficientes para generar pronóstico');
  }
  
  const forecast = {
    date: targetDate,
    type: 'forecast',
    confidence: Math.max(60, Math.min(95, 100 - (statistics.temperature.max.stdDev * 5))),
    historical_years_analyzed: statistics.sampleSize,
    predicted: {
      temperature: {
        max: {
          value: parseFloat(statistics.temperature.max.mean.toFixed(1)),
          range: {
            min: parseFloat((statistics.temperature.max.mean - statistics.temperature.max.stdDev).toFixed(1)),
            max: parseFloat((statistics.temperature.max.mean + statistics.temperature.max.stdDev).toFixed(1))
          }
        },
        min: {
          value: parseFloat(statistics.temperature.min.mean.toFixed(1)),
          range: {
            min: parseFloat((statistics.temperature.min.mean - statistics.temperature.min.stdDev).toFixed(1)),
            max: parseFloat((statistics.temperature.min.mean + statistics.temperature.min.stdDev).toFixed(1))
          }
        }
      },
      wind_speed: {
        value: parseFloat(statistics.wind_speed.mean.toFixed(1)),
        range: {
          min: parseFloat(Math.max(0, statistics.wind_speed.mean - statistics.wind_speed.stdDev).toFixed(1)),
          max: parseFloat((statistics.wind_speed.mean + statistics.wind_speed.stdDev).toFixed(1))
        }
      },
      precipitation: {
        expected_mm: parseFloat(statistics.precipitation.mean.toFixed(2)),
        probability_of_rain: statistics.rainProbability,
        range: {
          min: 0,
          max: parseFloat((statistics.precipitation.mean + statistics.precipitation.stdDev).toFixed(2))
        }
      },
      humidity: {
        value: parseFloat(statistics.humidity.mean.toFixed(1)),
        range: {
          min: parseFloat(Math.max(0, statistics.humidity.mean - statistics.humidity.stdDev).toFixed(1)),
          max: parseFloat(Math.min(100, statistics.humidity.mean + statistics.humidity.stdDev).toFixed(1))
        }
      }
    },
    disclaimer: "Forecast based on historical data analysis. Not to be used for critical decisions."
  };
  
  return forecast;
};

const fetchWeatherForecast = async (latitude, longitude, date) => {
  const daysFromNow = getDaysFromNow(date);
  const forecastDays = parseInt(process.env.FORECAST_API_DAYS) || 10;

  // Si es hoy o una fecha cercana (próximos 7-10 días), usar API real de forecast
  if (daysFromNow >= 0 && daysFromNow <= forecastDays) {
    return await fetchRealForecast(latitude, longitude, date);
  }

  // Si es fecha pasada, usar datos históricos
  if (daysFromNow < 0) {
    throw new Error('Para fechas pasadas, use un endpoint diferente o no se puede acceder a este endpoint');
  }

  // Para fechas muy futuras (más allá del rango de forecast), usar el cálculo basado en datos históricos
  const historicalDates = getHistoricalDates(date, 40);
  
  if (historicalDates.length === 0) {
    throw new Error('No hay suficientes datos históricos disponibles');
  }
  
  const historicalData = await fetchHistoricalData(latitude, longitude, historicalDates);
  const statistics = calculateStatistics(historicalData);
  const forecast = generateForecast(statistics, date);
  
  forecast.location = { latitude, longitude };
  
  return forecast;
};

module.exports = { 
  fetchWeatherForecast, 
  isDateInFuture,
  getDaysFromNow,
  isForecastableDate
};