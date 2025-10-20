const db = require('../config/database');

class FavoriteLocation {
  static async create(userId, name, latitude, longitude, city = null, country = null) {
    return new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO favorite_locations (userId, name, latitude, longitude, city, country) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [userId, name, latitude, longitude, city, country],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve({
              id: this.lastID,
              userId: userId,
              name: name,
              latitude: latitude,
              longitude: longitude,
              city: city,
              country: country
            });
          }
        }
      );
    });
  }

  static async findByUserId(userId) {
    return new Promise((resolve, reject) => {
      db.all(
        `SELECT id, userId, name, latitude, longitude, city, country, createdAt 
         FROM favorite_locations 
         WHERE userId = ? 
         ORDER BY createdAt DESC`,
        [userId],
        (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows || []);
          }
        }
      );
    });
  }

  static async findById(id, userId) {
    return new Promise((resolve, reject) => {
      db.get(
        `SELECT id, userId, name, latitude, longitude, city, country, createdAt 
         FROM favorite_locations 
         WHERE id = ? AND userId = ?`,
        [id, userId],
        (err, row) => {
          if (err) {
            reject(err);
          } else {
            resolve(row);
          }
        }
      );
    });
  }

  static async update(id, userId, name, latitude, longitude, city = null, country = null) {
    return new Promise((resolve, reject) => {
      db.run(
        `UPDATE favorite_locations 
         SET name = ?, latitude = ?, longitude = ?, city = ?, country = ? 
         WHERE id = ? AND userId = ?`,
        [name, latitude, longitude, city, country, id, userId],
        function(err) {
          if (err) {
            reject(err);
          } else {
            if (this.changes === 0) {
              reject(new Error('Locación no encontrada'));
            } else {
              resolve({
                id: id,
                userId: userId,
                name: name,
                latitude: latitude,
                longitude: longitude,
                city: city,
                country: country
              });
            }
          }
        }
      );
    });
  }

  static async delete(id, userId) {
    return new Promise((resolve, reject) => {
      db.run(
        `DELETE FROM favorite_locations WHERE id = ? AND userId = ?`,
        [id, userId],
        function(err) {
          if (err) {
            reject(err);
          } else {
            if (this.changes === 0) {
              reject(new Error('Locación no encontrada'));
            } else {
              resolve({ deleted: true, id: id });
            }
          }
        }
      );
    });
  }

  static async exists(userId, latitude, longitude) {
    return new Promise((resolve, reject) => {
      db.get(
        `SELECT id FROM favorite_locations 
         WHERE userId = ? AND latitude = ? AND longitude = ?`,
        [userId, latitude, longitude],
        (err, row) => {
          if (err) {
            reject(err);
          } else {
            resolve(!!row);
          }
        }
      );
    });
  }
}

module.exports = FavoriteLocation;
