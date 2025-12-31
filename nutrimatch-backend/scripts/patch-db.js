const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', 'nutrimatch.db');
const db = new sqlite3.Database(dbPath);

function run(sql) {
  return new Promise((resolve, reject) => {
    db.run(sql, (err) => (err ? reject(err) : resolve()));
  });
}

(async () => {
  try {
    // planos_refeicoes (modelo do código)
    await run(`
      CREATE TABLE IF NOT EXISTS planos_refeicoes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        paciente_id INTEGER NOT NULL,
        nutricionista_id INTEGER NOT NULL,
        data TEXT NOT NULL,
        refeicao TEXT NOT NULL,
        kcal_meta REAL NOT NULL,
        receita_recomendada TEXT NOT NULL
      );
    `);

    // diario_refeicoes (modelo do código)
    await run(`
      CREATE TABLE IF NOT EXISTS diario_refeicoes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        paciente_id INTEGER NOT NULL,
        data TEXT NOT NULL,
        refeicao TEXT NOT NULL,
        receita_id INTEGER,
        receita_nome TEXT NOT NULL,
        kcal_consumidas REAL NOT NULL,
        origem TEXT DEFAULT 'plano',
        observacao TEXT DEFAULT ''
      );
    `);

    // receitas (para banco + IA)
    await run(`
      CREATE TABLE IF NOT EXISTS receitas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        descricao TEXT,
        kcal_total REAL NOT NULL,
        tipo_refeicao TEXT,
        ingredientes TEXT,
        modo_preparo TEXT,
        criado_por INTEGER,
        origem TEXT DEFAULT 'banco'
      );
    `);

    console.log('✅ Patch aplicado com sucesso.');
  } catch (e) {
    console.error('❌ Erro patch-db:', e.message);
  } finally {
    db.close();
  }
})();
