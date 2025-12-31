// scripts/patch-receitas.js
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', 'nutrimatch.db');
const db = new sqlite3.Database(dbPath);

function addColumn(table, colDef) {
  return new Promise((resolve, reject) => {
    db.run(`ALTER TABLE ${table} ADD COLUMN ${colDef}`, (err) => {
      // Se já existe, SQLite pode dar erro "duplicate column name"
      if (err && !String(err.message || '').includes('duplicate column name')) {
        return reject(err);
      }
      resolve();
    });
  });
}

(async () => {
  try {
    console.log('🔧 Aplicando patch na tabela receitas...');

    // mínimas pra categoria + IA
    await addColumn('receitas', 'tipo_refeicao TEXT');
    await addColumn('receitas', "origem TEXT DEFAULT 'banco'");

    // opcionais (mas recomendadas pra detalhes e IA)
    await addColumn('receitas', 'ingredientes TEXT');
    await addColumn('receitas', 'modo_preparo TEXT');
    await addColumn('receitas', 'criado_por INTEGER');

    console.log('✅ Patch aplicado com sucesso.');
  } catch (e) {
    console.error('❌ Erro ao aplicar patch:', e.message);
    process.exitCode = 1;
  } finally {
    db.close();
  }
})();
