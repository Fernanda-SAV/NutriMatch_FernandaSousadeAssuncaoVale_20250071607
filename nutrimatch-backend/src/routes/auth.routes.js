// src/routes/auth.routes.js
const express = require('express');
const router = express.Router();

const authController = require('../controllers/auth.controller');
const { requireLogin } = require('../middleware/auth');

router.post('/login', authController.login);
router.get('/logout', authController.logout);

// ✅ NOVO: cadastro
router.post('/cadastro', authController.cadastro);

// ✅ NOVO: forgot password
router.post('/forgot-password', authController.forgotPassword);

// ✅ NOVO: user profile
router.get('/api/user', requireLogin, authController.getUser);
router.put('/api/user', requireLogin, authController.updateUser);

module.exports = router;
