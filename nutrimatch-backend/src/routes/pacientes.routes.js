// src/routes/pacientes.routes.js
const express = require('express');
const router = express.Router();

const { requireLogin, requireNutri } = require('../middleware/auth');
const pacientesController = require('../controllers/pacientes.controller');

// Lista pacientes vinculados ao nutricionista logado
router.get('/api/pacientes', requireLogin, requireNutri, pacientesController.listar);

// Obter detalhes de um paciente específico
router.get('/api/pacientes/:id', requireLogin, requireNutri, pacientesController.obter);

// Atualizar dados de um paciente
router.put('/api/pacientes/:id', requireLogin, requireNutri, pacientesController.atualizar);

// Vincular paciente (por e-mail)
router.post('/vincular-paciente', requireLogin, requireNutri, pacientesController.vincular);

// Desvincular paciente
router.post('/api/pacientes/:id/desvincular', requireLogin, requireNutri, pacientesController.desvincular);

module.exports = router;
