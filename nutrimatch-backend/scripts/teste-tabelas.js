const { db } = require('../src/database/connection');

db.all("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name", (err, rows) => {
  if (err) console.error(err);
  else console.log(rows);
  db.close();
});
