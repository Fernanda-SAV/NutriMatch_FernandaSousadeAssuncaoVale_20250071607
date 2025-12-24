// src/routes/diario.routes.js
const express = require('express');
const router = express.Router();

const { requireLogin, requireNutri } = require('../middleware/auth');
const diarioController = require('../controllers/diario.controller');

// Paciente confirma refeição (salva no diário)
router.post('/confirmar-refeicao', requireLogin, diarioController.confirmarRefeicao);

// Buscar diário do paciente (por data)
router.get('/api/diario', requireLogin, diarioController.buscarDiario);

// Buscar diário completo do paciente (para nutricionista)
router.get('/api/diario/:paciente_id', requireLogin, requireNutri, diarioController.buscarDiarioCompleto);

module.exports = router;
