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
    await run(`ALTER TABLE receitas ADD COLUMN tipo_refeicao TEXT`);
  } catch {}
  try {
    await run(`ALTER TABLE receitas ADD COLUMN ingredientes TEXT`);
  } catch {}
  try {
    await run(`ALTER TABLE receitas ADD COLUMN modo_preparo TEXT`);
  } catch {}
  try {
    await run(`ALTER TABLE receitas ADD COLUMN criado_por INTEGER`);
  } catch {}
  try {
    await run(`ALTER TABLE receitas ADD COLUMN origem TEXT`);
  } catch {}
  try {
    await run(`ALTER TABLE receitas ADD COLUMN dedupe_key TEXT`);
  } catch {}

  try {
    await run(`CREATE UNIQUE INDEX IF NOT EXISTS idx_receitas_dedupe ON receitas(dedupe_key)`);
  } catch {}

  console.log('✅ Patch aplicado (colunas + índice dedupe_key).');
  db.close();
})();
