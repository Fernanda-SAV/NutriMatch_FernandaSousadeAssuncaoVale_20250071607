const express = require('express');
const router = express.Router();

function safeUse(label, mod) {
  console.log(label, '=>', typeof mod);
  router.use(mod);
}

safeUse('auth', require('./auth.routes'));
safeUse('receitas', require('./receitas.routes'));
safeUse('pacientes', require('./pacientes.routes'));
safeUse('plano', require('./plano.routes'));
safeUse('diario', require('./diario.routes'));
safeUse('ia', require('./ia.routes'));
safeUse('alimentos', require('./alimentos.routes'));

module.exports = router;
