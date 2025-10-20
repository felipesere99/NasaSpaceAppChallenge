const jwt = require('jsonwebtoken');
require('dotenv').config();

const SECRET_KEY = process.env.JWT_SECRET;

class AuthService {
  static generateToken(userId, username) {
    return jwt.sign(
      { userId, username },
      SECRET_KEY,
      { expiresIn: '24h' }
    );
  }

  static verifyToken(token) {
    try {
      return jwt.verify(token, SECRET_KEY);
    } catch (err) {
      return null;
    }
  }

  static decodeToken(token) {
    return jwt.decode(token);
  }
}

module.exports = AuthService;
