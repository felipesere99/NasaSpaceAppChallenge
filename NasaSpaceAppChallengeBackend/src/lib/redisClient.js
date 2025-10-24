const { createClient } = require('redis');

const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
});

redisClient.on('connect', () => console.log('Redis Conectado'));
redisClient.on('error', (err) => console.error('Error en Redis:', err));

(async () => {
  await redisClient.connect();
})();

module.exports = redisClient;