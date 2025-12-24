// src/models/usuarios.model.js
const { db } = require('../database/connection');

function buscarPorEmail(email) {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM usuarios WHERE email = ?', [email], (err, row) => {
      if (err) return reject(err);
      resolve(row);
    });
  });
}

function buscarPorId(id) {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM usuarios WHERE id = ?', [id], (err, row) => {
      if (err) return reject(err);
      resolve(row);
    });
  });
}

function atualizarUsuario(id, updates) {
  return new Promise((resolve, reject) => {
    const fields = Object.keys(updates);
    if (!fields.length) {
      return resolve(0);
    }
    const values = Object.values(updates);
    const setClause = fields.map(f => `${f} = ?`).join(', ');
    values.push(id);
    db.run(`UPDATE usuarios SET ${setClause} WHERE id = ?`, values, function (err) {
      if (err) return reject(err);
      resolve(this.changes);
    });
  });
}

function criarUsuario(dados) {
  const {
    nome, email, senha, tipo,
    nascimento, telefone, sexo,
    crn, peso, altura
  } = dados;

  return new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO usuarios
      (nome, email, senha, tipo, nascimento, telefone, sexo, crn, peso, altura)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [nome, email, senha, tipo, nascimento, telefone, sexo, crn || null, peso || null, altura || null],
      function (err) {
        if (err) return reject(err);
        resolve({ id: this.lastID });
      }
    );
  });
}

function criarPaciente(usuarioId) {
  return new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO pacientes (usuario_id) VALUES (?)`,
      [usuarioId],
      function (err) {
        if (err) return reject(err);
        resolve({ id: this.lastID });
      }
    );
  });
}

function atualizarSenha(id, senhaHash) {
  return new Promise((resolve, reject) => {
    db.run(
      `UPDATE usuarios SET senha = ? WHERE id = ?`,
      [senhaHash, id],
      function (err) {
        if (err) return reject(err);
        resolve(this.changes);
      }
    );
  });
}

module.exports = { buscarPorEmail, buscarPorId, atualizarUsuario, criarUsuario, criarPaciente, atualizarSenha };
