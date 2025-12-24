// src/controllers/diario.controller.js
const diarioModel = require('../models/diario.model');
const planoModel = require('../models/plano.model');

async function confirmarRefeicao(req, res, next) {
  try {
    // Ideal: somente paciente, mas por enquanto basta estar logado
    const usuario_id = req.session.usuario_id;
    const tipo = req.session.tipo;

    // Se for paciente, pega paciente_id a partir do usuario_id
    // Se for nutri, pode aceitar paciente_id no body (opcional)
    let paciente_id = null;
    if (tipo === 'paciente') {
      paciente_id = await planoModel.getPacienteIdByUsuarioId(usuario_id);
      if (!paciente_id) return res.status(404).json({ mensagem: 'Paciente não encontrado.' });
    } else {
      paciente_id = req.body.paciente_id;
      if (!paciente_id) return res.status(400).json({ mensagem: 'Informe paciente_id.' });
    }

    const {
      data,
      refeicao,
      receita_id,
      receita_nome,
      kcal_consumidas,
      origem, // "plano" ou "substituicao"
      observacao
    } = req.body;

    if (!data || !refeicao || !receita_nome || !kcal_consumidas) {
      return res.status(400).json({ mensagem: 'Campos obrigatórios: data, refeicao, receita_nome, kcal_consumidas.' });
    }

    await diarioModel.salvarRegistro({
      paciente_id,
      data,
      refeicao,
      receita_id: receita_id || null,
      receita_nome,
      kcal_consumidas,
      origem: origem || 'plano',
      observacao: observacao || ''
    });

    res.json({ mensagem: 'Refeição registrada no diário.' });
  } catch (e) {
    next(e);
  }
}

async function buscarDiario(req, res, next) {
  try {
    const usuario_id = req.session.usuario_id;
    const tipo = req.session.tipo;
    const data = req.query.data || new Date().toISOString().slice(0, 10);

    let paciente_id = null;
    if (tipo === 'paciente') {
      paciente_id = await planoModel.getPacienteIdByUsuarioId(usuario_id);
      if (!paciente_id) return res.status(404).json({ mensagem: 'Paciente não encontrado.' });
    } else {
      paciente_id = req.query.paciente_id;
      if (!paciente_id) return res.status(400).json({ mensagem: 'Informe paciente_id na query.' });
    }

    const registros = await diarioModel.buscarPorDia(paciente_id, data);
    res.json(registros);
  } catch (e) {
    next(e);
  }
}

/**
 * Busca o diário completo do paciente (todos os registros)
 */
async function buscarDiarioCompleto(req, res, next) {
  try {
    const paciente_id = req.params.paciente_id;
    const registros = await diarioModel.buscarCompleto(paciente_id);
    res.json(registros);
  } catch (e) {
    next(e);
  }
}

module.exports = { confirmarRefeicao, buscarDiario, buscarDiarioCompleto };
