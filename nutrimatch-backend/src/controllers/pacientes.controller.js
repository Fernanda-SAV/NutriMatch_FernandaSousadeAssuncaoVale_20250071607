// src/controllers/pacientes.controller.js
const pacientesModel = require('../models/pacientes.model');

async function listar(req, res) {
  try {
    const nutriId = req.session.usuario_id; // ✅ nutri logada
    const pacientes = await pacientesModel.listarPorNutricionista(nutriId);
    return res.json({ ok: true, pacientes });
  } catch (err) {
    console.error('Erro listar pacientes:', err.message);
    return res.status(500).json({ ok: false, mensagem: 'Erro ao listar pacientes.' });
  }
}

async function vincular(req, res) {
  try {
    const nutriId = req.session.usuario_id;
    const email = (req.body.email_paciente || '').trim().toLowerCase();
    if (!email) return res.status(400).json({ ok: false, mensagem: 'Informe o e-mail do paciente.' });

    const result = await pacientesModel.vincularPorEmail(nutriId, email);
    return res.json({ ok: true, ...result });
  } catch (err) {
    console.error('Erro vincular paciente:', err.message);
    return res.status(400).json({ ok: false, mensagem: err.message || 'Erro ao vincular paciente.' });
  }
}

async function atualizar(req, res) {
  try {
    const nutriId = req.session.usuario_id;
    const pacienteId = Number(req.params.id);

    const dados = {
      peso: req.body.peso ? Number(req.body.peso) : null,
      altura: req.body.altura ? Number(req.body.altura) : null,
      meta_kcal_diaria: req.body.meta_kcal ? Number(req.body.meta_kcal) : null
    };

    await pacientesModel.atualizarPaciente(nutriId, pacienteId, dados);
    return res.json({ ok: true, mensagem: 'Dados atualizados com sucesso!' });
  } catch (err) {
    console.error('Erro atualizar paciente:', err.message);
    return res.status(400).json({ ok: false, mensagem: err.message || 'Erro ao atualizar paciente.' });
  }
}

async function obter(req, res) {
  try {
    const nutriId = req.session.usuario_id;
    const pacienteId = Number(req.params.id);

    const paciente = await pacientesModel.obterPorId(nutriId, pacienteId);
    if (!paciente) {
      return res.status(404).json({ ok: false, mensagem: 'Paciente não encontrado.' });
    }

    return res.json({ ok: true, paciente });
  } catch (err) {
    console.error('Erro obter paciente:', err.message);
    return res.status(500).json({ ok: false, mensagem: 'Erro ao obter paciente.' });
  }
}

async function desvincular(req, res) {
  try {
    const nutriId = req.session.usuario_id;
    const pacienteId = Number(req.params.id);

    await pacientesModel.desvincular(nutriId, pacienteId);
    return res.json({ ok: true });
  } catch (err) {
    console.error('Erro desvincular:', err.message);
    return res.status(400).json({ ok: false, mensagem: err.message || 'Erro ao desvincular.' });
  }
}

module.exports = { listar, obter, atualizar, vincular, desvincular };
