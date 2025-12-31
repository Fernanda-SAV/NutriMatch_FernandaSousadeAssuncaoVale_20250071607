const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const dbPath = path.join(__dirname, "..", "nutrimatch.db");
const db = new sqlite3.Database(dbPath);

function all(sql, params=[]) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => err ? reject(err) : resolve(rows));
  });
}
function run(sql, params=[]) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, (err) => err ? reject(err) : resolve());
  });
}

async function main() {
  const cols = await all("PRAGMA table_info(receitas)");
  const names = cols.map(c => c.name);

  async function addColIfMissing(colName, sqlType) {
    if (!names.includes(colName)) {
      console.log(`➕ Adicionando coluna ${colName}...`);
      await run(`ALTER TABLE receitas ADD COLUMN ${colName} ${sqlType}`);
    } else {
      console.log(`✅ Coluna ${colName} já existe.`);
    }
  }

  // Colunas necessárias para seu app
  await addColIfMissing("tipo_refeicao", "TEXT");
  await addColIfMissing("ingredientes", "TEXT");   // JSON string
  await addColIfMissing("modo_preparo", "TEXT");   // JSON string
  await addColIfMissing("origem", "TEXT");         // 'banco' | 'ia'
  await addColIfMissing("criado_por", "INTEGER");  // usuario_id

  // (opcional) defaults para registros antigos
  await run(`UPDATE receitas SET origem='banco' WHERE origem IS NULL`);
  await run(`UPDATE receitas SET ingredientes='[]' WHERE ingredientes IS NULL`);
  await run(`UPDATE receitas SET modo_preparo='[]' WHERE modo_preparo IS NULL`);

  console.log("✅ Patch de receitas concluído.");

  const cols2 = await all("PRAGMA table_info(receitas)");
  console.table(cols2.map(r => ({ name: r.name, type: r.type, notnull: r.notnull })));

  db.close();
}

main().catch((e) => {
  console.error("❌ Erro no patch:", e);
  db.close();
  process.exit(1);
});
