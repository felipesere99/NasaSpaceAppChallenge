const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const weatherRoutes = require('./routes/weatherRoute');
const { router: userRoutes } = require('./routes/userRoute');
const favoriteLocationsRoutes = require('./routes/favoriteLocationsRoute');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.use('/api/weather', weatherRoutes);
app.use('/api/users', userRoutes);
app.use('/api/favorite-locations', favoriteLocationsRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

module.exports = app;

