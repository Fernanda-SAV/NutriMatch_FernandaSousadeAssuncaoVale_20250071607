// src/routes/diario.routes.js
const express = require('express');
const router = express.Router();

const { requireLogin, requireNutri } = require('../middleware/auth');
const diarioController = require('../controllers/diario.controller');

router.post('/confirmar-refeicao', requireLogin, diarioController.confirmarRefeicao);
router.get('/api/diario', requireLogin, diarioController.buscarDiario);
router.get('/api/diario/:paciente_id', requireLogin, requireNutri, diarioController.buscarDiarioCompleto);

// ✅ NOVO: paciente pode excluir uma confirmação do diário
router.delete('/api/diario/:id', requireLogin, diarioController.excluirEntrada);

module.exports = router;
