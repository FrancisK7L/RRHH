const express = require('express');
const router = express.Router();
const Employee = require('../models/employee');


// Crear empleado
router.post('/', async (req, res) => {
  try {
    const nuevoEmpleado = new Employee(req.body);
    const empleadoGuardado = await nuevoEmpleado.save();
    res.json(empleadoGuardado); 
  } catch (err) {
    res.status(500).json({ msg: 'Error al crear empleado', error: err.message });
  }
});


// Modificar empleado
router.put('/:id', async (req, res) => {
  const emp = await Employee.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(emp);
});

// Eliminar empleado
router.delete('/:id', async (req, res) => {
  await Employee.findByIdAndDelete(req.params.id);
  res.json({ msg: 'Empleado eliminado' });
});

// Buscar por nombre
router.get('/search/:name', async (req, res) => {
  const empleados = await Employee.find({ name: new RegExp(req.params.name, 'i') });
  res.json(empleados);
});

// Obtener todos los empleados 
router.get('/', async (req, res) => {
  try {
    const { nombre } = req.query;
    let filtro = {};

    if (nombre && nombre.trim() !== '') {
      // Busca coincidencias parciales 
      filtro.nombre = new RegExp(nombre.trim(), 'i');
    }

    const empleados = await Employee.find(filtro);
    res.json(empleados);
  } catch (err) {
    return res.status(500).json({ msg: 'Error al obtener empleados', error: err.message });
  }
});


module.exports = router;
