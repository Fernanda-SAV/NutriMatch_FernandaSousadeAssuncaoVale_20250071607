const express = require('express');
const router = express.Router();

const { requireLogin, requireNutri } = require('../middleware/auth');
const planoController = require('../controllers/plano.controller');

// Plano “por data” (mantém se você quiser histórico)
router.post('/api/plano', requireLogin, requireNutri, planoController.salvarPlano);
router.get('/api/plano', requireLogin, planoController.buscarPlanoDoDia);

// Plano completo (nutri)
router.get('/api/plano/:paciente_id', requireLogin, requireNutri, planoController.buscarPlanoCompleto);

// Refeições (nutri)
router.post('/api/plano/refeicao', requireLogin, requireNutri, planoController.adicionarRefeicao);
router.delete('/api/plano/refeicao/:id', requireLogin, requireNutri, planoController.removerRefeicao);

// ✅ PLANO ATUAL
router.get('/api/plano-atual', requireLogin, planoController.buscarPlanoAtual);
router.get('/api/plano-atual/:paciente_id', requireLogin, planoController.buscarPlanoAtual);

// ✅ SALVAR plano atual (nutri)
router.post('/api/plano-atual/:paciente_id', requireLogin, requireNutri, planoController.salvarPlanoAtual);

module.exports = router;
