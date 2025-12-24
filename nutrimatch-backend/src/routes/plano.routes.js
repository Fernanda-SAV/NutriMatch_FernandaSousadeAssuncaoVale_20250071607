// src/routes/plano.routes.js
const express = require('express');
const router = express.Router();

const { requireLogin, requireNutri, requirePaciente } = require('../middleware/auth');
const planoController = require('../controllers/plano.controller');

// Nutricionista cria/atualiza plano (por data e refeição)
router.post('/api/plano', requireLogin, requireNutri, planoController.salvarPlano);

// Paciente (ou nutri, se você quiser permitir) consulta o plano do dia
router.get('/api/plano', requireLogin, planoController.buscarPlanoDoDia);

// Buscar plano completo do paciente (para nutricionista)
router.get('/api/plano/:paciente_id', requireLogin, requireNutri, planoController.buscarPlanoCompleto);

// Adicionar refeição ao plano
router.post('/api/plano/refeicao', requireLogin, requireNutri, planoController.adicionarRefeicao);

// Remover refeição do plano
router.delete('/api/plano/refeicao/:id', requireLogin, requireNutri, planoController.removerRefeicao);

module.exports = router;
