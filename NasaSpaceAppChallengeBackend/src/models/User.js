const db = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  static async create(username, password) {
    return new Promise((resolve, reject) => {
      bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) {
          reject(err);
          return;
        }

        db.run(
          'INSERT INTO users (username, password) VALUES (?, ?)',
          [username, hashedPassword],
          function(err) {
            if (err) {
              reject(err);
            } else {
              resolve({
                id: this.lastID,
                username: username
              });
            }
          }
        );
      });
    });
  }

  static async findByUsername(username) {
    return new Promise((resolve, reject) => {
      db.get(
        'SELECT * FROM users WHERE username = ?',
        [username],
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

  static async findById(id) {
    return new Promise((resolve, reject) => {
      db.get(
        'SELECT id, username, createdAt FROM users WHERE id = ?',
        [id],
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

  static async verifyPassword(hashedPassword, password) {
    return bcrypt.compare(password, hashedPassword);
  }

  static async update(id, updateData) {
    return new Promise(async (resolve, reject) => {
      try {
        let query = 'UPDATE users SET ';
        let params = [];
        let fields = [];

        if (updateData.username) {
          fields.push('username = ?');
          params.push(updateData.username);
        }

        if (updateData.password) {
          const hashedPassword = await new Promise((res, rej) => {
            bcrypt.hash(updateData.password, 10, (err, hashed) => {
              if (err) rej(err);
              else res(hashed);
            });
          });
          fields.push('password = ?');
          params.push(hashedPassword);
        }

        if (fields.length === 0) {
          reject(new Error('No hay campos para actualizar'));
          return;
        }

        query += fields.join(', ');
        query += ' WHERE id = ?';
        params.push(id);

        db.run(query, params, function(err) {
          if (err) {
            reject(err);
          } else if (this.changes === 0) {
            reject(new Error('Usuario no encontrado'));
          } else {
            db.get(
              'SELECT id, username FROM users WHERE id = ?',
              [id],
              (err, row) => {
                if (err) reject(err);
                else resolve(row);
              }
            );
          }
        });
      } catch (error) {
        reject(error);
      }
    });
  }
}

module.exports = User;
