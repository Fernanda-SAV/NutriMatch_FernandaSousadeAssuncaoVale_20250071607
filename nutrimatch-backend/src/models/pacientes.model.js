// src/models/pacientes.model.js
const { db } = require('../database/connection');

function listarPorNutricionista(nutriId) {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT
        p.id AS paciente_id,
        u.id AS usuario_id,
        u.nome,
        u.email,
        u.telefone,
        u.sexo,
        u.nascimento,
        u.peso,
        u.altura
      FROM pacientes p
      JOIN usuarios u ON u.id = p.usuario_id
      WHERE p.nutricionista_id = ?
      ORDER BY u.nome ASC
    `;
    db.all(sql, [nutriId], (err, rows) => {
      if (err) return reject(err);
      resolve(rows || []);
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

        // 1) tenta atualizar vínculo (caso já exista registro em pacientes)
        db.run(
          `UPDATE pacientes SET nutricionista_id = ? WHERE usuario_id = ?`,
          [nutricionista_id, user.id],
          function (err2) {
            if (err2) return reject(err2);

            // ✅ se atualizou, ok
            if (this.changes > 0) {
              return resolve(true);
            }

            // 2) se não existia registro em pacientes, cria agora (UPSERT manual)
            db.run(
              `INSERT INTO pacientes (usuario_id, nutricionista_id) VALUES (?, ?)`,
              [user.id, nutricionista_id],
              function (err3) {
                if (err3) return reject(err3);
                resolve(true);
              }
            );
          }
        );
      }
    );
  });
}



function desvincular(nutriId, pacienteId) {
  return new Promise((resolve, reject) => {
    db.run(
      `UPDATE pacientes SET nutricionista_id = NULL WHERE id = ? AND nutricionista_id = ?`,
      [pacienteId, nutriId],
      function (err) {
        if (err) return reject(err);
        if (this.changes === 0) return reject(new Error('Paciente não encontrado ou não vinculado a você.'));
        resolve();
      }
    );
  });
}

module.exports = { listarPorNutricionista, vincularPorEmail, desvincular };
