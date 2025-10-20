const express = require('express');
const FavoriteLocation = require('../models/FavoriteLocation');
const GeocodingService = require('../services/geocodingService');
const ForecastService = require('../services/forecastLocationsService');
const { authenticateToken } = require('./userRoute');
require('dotenv').config();

const router = express.Router();

// Middleware para proteger rutas (usa authenticateToken del userRoute)
router.use(authenticateToken);

// POST /api/favorite-locations - Guardar una nueva locación favorita
router.post('/', async (req, res) => {
  try {
    const { name, latitude, longitude } = req.body;
    const userId = req.user.userId;

    // Validar entrada
    if (!name || latitude === undefined || longitude === undefined) {
      return res.status(400).json({ 
        error: 'name, latitude y longitude son requeridos' 
      });
    }

    // Validar rangos de coordenadas
    if (latitude < -90 || latitude > 90) {
      return res.status(400).json({ 
        error: 'Latitud inválida. Debe estar entre -90 y 90' 
      });
    }

    if (longitude < -180 || longitude > 180) {
      return res.status(400).json({ 
        error: 'Longitud inválida. Debe estar entre -180 y 180' 
      });
    }

    // Verificar si la locación ya existe para este usuario
    const exists = await FavoriteLocation.exists(userId, latitude, longitude);
    if (exists) {
      return res.status(409).json({ 
        error: 'Esta locación ya está guardada como favorita' 
      });
    }

    // Obtener nombre de ciudad y país
    const locationName = await GeocodingService.getLocationName(latitude, longitude);

    // Crear la locación favorita
    const newLocation = await FavoriteLocation.create(
      userId,
      name,
      latitude,
      longitude,
      locationName.city,
      locationName.country
    );

    res.status(201).json({
      message: 'Locación favorita guardada exitosamente',
      location: {
        id: newLocation.id,
        name: newLocation.name,
        latitude: newLocation.latitude,
        longitude: newLocation.longitude,
        city: locationName.city,
        country: locationName.country,
        formattedAddress: locationName.formattedAddress
      }
    });
  } catch (error) {
    console.error('Error al guardar locación favorita:', error);
    res.status(500).json({ error: 'Error al guardar la locación favorita' });
  }
});

// GET /api/favorite-locations - Obtener todas las locaciones favoritas del usuario
router.get('/', async (req, res) => {
  try {
    const userId = req.user.userId;

    const locations = await FavoriteLocation.findByUserId(userId);

    res.status(200).json({
      message: `Se encontraron ${locations.length} locaciones favoritas`,
      locations: locations.map(loc => ({
        id: loc.id,
        name: loc.name,
        latitude: loc.latitude,
        longitude: loc.longitude,
        city: loc.city,
        country: loc.country,
        createdAt: loc.createdAt
      }))
    });
  } catch (error) {
    console.error('Error al obtener locaciones favoritas:', error);
    res.status(500).json({ error: 'Error al obtener las locaciones favoritas' });
  }
});

// GET /api/favorite-locations/:id - Obtener una locación favorita específica
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const location = await FavoriteLocation.findById(id, userId);

    if (!location) {
      return res.status(404).json({ error: 'Locación no encontrada' });
    }

    res.status(200).json({
      location: {
        id: location.id,
        name: location.name,
        latitude: location.latitude,
        longitude: location.longitude,
        city: location.city,
        country: location.country,
        createdAt: location.createdAt
      }
    });
  } catch (error) {
    console.error('Error al obtener locación favorita:', error);
    res.status(500).json({ error: 'Error al obtener la locación favorita' });
  }
});

// PUT /api/favorite-locations/:id - Actualizar una locación favorita
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, latitude, longitude } = req.body;
    const userId = req.user.userId;

    // Validar entrada
    if (!name || latitude === undefined || longitude === undefined) {
      return res.status(400).json({ 
        error: 'name, latitude y longitude son requeridos' 
      });
    }

    // Validar rangos
    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return res.status(400).json({ 
        error: 'Coordenadas inválidas' 
      });
    }

    // Obtener nombre de ciudad y país
    const locationName = await GeocodingService.getLocationName(latitude, longitude);

    // Actualizar la locación
    const updatedLocation = await FavoriteLocation.update(
      id,
      userId,
      name,
      latitude,
      longitude,
      locationName.city,
      locationName.country
    );

    res.status(200).json({
      message: 'Locación favorita actualizada exitosamente',
      location: {
        id: updatedLocation.id,
        name: updatedLocation.name,
        latitude: updatedLocation.latitude,
        longitude: updatedLocation.longitude,
        city: locationName.city,
        country: locationName.country,
        formattedAddress: locationName.formattedAddress
      }
    });
  } catch (error) {
    console.error('Error al actualizar locación favorita:', error);
    if (error.message === 'Locación no encontrada') {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: 'Error al actualizar la locación favorita' });
  }
});

