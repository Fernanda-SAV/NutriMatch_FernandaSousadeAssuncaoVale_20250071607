// src/models/plano.model.js
const { db } = require('../database/connection');

function salvarPlano({ nutricionista_id, paciente_id, data, refeicao, kcal_meta, receita_recomendada }) {
  return new Promise((resolve, reject) => {
    // Deleta registro anterior da mesma refeição/data e insere novo (simples e eficaz para MVP)
    db.run(
      `DELETE FROM planos_refeicoes WHERE paciente_id = ? AND data = ? AND refeicao = ?`,
      [paciente_id, data, refeicao],
      (err) => {
        if (err) return reject(err);

        db.run(
          `INSERT INTO planos_refeicoes (paciente_id, nutricionista_id, data, refeicao, kcal_meta, receita_recomendada)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [paciente_id, nutricionista_id, data, refeicao, kcal_meta, receita_recomendada],
          function (err2) {
            if (err2) return reject(err2);
            resolve(this.lastID);
          }
        );
      }
    );
  });
}

function buscarPlanoDoDia(paciente_id, data) {
  return new Promise((resolve, reject) => {
    db.all(
      `SELECT * FROM planos_refeicoes WHERE paciente_id = ? AND data = ? ORDER BY refeicao`,
      [paciente_id, data],
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

module.exports = { salvarPlano, buscarPlanoDoDia, getPacienteIdByUsuarioId };
