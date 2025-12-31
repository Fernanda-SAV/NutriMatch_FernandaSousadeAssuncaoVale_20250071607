const express = require('express');
const router = express.Router();
const { db } = require('../database/connection');

// Buscar alimentos por nome (autocomplete)
router.get('/alimentos', (req, res) => {
  const q = req.query.q || '';
  console.log('Buscando alimentos com q:', q);
  if (q.length < 2) {
    return res.json([]);
  }

  db.all(
    `SELECT nome, kcal_por_100g FROM alimentos WHERE nome LIKE ? ORDER BY nome LIMIT 10`,
    [`%${q}%`],
    (err, rows) => {
      if (err) {
        console.error('Erro DB:', err);
        return res.status(500).json({ mensagem: 'Erro ao buscar alimentos.' });
      }
      console.log('Resultados:', rows);
      res.json(rows);
    }
  );
});

module.exports = router;