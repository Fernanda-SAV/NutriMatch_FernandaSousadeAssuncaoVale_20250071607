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
        u.altura,
        p.meta_kcal_diaria
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

function obterPorId(nutriId, pacienteId) {
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
        u.altura,
        p.meta_kcal_diaria
      FROM pacientes p
      JOIN usuarios u ON u.id = p.usuario_id
      WHERE p.id = ? AND p.nutricionista_id = ?
    `;
    db.get(sql, [pacienteId, nutriId], (err, row) => {
      if (err) return reject(err);
      resolve(row);
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
              return resolve({ mensagem: 'Paciente vinculado com sucesso!' });
            }

            // 2) se não existia registro em pacientes, cria agora (UPSERT manual)
            db.run(
              `INSERT INTO pacientes (usuario_id, nutricionista_id) VALUES (?, ?)`,
              [user.id, nutricionista_id],
              function (err3) {
                if (err3) return reject(err3);
                resolve({ mensagem: 'Paciente vinculado com sucesso!' });
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

function atualizarPaciente(nutriId, pacienteId, dados) {
  return new Promise((resolve, reject) => {
    // Primeiro, verificar se o paciente pertence ao nutricionista
    db.get(
      `SELECT p.usuario_id FROM pacientes p WHERE p.id = ? AND p.nutricionista_id = ?`,
      [pacienteId, nutriId],
      (err, row) => {
        if (err) return reject(err);
        if (!row) return reject(new Error('Paciente não encontrado ou não vinculado a você.'));

        const usuarioId = row.usuario_id;

        // Atualizar usuarios
        db.run(
          `UPDATE usuarios SET nome = ?, email = ?, telefone = ?, nascimento = ?, sexo = ?, peso = ?, altura = ? WHERE id = ?`,
          [dados.nome, dados.email, dados.telefone, dados.nascimento, dados.sexo, dados.peso, dados.altura, usuarioId],
          function (err2) {
            if (err2) return reject(err2);

            // Atualizar pacientes
            db.run(
              `UPDATE pacientes SET meta_kcal_diaria = ? WHERE id = ?`,
              [dados.meta_kcal_diaria, pacienteId],
              function (err3) {
                if (err3) return reject(err3);
                resolve();
              }
            );
          }
        );
      }
    );
  });
}

module.exports = { listarPorNutricionista, obterPorId, vincularPorEmail, desvincular, atualizarPaciente };
