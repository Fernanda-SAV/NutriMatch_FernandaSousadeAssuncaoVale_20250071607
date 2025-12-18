// src/controllers/ia.controller.js
const { gerarReceitaIA } = require('../services/ia.service');

async function gerarReceita(req, res, next) {
  try {
    const { ingredientes, kcal_meta, refeicao } = req.body;

    if (!ingredientes || !Array.isArray(ingredientes) || ingredientes.length === 0) {
      return res.status(400).json({ mensagem: 'Informe uma lista de ingredientes.' });
    }
    if (!kcal_meta) {
      return res.status(400).json({ mensagem: 'Informe kcal_meta.' });
    }

    const resposta = await gerarReceitaIA({
      ingredientes,
      kcal_meta,
      refeicao: refeicao || 'refeição'
    });

    res.json(resposta);
  } catch (e) {
    next(e);
  }
}

module.exports = { gerarReceita };
