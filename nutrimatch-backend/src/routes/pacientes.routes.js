// src/routes/pacientes.routes.js
const express = require('express');
const router = express.Router();

const { requireLogin, requireNutri } = require('../middleware/auth');
const pacientesController = require('../controllers/pacientes.controller');

// Lista pacientes vinculados ao nutricionista logado
router.get('/api/pacientes', requireLogin, requireNutri, pacientesController.listar);

// Vincular paciente (por e-mail)
router.post('/vincular-paciente', requireLogin, requireNutri, pacientesController.vincular);

// Desvincular paciente
router.post('/api/pacientes/:id/desvincular', requireLogin, requireNutri, pacientesController.desvincular);

module.exports = router;
