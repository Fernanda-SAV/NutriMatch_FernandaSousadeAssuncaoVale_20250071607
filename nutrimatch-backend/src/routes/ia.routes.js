// src/routes/ia.routes.js
const express = require('express');
const router = express.Router();

const { requireLogin } = require('../middleware/auth');
const iaController = require('../controllers/ia.controller');

// Geração de receita por IA (usado no front listagem_sugestoes.html / app.js)

router.post('/api/gerar-receita-ia', requireLogin, iaController.gerarReceitaIA);

module.exports = router;
