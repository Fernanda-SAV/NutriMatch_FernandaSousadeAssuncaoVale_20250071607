const { db } = require('./connection');

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS usuarios (...)`);
  db.run(`CREATE TABLE IF NOT EXISTS pacientes (...)`);
  db.run(`CREATE TABLE IF NOT EXISTS receitas (...)`);
  db.run(`CREATE TABLE IF NOT EXISTS planos_refeicoes (...)`);
  db.run(`CREATE TABLE IF NOT EXISTS diario_refeicoes (...)`);
});
