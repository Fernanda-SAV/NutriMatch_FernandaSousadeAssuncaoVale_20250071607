// src/routes/auth.routes.js
const express = require('express');
const router = express.Router();

const authController = require('../controllers/auth.controller');

router.post('/login', authController.login);
router.get('/logout', authController.logout);

// ✅ NOVO: cadastro
router.post('/cadastro', authController.cadastro);

module.exports = router;
