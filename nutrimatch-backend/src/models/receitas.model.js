// src/models/receitas.model.js
const { db } = require('../database/connection');
const crypto = require('crypto');

function normalizeArray(val) {
  if (val == null) return [];
  let arr = val;

  if (typeof val === 'string') {
    const s = val.trim();
    if (!s) return [];
    try {
      arr = JSON.parse(s);
    } catch {
      arr = s.split(',').map(x => x.trim());
    }
  }

  if (!Array.isArray(arr)) arr = [String(arr)];
  return arr
    .map(x => String(x).trim())
    .filter(Boolean)
    .map(x => x.replace(/\s+/g, ' '));
}

function stableStringify(arr) {
  const unique = [];
  const seen = new Set();
  for (const item of arr) {
    const key = item.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(item);
  }
  return JSON.stringify(unique);
}

function makeDedupeKey({ tipo_refeicao, kcal_total, ingredientes, modo_preparo }) {
  const ing = stableStringify(normalizeArray(ingredientes));
  const prep = stableStringify(normalizeArray(modo_preparo));

  const base = JSON.stringify({
    tipo_refeicao: (tipo_refeicao || '').trim(),
    kcal_total: Number(kcal_total) || 0,
    ingredientes: ing,
    modo_preparo: prep
  });

  return crypto.createHash('sha256').update(base).digest('hex');
}

function getByDedupeKey(dedupe_key) {
  return new Promise((resolve, reject) => {
    db.get(`SELECT id FROM receitas WHERE dedupe_key = ?`, [dedupe_key], (err, row) => {
      if (err) return reject(err);
      resolve(row ? row.id : null);
    });
  });
}

// ✅ criar com dedupe
function criar({ nome, descricao, kcal_total, tipo_refeicao, ingredientes, modo_preparo, criado_por, origem }) {
  return new Promise((resolve, reject) => {
    (async () => {
      try {
        const dedupe_key = makeDedupeKey({ tipo_refeicao, kcal_total, ingredientes, modo_preparo });

        db.run(
          `INSERT OR IGNORE INTO receitas
           (nome, descricao, kcal_total, tipo_refeicao, ingredientes, modo_preparo, criado_por, origem, dedupe_key)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            nome,
            descricao || '',
            Number(kcal_total),
            tipo_refeicao || null,
            typeof ingredientes === 'string'
              ? ingredientes
              : JSON.stringify(normalizeArray(ingredientes)),
            typeof modo_preparo === 'string'
              ? modo_preparo
              : JSON.stringify(normalizeArray(modo_preparo)),
            criado_por || null,
            origem || 'banco',
            dedupe_key
          ],
          async function (err) {
            if (err) return reject(err);

            if (this.lastID) return resolve(this.lastID);

            const existingId = await getByDedupeKey(dedupe_key);
            return resolve(existingId);
          }
        );
      } catch (e) {
        reject(e);
      }
    })();
  });
}

function listar({ refeicao, kcal } = {}) {
  return new Promise((resolve, reject) => {
    let sql = `SELECT * FROM receitas`;
    const params = [];
    const where = [];

    if (refeicao) {
      where.push(`tipo_refeicao = ?`);
      params.push(refeicao);
    }

    if (kcal && !Number.isNaN(kcal)) {
      const min = Math.round(kcal * 0.90);
      const max = Math.round(kcal * 1.10);
      where.push(`kcal_total BETWEEN ? AND ?`);
      params.push(min, max);
    }

    if (where.length) sql += ` WHERE ` + where.join(' AND ');
    sql += ` ORDER BY id DESC`;

    db.all(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows || []);
    });
  });
}

function buscarPorId(id) {
  return new Promise((resolve, reject) => {
    db.get(`SELECT * FROM receitas WHERE id = ?`, [id], (err, row) => {
      if (err) return reject(err);
      resolve(row || null);
    });
  });
}

function atualizar(id, { nome, descricao, kcal_total }) {
  return new Promise((resolve, reject) => {
    db.run(
      `UPDATE receitas SET nome = ?, descricao = ?, kcal_total = ? WHERE id = ?`,
      [nome, descricao || '', Number(kcal_total), id],
      function (err) {
        if (err) return reject(err);
        resolve(this.changes > 0);
      }
    );
  });
}

function excluir(id) {
  return new Promise((resolve, reject) => {
    db.run(`DELETE FROM receitas WHERE id = ?`, [id], function (err) {
      if (err) return reject(err);
      resolve(this.changes > 0);
    });
  });
}

module.exports = { listar, buscarPorId, criar, atualizar, excluir };
