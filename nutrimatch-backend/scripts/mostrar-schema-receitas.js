const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const dbPath = path.join(__dirname, "..", "nutrimatch.db");
const db = new sqlite3.Database(dbPath);

db.all("PRAGMA table_info(receitas)", (err, rows) => {
  if (err) { console.error(err); process.exit(1); }
  console.table(rows.map(r => ({ name: r.name, type: r.type, notnull: r.notnull })));
  db.close();
});
