// src/controllers/ia.controller.js
const { gerarReceitaIA } = require('../services/ia.service');
const receitasModel = require('../models/receitas.model');

async function gerarReceitaIAController(req, res, next) {
  try {
    const { ingredientes, kcal_meta, refeicao } = req.body;

    if (!Array.isArray(ingredientes) || ingredientes.length === 0) {
      return res.status(400).json({ mensagem: 'Informe ingredientes (array) com pelo menos 1 item.' });
    }
    if (!kcal_meta || Number(kcal_meta) <= 0) {
      return res.status(400).json({ mensagem: 'Informe kcal_meta válido.' });
    }
    if (!refeicao) {
      return res.status(400).json({ mensagem: 'Informe refeicao.' });
    }

    // gera
    const r = await gerarReceitaIA({ ingredientes, kcal_meta: Number(kcal_meta), refeicao });

    // salva no banco
    const id = await receitasModel.criar({
      nome: r.nome,
      descricao: r.observacao || '',
      kcal_total: Number(r.calorias) || Number(kcal_meta),
      tipo_refeicao: refeicao,
      ingredientes: r.ingredientes || ingredientes,
      modo_preparo: r.modo_preparo || [],
      criado_por: req.session.usuario_id || null,
      origem: 'ia'
    });

    return res.json({
      id,
      nome: r.nome,
      ingredientes: r.ingredientes || ingredientes,
      modo_preparo: r.modo_preparo || [],
      calorias: Number(r.calorias) || Number(kcal_meta),
      observacao: r.observacao || ''
    });
  } catch (err) {
  const status = err?.status || 500;
  const msg = err?.message || 'Erro na IA';
  console.error('[IA] erro:', status, msg, err?.raw || '');
  return res.status(status).json({ mensagem: msg });
  }

}

// ✅ exporta com o mesmo nome que o routes chama:
module.exports = { gerarReceitaIA: gerarReceitaIAController };
