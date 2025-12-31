const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', 'nutrimatch.db');
console.log('Criando/abrindo DB em:', dbPath);

const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  // (opcional, mas recomendado) garantir FK no SQLite
  db.run(`PRAGMA foreign_keys = ON;`);

  // ========= TABELA USUÁRIOS =========
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

  // ========= TABELA RECEITAS (ALINHADA AO MODEL ATUAL) =========
  // Model espera: nome, descricao, kcal_total
  db.run(`
    CREATE TABLE IF NOT EXISTS receitas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      descricao TEXT,
      kcal_total INTEGER NOT NULL
    );
  `);

  // ========= TABELA ALIMENTOS (AUTOCOMPLETE) =========
  db.run(`
    CREATE TABLE IF NOT EXISTS alimentos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL UNIQUE,
      kcal_por_100g REAL NOT NULL
    );
  `);

  // Seed de alimentos
  const alimentosIniciais = [
    ['Arroz cozido', 130],
    ['Feijão cozido', 76],
    ['Frango grelhado', 165],
    ['Peixe assado', 120],
    ['Batata cozida', 77],
    ['Salada de alface', 15],
    ['Maçã', 52],
    ['Banana', 89],
    ['Pão francês', 300],
    ['Queijo minas', 350],
    ['Leite integral', 61],
    ['Iogurte natural', 61],
    ['Ovo cozido', 155],
    ['Tomate', 18],
    ['Cenoura cozida', 25],
    ['Abóbora refogada', 20],
    ['Macarrão cozido', 157],
    ['Carne bovina grelhada', 250],
    ['Suco de laranja', 49],
    ['Café com leite', 50],
  ];

  alimentosIniciais.forEach(([nome, kcal]) => {
    db.run(
      `INSERT OR IGNORE INTO alimentos (nome, kcal_por_100g) VALUES (?, ?)`,
      [nome, kcal]
    );
  });

  // ========= TABELA PACIENTES (VÍNCULO) =========
  db.run(`
    CREATE TABLE IF NOT EXISTS pacientes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      usuario_id INTEGER NOT NULL UNIQUE,
      nutricionista_id INTEGER,
      meta_kcal_diaria INTEGER,
      FOREIGN KEY(usuario_id) REFERENCES usuarios(id),
      FOREIGN KEY(nutricionista_id) REFERENCES usuarios(id)
    );
  `);

  db.run(`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_pacientes_usuario_id
    ON pacientes(usuario_id);
  `);

  // ========= TABELA PLANOS_REFEICOES (ALINHADA AO MODEL ATUAL) =========
  db.run(`
    CREATE TABLE IF NOT EXISTS planos_refeicoes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      paciente_id INTEGER NOT NULL,
      nutricionista_id INTEGER NOT NULL,
      data TEXT NOT NULL,
      refeicao TEXT NOT NULL,
      kcal_meta INTEGER NOT NULL,
      receita_recomendada TEXT NOT NULL,
      FOREIGN KEY(paciente_id) REFERENCES pacientes(id),
      FOREIGN KEY(nutricionista_id) REFERENCES usuarios(id)
    );
  `);

  // evita duplicar a mesma refeição do mesmo dia
  db.run(`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_plano_unico
    ON planos_refeicoes(paciente_id, data, refeicao, receita_recomendada);
  `);

  // ========= TABELA DIARIO_REFEICOES (ALINHADA AO MODEL ATUAL) =========
  db.run(`
    CREATE TABLE IF NOT EXISTS diario_refeicoes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      paciente_id INTEGER NOT NULL,
      data TEXT NOT NULL,
      refeicao TEXT NOT NULL,
      receita_id INTEGER,
      receita_nome TEXT NOT NULL,
      kcal_consumidas INTEGER NOT NULL,
      origem TEXT DEFAULT 'plano',
      observacao TEXT,
      FOREIGN KEY(paciente_id) REFERENCES pacientes(id)
    );
  `);

  db.run(`
    CREATE INDEX IF NOT EXISTS idx_diario_paciente_data
    ON diario_refeicoes(paciente_id, data);
  `);

  console.log('✅ Tabelas criadas/verificadas com sucesso (schema novo).');
});

db.close();
