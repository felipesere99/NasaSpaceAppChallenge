process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';
process.env.SQLITE_DB_PATH = ':memory:';
process.env.FORECAST_API_DAYS = process.env.FORECAST_API_DAYS || '10';
process.env.FORECAST_DAYS_TO_FETCH = process.env.FORECAST_DAYS_TO_FETCH || '7';

const test = require('node:test');
const { mock } = test;
const assert = require('node:assert/strict');
const supertest = require('supertest');

const app = require('../src/app');
const db = require('../src/config/database');
const weatherService = require('../src/services/weatherService');

const request = supertest(app);

const runStatement = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) {
        reject(err);
      } else {
        resolve(this);
      }
    });
  });

const resetDatabase = async () => {
  await runStatement('DELETE FROM favorite_locations');
  await runStatement('DELETE FROM users');
};

test.beforeEach(async () => {
  await resetDatabase();
});

test.after(async () => {
  await new Promise((resolve, reject) => {
    db.close((err) => {
      if (err) reject(err);
      else resolve();
    });
  });
});

test('GET /api/weather rechaza parámetros faltantes', { concurrency: false }, async () => {
  const response = await request.get('/api/weather');
  assert.equal(response.status, 400);
  assert.match(response.body.error, /Faltan parámetros requeridos/);
});

test('GET /api/weather valida coordenadas', { concurrency: false }, async () => {
  const response = await request
    .get('/api/weather')
    .query({ latitude: '200', longitude: '10', date: '2024-05-01' });

  assert.equal(response.status, 400);
  assert.match(response.body.error, /Latitud inválida/);
});

test('GET /api/weather responde con datos del servicio', { concurrency: false }, async () => {
  const fakeWeather = {
    type: 'historical',
    date: '2024-05-01',
    location: { latitude: 10, longitude: 20 },
    temperature: { max: 25, min: 18 },
    wind_speed: 5,
    precipitation: 0,
    humidity: 55
  };

  const fetchMock = mock.method(weatherService, 'fetchWeather', async () => fakeWeather);

  const response = await request
    .get('/api/weather')
    .query({ latitude: '10', longitude: '20', date: '2024-05-01' });

  assert.equal(response.status, 200);
  assert.deepEqual(response.body, fakeWeather);
  assert.equal(fetchMock.mock.callCount(), 1);

  fetchMock.mock.restore();
});

test('POST /api/users/register crea un usuario nuevo', { concurrency: false }, async () => {
  const response = await request
    .post('/api/users/register')
    .send({ username: 'qa_user', password: 'secreto123' });

  assert.equal(response.status, 201);
  assert.equal(response.body.user.username, 'qa_user');
});

test('POST /api/users/register detecta duplicados', { concurrency: false }, async () => {
  await request
    .post('/api/users/register')
    .send({ username: 'qa_user', password: 'secreto123' });

  const response = await request
    .post('/api/users/register')
    .send({ username: 'qa_user', password: 'otro123' });

  assert.equal(response.status, 409);
  assert.match(response.body.error, /ya existe/);
});

test('Flujo de login y perfil protegido', { concurrency: false }, async () => {
  await request
    .post('/api/users/register')
    .send({ username: 'qa_user', password: 'secreto123' });

  const loginResponse = await request
    .post('/api/users/login')
    .send({ username: 'qa_user', password: 'secreto123' });

  assert.equal(loginResponse.status, 200);
  assert.ok(loginResponse.body.token, 'Debería devolver un token JWT');

  const profileResponse = await request
    .get('/api/users/profile')
    .set('Authorization', `Bearer ${loginResponse.body.token}`);

  assert.equal(profileResponse.status, 200);
  assert.equal(profileResponse.body.user.username, 'qa_user');
});

test('GET /api/users/profile requiere autenticación', { concurrency: false }, async () => {
  const response = await request.get('/api/users/profile');
  assert.equal(response.status, 401);
});

test('PUT /api/users/profile permite actualizar username', { concurrency: false }, async () => {
  await request
    .post('/api/users/register')
    .send({ username: 'qa_user', password: 'secreto123' });

  const { body: loginBody } = await request
    .post('/api/users/login')
    .send({ username: 'qa_user', password: 'secreto123' });

  const response = await request
    .put('/api/users/profile')
    .set('Authorization', `Bearer ${loginBody.token}`)
    .send({ username: 'qa_nuevo' });

  assert.equal(response.status, 200);
  assert.equal(response.body.user.username, 'qa_nuevo');
});

test('Rutas de locaciones favoritas están protegidas', { concurrency: false }, async () => {
  const response = await request.get('/api/favorite-locations');
  assert.equal(response.status, 401);
  assert.match(response.body.error, /Token/);
});
