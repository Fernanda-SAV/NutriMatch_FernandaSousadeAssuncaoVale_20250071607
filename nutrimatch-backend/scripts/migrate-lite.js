// scripts/migrate-lite.js
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', 'nutrimatch.db');
const db = new sqlite3.Database(dbPath);

function run(sql) {
  return new Promise((resolve, reject) => {
    db.run(sql, (err) => err ? reject(err) : resolve());
  });
}

(async () => {
  try {
    // ✅ diario_refeicoes: garantir colunas que o model usa
    await run(`ALTER TABLE diario_refeicoes ADD COLUMN receita_id INTEGER;`).catch(() => {});
    await run(`ALTER TABLE diario_refeicoes ADD COLUMN receita_nome TEXT;`).catch(() => {});
    await run(`ALTER TABLE diario_refeicoes ADD COLUMN kcal_consumidas REAL;`).catch(() => {});
    await run(`ALTER TABLE diario_refeicoes ADD COLUMN origem TEXT;`).catch(() => {});
    // observacao já existe no teu init-db

    // ✅ receitas: se tua tabela antiga existe, adiciona colunas novas usadas no sistema
    await run(`ALTER TABLE receitas ADD COLUMN nome TEXT;`).catch(() => {});
    await run(`ALTER TABLE receitas ADD COLUMN descricao TEXT;`).catch(() => {});
    await run(`ALTER TABLE receitas ADD COLUMN kcal_total REAL;`).catch(() => {});

    // (opcional) se quiser, você pode preencher "nome" a partir de "titulo" manualmente depois.

    console.log('✅ migrate-lite concluído.');
  } catch (e) {
    console.error('❌ erro no migrate-lite:', e);
  } finally {
    db.close();
  }
})();
