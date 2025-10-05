const { apiClient } = require('../utils/api');

const isDateInFuture = (dateString) => {
  const inputDate = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return inputDate > today;
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
  if (!isDateInFuture(date)) {
    throw new Error('Use el endpoint regular para fechas pasadas o actuales');
  }
  
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
  isDateInFuture 
};