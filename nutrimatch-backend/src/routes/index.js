const router = require('express').Router();

router.use(require('./auth.routes'));
router.use(require('./receitas.routes'));
router.use(require('./pacientes.routes'));
router.use(require('./plano.routes'));
router.use(require('./diario.routes'));
router.use(require('./ia.routes'));

module.exports = router;
