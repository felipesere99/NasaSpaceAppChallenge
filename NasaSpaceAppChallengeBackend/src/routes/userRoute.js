const express = require('express');
const User = require('../models/User');
const AuthService = require('../services/authService');

const router = express.Router();

// Middleware para verificar JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Token no proporcionado' });
  }

  const decoded = AuthService.verifyToken(token);
  if (!decoded) {
    return res.status(403).json({ error: 'Token inválido o expirado' });
  }

  req.user = decoded;
  next();
};

// POST /api/users/register - Registrar un nuevo usuario
router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validar entrada
    if (!username || !password) {
      return res.status(400).json({ error: 'Username y password son requeridos' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
    }

    // Verificar si el usuario ya existe
    const existingUser = await User.findByUsername(username);
    if (existingUser) {
      return res.status(409).json({ error: 'El usuario ya existe' });
    }

    // Crear el usuario
    const newUser = await User.create(username, password);
    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      user: newUser
    });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ error: 'Error al registrar el usuario' });
  }
});

// POST /api/users/login - Iniciar sesión
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validar entrada
    if (!username || !password) {
      return res.status(400).json({ error: 'Username y password son requeridos' });
    }

    // Buscar el usuario
    const user = await User.findByUsername(username);
    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Verificar contraseña
    const isPasswordValid = await User.verifyPassword(user.password, password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Generar JWT
    const token = AuthService.generateToken(user.id, user.username);

    res.status(200).json({
      message: 'Login exitoso',
      token: token,
      user: {
        id: user.id,
        username: user.username
      }
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
});

// GET /api/users/profile - Obtener perfil del usuario autenticado
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.status(200).json({
      user: user
    });
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    res.status(500).json({ error: 'Error al obtener el perfil' });
  }
});

// PUT /api/users/profile - Actualizar perfil del usuario (username y/o contraseña)
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { username, newPassword, currentPassword } = req.body;

    // Validar que al menos uno de los campos a actualizar esté presente
    if (!username && !newPassword) {
      return res.status(400).json({ 
        error: 'Debes proporcionar username o newPassword para actualizar' 
      });
    }

    // Si se intenta cambiar la contraseña, validar la contraseña actual
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ 
          error: 'currentPassword es requerido para cambiar la contraseña' 
        });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({ 
          error: 'La nueva contraseña debe tener al menos 6 caracteres' 
        });
      }

      // Obtener el usuario actual
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      // Verificar que la contraseña actual sea correcta
      const isPasswordValid = await User.verifyPassword(user.password, currentPassword);
      if (!isPasswordValid) {
        return res.status(401).json({ error: 'Contraseña actual incorrecta' });
      }
    }

    // Si se intenta cambiar el username, verificar que no esté en uso
    if (username) {
      const existingUser = await User.findByUsername(username);
      if (existingUser && existingUser.id !== userId) {
        return res.status(409).json({ error: 'El username ya está en uso' });
      }
    }

    // Actualizar el usuario
    let updateData = {};
    if (username) updateData.username = username;
    if (newPassword) updateData.password = newPassword;

    const updatedUser = await User.update(userId, updateData);

    res.status(200).json({
      message: 'Perfil actualizado exitosamente',
      user: {
        id: updatedUser.id,
        username: updatedUser.username
      }
    });
  } catch (error) {
    console.error('Error al actualizar perfil:', error);
    res.status(500).json({ error: 'Error al actualizar el perfil' });
  }
});

module.exports = { router, authenticateToken };
