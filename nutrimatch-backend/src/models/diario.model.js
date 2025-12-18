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

module.exports = { salvarRegistro, buscarPorDia };
