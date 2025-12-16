// db.js
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// cria/abre o arquivo nutrimatch.db na pasta do projeto
const dbPath = path.join(__dirname, 'nutrimatch.db');
const db = new sqlite3.Database(dbPath);

// cria tabelas se não existirem
db.serialize(() => {

  // TABELA DE USUÁRIOS (nutricionistas e pacientes)
  db.run(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      senha_hash TEXT NOT NULL,
      tipo TEXT NOT NULL,             -- 'nutricionista' ou 'paciente'
      nascimento TEXT,                -- data de nascimento (YYYY-MM-DD)
      telefone TEXT,
      sexo TEXT,
      email_verificado INTEGER DEFAULT 0,
      token_verificacao TEXT,
      crn TEXT,                       -- CRN do nutricionista (se for o caso)
      criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // TABELA DE PACIENTES (dados extras + vínculo com nutricionista)
  db.run(`
    CREATE TABLE IF NOT EXISTS pacientes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      usuario_id INTEGER NOT NULL,    -- referência ao usuário do tipo 'paciente'
      nutricionista_id INTEGER,       -- referência ao usuário do tipo 'nutricionista'
      peso REAL,
      altura REAL,
      meta_kcal_diaria INTEGER,       -- definido depois pelo nutricionista (pode ser NULL)
      FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
      FOREIGN KEY (nutricionista_id) REFERENCES usuarios(id)
    )
  `);

  // TABELA DE RECEITAS (banco de receitas + receitas geradas por IA)
  db.run(`
    CREATE TABLE IF NOT EXISTS receitas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      descricao TEXT,
      kcal_total INTEGER NOT NULL,
      modo_preparo TEXT
      -- futuramente você pode ter: categoria_refeicao, origem ('plano','ia','banco'), etc.
    )
  `);

  // TABELA QUE GUARDA O PLANO DE REFEIÇÕES QUE A NUTRI MONTA
  db.run(`
    CREATE TABLE IF NOT EXISTS planos_refeicoes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nutricionista_id INTEGER NOT NULL,   -- nutri que montou o plano
      paciente_id INTEGER NOT NULL,        -- paciente dono do plano
      refeicao TEXT NOT NULL,              -- 'cafe_manha','lanche_manha','almoco',...
      receita_id INTEGER NOT NULL,         -- uma das 3 receitas sugeridas
      kcal_meta INTEGER NOT NULL,          -- meta de kcal da refeição
      data_plano TEXT NOT NULL,            -- ex: '2025-12-10' (data de referência do plano)
      FOREIGN KEY (nutricionista_id) REFERENCES usuarios(id),
      FOREIGN KEY (paciente_id) REFERENCES pacientes(id),
      FOREIGN KEY (receita_id) REFERENCES receitas(id)
    )
  `);

  // DIÁRIO ALIMENTAR: o que o paciente realmente confirmou que comeu
  db.run(`
    CREATE TABLE IF NOT EXISTS diario_refeicoes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      paciente_id INTEGER NOT NULL,
      nutricionista_id INTEGER,           -- opcional, mas útil para filtrar por nutri
      data_refeicao TEXT NOT NULL,        -- ex: '2025-12-10' (YYYY-MM-DD)
      refeicao TEXT NOT NULL,             -- 'cafe_manha','lanche_manha','almoco',...
      receita_id INTEGER NOT NULL,        -- receita que o paciente realmente fez
      origem TEXT,                        -- 'plano' ou 'substituicao'
      confirmado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (paciente_id) REFERENCES pacientes(id),
      FOREIGN KEY (nutricionista_id) REFERENCES usuarios(id),
      FOREIGN KEY (receita_id) REFERENCES receitas(id)
    )
  `);

});

module.exports = db;
