const express = require('express');
const router = express.Router();

router.post('/login', (req, res) => {
  res.json({ ok: true });
});

router.get('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/'));
});

module.exports = router;
