const router = require('express').Router();
const controller = require('../controllers/receitas.controller');
const { requireLogin, requireNutri } = require('../middleware/auth');

router.get('/api/receitas', requireLogin, controller.listar);
router.get('/api/receitas/:id', requireLogin, controller.detalhar);

router.post('/receitas', requireLogin, requireNutri, controller.criar);

// (pra fechar CRUD)
router.put('/api/receitas/:id', requireLogin, requireNutri, controller.atualizar);
router.delete('/api/receitas/:id', requireLogin, requireNutri, controller.excluir);

module.exports = router;
