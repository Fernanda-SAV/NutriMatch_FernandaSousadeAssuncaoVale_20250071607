// src/controllers/plano.controller.js
const planoModel = require('../models/plano.model');

/**
 * Nutricionista salva (cria/atualiza) uma recomendação para uma refeição em uma data
 * Espera: { paciente_id, data, refeicao, kcal_meta, receita_recomendada }
 */
async function salvarPlano(req, res, next) {
  try {
    const nutricionista_id = req.session.usuario_id;
    const { paciente_id, data, refeicao, kcal_meta, receita_recomendada } = req.body;

    if (!paciente_id || !data || !refeicao || !kcal_meta || !receita_recomendada) {
      return res.status(400).json({ mensagem: 'Campos obrigatórios: paciente_id, data, refeicao, kcal_meta, receita_recomendada.' });
    }

    await planoModel.salvarPlano({
      nutricionista_id,
      paciente_id,
      data,
      refeicao,
      kcal_meta,
      receita_recomendada,
    });

    res.json({ mensagem: 'Plano salvo com sucesso.' });
  } catch (e) {
    next(e);
  }
}

/**
 * Busca o plano do dia
 * - Se for paciente: usa o próprio paciente_id da sessão
 * - Se for nutricionista: aceita paciente_id por query (?paciente_id=)
 */
async function buscarPlanoDoDia(req, res, next) {
  try {
    const tipo = req.session.tipo;
    const data = req.query.data || new Date().toISOString().slice(0, 10);

    let paciente_id;

    if (tipo === 'paciente') {
      paciente_id = await planoModel.getPacienteIdByUsuarioId(req.session.usuario_id);
      if (!paciente_id) return res.status(404).json({ mensagem: 'Paciente não encontrado.' });
    } else {
      paciente_id = req.query.paciente_id;
      if (!paciente_id) return res.status(400).json({ mensagem: 'Informe paciente_id na query.' });
    }

    const plano = await planoModel.buscarPlanoDoDia(paciente_id, data);
    res.json(plano);
  } catch (e) {
    next(e);
  }
}

module.exports = { salvarPlano, buscarPlanoDoDia };
