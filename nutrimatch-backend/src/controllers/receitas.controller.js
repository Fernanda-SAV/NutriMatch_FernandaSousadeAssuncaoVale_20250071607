const receitasModel = require('../models/receitas.model');

async function listar(req, res, next) {
  try {
    const refeicao = (req.query.refeicao || '').trim();
    const kcal = req.query.kcal ? Number(req.query.kcal) : null;

    const receitas = await receitasModel.listar({ refeicao, kcal });
    res.json(receitas);
  } catch (e) { next(e); }
}

async function detalhar(req, res, next) {
  try {
    const r = await receitasModel.buscarPorId(req.params.id);
    if (!r) return res.status(404).json({ mensagem: 'Receita não encontrada.' });
    res.json(r);
  } catch (e) { next(e); }
}

async function criar(req, res, next) {
  try {
    const { nome, descricao, kcal_total, tipo_refeicao, ingredientes, modo_preparo, origem } = req.body;

    if (!nome || !kcal_total) {
      return res.status(400).json({ mensagem: 'nome e kcal_total são obrigatórios.' });
    }

    const id = await receitasModel.criar({
      nome,
      descricao,
      kcal_total: Number(kcal_total),
      tipo_refeicao: tipo_refeicao || null,
      ingredientes: ingredientes || null,
      modo_preparo: modo_preparo || null,
      criado_por: req.session.usuario_id || null,
      origem: origem || 'banco'
    });

    res.status(201).json({ mensagem: 'Receita cadastrada!', id });
  } catch (e) { next(e); }
}

async function atualizar(req, res, next) {
  try {
    const { nome, descricao, kcal_total } = req.body;
    if (!nome || !kcal_total) return res.status(400).json({ mensagem: 'Nome e kcal_total são obrigatórios.' });

    const ok = await receitasModel.atualizar(req.params.id, { nome, descricao, kcal_total });
    if (!ok) return res.status(404).json({ mensagem: 'Receita não encontrada.' });

    res.json({ mensagem: 'Receita atualizada com sucesso.' });
  } catch (e) { next(e); }
}

async function excluir(req, res, next) {
  try {
    const ok = await receitasModel.excluir(req.params.id);
    if (!ok) return res.status(404).json({ mensagem: 'Receita não encontrada.' });
    res.json({ mensagem: 'Receita excluída com sucesso.' });
  } catch (e) { next(e); }
}

module.exports = { listar, detalhar, criar, atualizar, excluir };
