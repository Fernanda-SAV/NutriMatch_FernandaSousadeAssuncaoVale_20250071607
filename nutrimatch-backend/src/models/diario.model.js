// src/models/diario.model.js
const { db } = require('../database/connection');

function salvarRegistro({ paciente_id, data, refeicao, receita_id, receita_nome, kcal_consumidas, origem, observacao }) {
  return new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO diario_refeicoes 
       (paciente_id, data, refeicao, receita_id, receita_nome, kcal_consumidas, origem, observacao)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [paciente_id, data, refeicao, receita_id, receita_nome, kcal_consumidas, origem, observacao],
      function (err) {
        if (err) return reject(err);
        resolve(this.lastID);
      }
    );
  });
}

function buscarPorDia(paciente_id, data) {
  return new Promise((resolve, reject) => {
    db.all(
      `SELECT * FROM diario_refeicoes WHERE paciente_id = ? AND data = ? ORDER BY id DESC`,
      [paciente_id, data],
      (err, rows) => {
        if (err) return reject(err);
        resolve(rows || []);
      }
    );
  });
}

function buscarCompleto(paciente_id) {
  return new Promise((resolve, reject) => {
    db.all(
      `SELECT * FROM diario_refeicoes WHERE paciente_id = ? ORDER BY data DESC, id DESC`,
      [paciente_id],
      (err, rows) => {
        if (err) return reject(err);
        resolve(rows || []);
      }
    );
  });
}

function getPacienteIdByUsuarioId(usuario_id) {
  return new Promise((resolve, reject) => {
    db.get(
      `SELECT id FROM pacientes WHERE usuario_id = ?`,
      [usuario_id],
      (err, row) => {
        if (err) return reject(err);
        resolve(row ? row.id : null);
      }
    );
  });
}

function deleteEntradaByIdAndPaciente(id, paciente_id) {
  return new Promise((resolve, reject) => {
    db.run(
      `DELETE FROM diario_refeicoes WHERE id = ? AND paciente_id = ?`,
      [id, paciente_id],
      function (err) {
        if (err) return reject(err);
        resolve(this.changes); // 0 ou 1
      }
    );
  });
}

module.exports = { salvarRegistro, buscarPorDia, buscarCompleto, getPacienteIdByUsuarioId,
  deleteEntradaByIdAndPaciente };