// DELETE /api/favorite-locations/:id - Eliminar una locación favorita
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const result = await FavoriteLocation.delete(id, userId);

    res.status(200).json({
      message: 'Locación favorita eliminada exitosamente',
      deleted: result.deleted
    });
  } catch (error) {
    console.error('Error al eliminar locación favorita:', error);
    if (error.message === 'Locación no encontrada') {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: 'Error al eliminar la locación favorita' });
  }
});

// GET /api/favorite-locations/forecast/all - Obtener forecast para todas las locaciones
router.get('/forecast/all', async (req, res) => {
  try {
    const userId = req.user.userId;
    const daysAhead = parseInt(req.query.days) || parseInt(process.env.FORECAST_DAYS_TO_FETCH) || 7;

    // Validar que days sea un número razonable
    if (daysAhead < 1 || daysAhead > 16) {
      return res.status(400).json({ 
        error: 'days debe estar entre 1 y 16' 
      });
    }

    // Obtener todas las locaciones del usuario
    const locations = await FavoriteLocation.findByUserId(userId);

    if (locations.length === 0) {
      return res.status(200).json({
        message: 'No tienes locaciones favoritas guardadas',
        locations: [],
        forecasts: []
      });
    }

    // Obtener forecast para cada locación
    const forecasts = await ForecastService.getForecastForLocations(locations, daysAhead);

    res.status(200).json({
      message: `Forecast obtenido para ${forecasts.length} locaciones`,
      locationsCount: locations.length,
      daysAhead: daysAhead,
      forecasts: forecasts
    });
  } catch (error) {
    console.error('Error al obtener forecast de locaciones:', error);
    res.status(500).json({ error: 'Error al obtener el forecast de las locaciones' });
  }
});

// GET /api/favorite-locations/forecast/aggregated - Obtener forecast agregado
router.get('/forecast/aggregated', async (req, res) => {
  try {
    const userId = req.user.userId;
    const daysAhead = parseInt(req.query.days) || parseInt(process.env.FORECAST_DAYS_TO_FETCH) || 7;

    // Validar que days sea un número razonable
    if (daysAhead < 1 || daysAhead > 16) {
      return res.status(400).json({ 
        error: 'days debe estar entre 1 y 16' 
      });
    }

    // Obtener todas las locaciones del usuario
    const locations = await FavoriteLocation.findByUserId(userId);

    if (locations.length === 0) {
      return res.status(200).json({
        message: 'No tienes locaciones favoritas guardadas',
        locations: [],
        aggregatedForecast: []
      });
    }

    // Obtener forecast agregado
    const aggregatedForecast = await ForecastService.getAggregatedForecast(locations, daysAhead);

    res.status(200).json({
      message: `Forecast agregado de ${locations.length} locaciones`,
      locationsCount: locations.length,
      daysAhead: daysAhead,
      ...aggregatedForecast
    });
  } catch (error) {
    console.error('Error al obtener forecast agregado:', error);
    res.status(500).json({ error: 'Error al obtener el forecast agregado' });
  }
});

// GET /api/favorite-locations/:id/forecast - Obtener forecast para una locación específica
router.get('/:id/forecast', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const daysAhead = parseInt(req.query.days) || parseInt(process.env.FORECAST_DAYS_TO_FETCH) || 7;

    // Validar que days sea un número razonable
    if (daysAhead < 1 || daysAhead > 16) {
      return res.status(400).json({ 
        error: 'days debe estar entre 1 y 16' 
      });
    }

    // Obtener la locación específica
    const location = await FavoriteLocation.findById(id, userId);

    if (!location) {
      return res.status(404).json({ error: 'Locación no encontrada' });
    }

    // Obtener forecast para esa locación
    const forecast = await ForecastService.getForecastForLocation(location, daysAhead);

    if (!forecast) {
      return res.status(500).json({ error: 'Error al obtener el forecast' });
    }

    res.status(200).json({
      message: `Forecast obtenido para ${location.name}`,
      daysAhead: daysAhead,
      ...forecast
    });
  } catch (error) {
    console.error('Error al obtener forecast de locación:', error);
    res.status(500).json({ error: 'Error al obtener el forecast de la locación' });
  }
});

module.exports = router;
