// scripts/patch-receitas-dedupe.js
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', 'nutrimatch.db');
const db = new sqlite3.Database(dbPath);

function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) return reject(err);
      resolve(this);
    });
  });
}

async function addColumn(table, colDef) {
  try {
    await run(`ALTER TABLE ${table} ADD COLUMN ${colDef}`);
  } catch (e) {
    if (!String(e.message || '').includes('duplicate column name')) throw e;
  }
}

(async () => {
  try {
    console.log('🔧 Patch dedupe receitas...');

    await addColumn('receitas', 'dedupe_key TEXT');

    // índice único (se já existir, ignora)
    try {
      await run(`CREATE UNIQUE INDEX IF NOT EXISTS idx_receitas_dedupe ON receitas(dedupe_key)`);
    } catch (e) {
      console.log('⚠️  Índice já existe ou falhou:', e.message);
    }

    console.log('✅ Patch dedupe aplicado.');
  } catch (e) {
    console.error('❌ Erro:', e.message);
    process.exitCode = 1;
  } finally {
    db.close();
  }
})();
