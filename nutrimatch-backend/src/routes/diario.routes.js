// src/routes/diario.routes.js
const express = require('express');
const router = express.Router();

const { requireLogin } = require('../middleware/auth');
const diarioController = require('../controllers/diario.controller');

// Paciente confirma refeição (salva no diário)
router.post('/confirmar-refeicao', requireLogin, diarioController.confirmarRefeicao);

// Buscar diário do paciente (por data)
router.get('/api/diario', requireLogin, diarioController.buscarDiario);

module.exports = router;
