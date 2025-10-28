const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const resolveDbPath = () => {
  const overridePath = process.env.SQLITE_DB_PATH;
  if (!overridePath) {
    return path.join(__dirname, '../../database.db');
  }

  if (overridePath === ':memory:') {
    return ':memory:';
  }

  return path.resolve(process.cwd(), overridePath);
};

const dbPath = resolveDbPath();

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error al conectar con SQLite:', err.message);
  } else {
    console.log(`Conectado a la base de datos SQLite (${dbPath})`);
  }
});

// Crear tabla de usuarios si no existe
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Crear tabla de locaciones favoritas
  db.run(`
    CREATE TABLE IF NOT EXISTS favorite_locations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      name TEXT NOT NULL,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      city TEXT,
      country TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(userId, latitude, longitude)
    )
  `);
});

module.exports = db;
