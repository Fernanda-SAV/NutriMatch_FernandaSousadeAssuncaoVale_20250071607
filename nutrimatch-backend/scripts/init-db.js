const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', 'nutrimatch.db');
console.log('Criando/abrindo DB em:', dbPath);

const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      senha TEXT NOT NULL,
      tipo TEXT NOT NULL CHECK(tipo IN ('paciente','nutricionista')),
      nascimento TEXT,
      telefone TEXT,
      sexo TEXT,
      crn TEXT,
      peso REAL,
      altura REAL
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS receitas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      titulo TEXT NOT NULL,
      ingredientes TEXT NOT NULL,
      modo_preparo TEXT NOT NULL,
      calorias INTEGER,
      tipo_refeicao TEXT,
      criado_por INTEGER,
      FOREIGN KEY(criado_por) REFERENCES usuarios(id)
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS pacientes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      usuario_id INTEGER NOT NULL,
      nutricionista_id INTEGER,
      FOREIGN KEY(usuario_id) REFERENCES usuarios(id),
      FOREIGN KEY(nutricionista_id) REFERENCES usuarios(id)
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS planos_refeicoes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      paciente_id INTEGER NOT NULL,
      data TEXT NOT NULL,
      kcal_diaria INTEGER,
      cardapio TEXT,
      FOREIGN KEY(paciente_id) REFERENCES pacientes(id)
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS diario_refeicoes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      paciente_id INTEGER NOT NULL,
      data TEXT NOT NULL,
      refeicao TEXT NOT NULL,
      feito INTEGER DEFAULT 0,
      observacao TEXT,
      FOREIGN KEY(paciente_id) REFERENCES pacientes(id)
    );
  `);

  console.log('✅ Tabelas criadas/verificadas com sucesso.');
});

db.close();
