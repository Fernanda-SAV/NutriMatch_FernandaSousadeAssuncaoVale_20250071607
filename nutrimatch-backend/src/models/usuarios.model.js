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

module.exports = { buscarPorEmail, criarUsuario, criarPaciente };
