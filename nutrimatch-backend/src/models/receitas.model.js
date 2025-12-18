const { db } = require('../database/connection');

function listar() {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM receitas ORDER BY id DESC', (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}

function buscarPorId(id) {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM receitas WHERE id = ?', [id], (err, row) => {
      if (err) return reject(err);
      resolve(row);
    });
  });
}

function criar({ nome, descricao, kcal_total }) {
  return new Promise((resolve, reject) => {
    db.run(
      'INSERT INTO receitas (nome, descricao, kcal_total) VALUES (?, ?, ?)',
      [nome, descricao || '', kcal_total],
      function (err) {
        if (err) return reject(err);
        resolve(this.lastID);
      }
    );
  });
}

function atualizar(id, { nome, descricao, kcal_total }) {
  return new Promise((resolve, reject) => {
    db.run(
      'UPDATE receitas SET nome=?, descricao=?, kcal_total=? WHERE id=?',
      [nome, descricao || '', kcal_total, id],
      function (err) {
        if (err) return reject(err);
        resolve(this.changes > 0);
      }
    );
  });
}

function excluir(id) {
  return new Promise((resolve, reject) => {
    db.run('DELETE FROM receitas WHERE id=?', [id], function (err) {
      if (err) return reject(err);
      resolve(this.changes > 0);
    });
  });
}

module.exports = { listar, buscarPorId, criar, atualizar, excluir };
