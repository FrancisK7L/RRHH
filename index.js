require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');

const authRoutes = require('./routes/auth');
const employeeRoutes = require('./routes/employees');
const authMiddleware = require('./middleware/authMiddleware');

const app = express();
app.use(express.json());

app.use(express.static('public'))

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Conectado a MongoDB'))
  .catch(err => console.error(err));

app.use('/api/auth', authRoutes);
app.use('/api/employees', authMiddleware, employeeRoutes); // Protegido por JWT

app.listen(process.env.PORT, () => {
  console.log(`Servidor corriendo en puerto ${process.env.PORT}`);
});
