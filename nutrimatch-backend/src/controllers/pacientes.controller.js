// src/controllers/pacientes.controller.js
const pacientesModel = require('../models/pacientes.model');

async function listar(req, res, next) {
  try {
    const nutricionista_id = req.session.usuario_id;
    const pacientes = await pacientesModel.listarPorNutricionista(nutricionista_id);
    res.json(pacientes);
  } catch (e) {
    next(e);
  }
}

async function vincular(req, res, next) {
  try {
    const nutricionista_id = req.session.usuario_id;
    const { email_paciente } = req.body;

    if (!email_paciente) {
      return res.status(400).json({ mensagem: 'Informe o e-mail do paciente.' });
    }

    await pacientesModel.vincularPorEmail(nutricionista_id, email_paciente);
    res.json({ mensagem: 'Paciente vinculado com sucesso.' });
  } catch (e) {
    // caso o model jogue erro com status, respeita
    const status = e.status || 500;
    res.status(status).json({ mensagem: e.message || 'Erro ao vincular paciente.' });
  }
}

async function desvincular(req, res, next) {
  try {
    const nutricionista_id = req.session.usuario_id;
    const paciente_id = req.params.id;

    const ok = await pacientesModel.desvincular(nutricionista_id, paciente_id);
    if (!ok) return res.status(404).json({ mensagem: 'Vínculo não encontrado.' });

    res.json({ mensagem: 'Paciente desvinculado com sucesso.' });
  } catch (e) {
    next(e);
  }
}

module.exports = { listar, vincular, desvincular };
