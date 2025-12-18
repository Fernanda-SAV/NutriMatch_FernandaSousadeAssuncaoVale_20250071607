// src/models/pacientes.model.js
const { db } = require('../database/connection');

function listarPorNutricionista(nutricionista_id) {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT p.id as paciente_id, u.nome, u.email, p.meta_kcal_diaria, p.peso, p.altura
      FROM pacientes p
      JOIN usuarios u ON u.id = p.usuario_id
      WHERE p.nutricionista_id = ?
      ORDER BY u.nome ASC
    `;
    db.all(sql, [nutricionista_id], (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}

function vincularPorEmail(nutricionista_id, email_paciente) {
  return new Promise((resolve, reject) => {
    db.get(
      `SELECT id FROM usuarios WHERE email = ? AND tipo = 'paciente'`,
      [email_paciente],
      (err, user) => {
        if (err) return reject(err);
        if (!user) {
          const e = new Error('Paciente não encontrado (confira o e-mail e o tipo).');
          e.status = 404;
          return reject(e);
        }

        db.run(
          `UPDATE pacientes SET nutricionista_id = ? WHERE usuario_id = ?`,
          [nutricionista_id, user.id],
          function (err2) {
            if (err2) return reject(err2);
            resolve(true);
          }
        );
      }
    );
  });
}

function desvincular(nutricionista_id, paciente_id) {
  return new Promise((resolve, reject) => {
    db.run(
      `UPDATE pacientes SET nutricionista_id = NULL WHERE id = ? AND nutricionista_id = ?`,
      [paciente_id, nutricionista_id],
      function (err) {
        if (err) return reject(err);
        resolve(this.changes > 0);
      }
    );
  });
}

module.exports = { listarPorNutricionista, vincularPorEmail, desvincular };
