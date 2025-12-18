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

function vincularPorEmail(nutriId, email) {
  return new Promise((resolve, reject) => {
    // acha usuario paciente pelo email
    db.get(
      `SELECT id, tipo FROM usuarios WHERE email = ?`,
      [email],
      (err, user) => {
        if (err) return reject(err);
        if (!user) return reject(new Error('Paciente não encontrado.'));
        if (user.tipo !== 'paciente') return reject(new Error('Este e-mail não é de um paciente.'));

        // acha registro na tabela pacientes
        db.get(
          `SELECT id, nutricionista_id FROM pacientes WHERE usuario_id = ?`,
          [user.id],
          (err2, pac) => {
            if (err2) return reject(err2);
            if (!pac) return reject(new Error('Registro de paciente não encontrado (tabela pacientes).'));

            // se já vinculado a outro nutri, você decide a regra:
            if (pac.nutricionista_id && pac.nutricionista_id !== nutriId) {
              return reject(new Error('Paciente já está vinculado a outro nutricionista.'));
            }

            db.run(
              `UPDATE pacientes SET nutricionista_id = ? WHERE id = ?`,
              [nutriId, pac.id],
              function (err3) {
                if (err3) return reject(err3);
                resolve({ paciente_id: pac.id, usuario_id: user.id });
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
