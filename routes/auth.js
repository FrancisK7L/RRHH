const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

// Login
router.post('/login', async (req, res) => {
  try {
    console.log('Body recibido:', req.body);
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    console.log('Usuario encontrado:', user);
    if (!user) return res.status(400).json({ msg: 'Credenciales inválidas - usuario no encontrado' });

    const validPassword = await bcrypt.compare(password, user.password);
    console.log('¿Contraseña válida?:', validPassword);
    if (!validPassword) return res.status(400).json({ msg: 'Credenciales inválidas - contraseña incorrecta' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ msg: 'Error interno del servidor' });
  }
});

module.exports = router;
