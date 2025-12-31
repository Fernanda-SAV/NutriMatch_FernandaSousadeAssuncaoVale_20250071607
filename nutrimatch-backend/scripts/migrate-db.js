const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', 'nutrimatch.db');
console.log('Migrando DB em:', dbPath);

const db = new sqlite3.Database(dbPath);

function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) return reject(err);
      resolve(this);
    });
  });
}

function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) return reject(err);
      resolve(row);
    });
  });
}

function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows || []);
    });
  });
}

async function tableExists(name) {
  const row = await get(
    `SELECT name FROM sqlite_master WHERE type='table' AND name=?`,
    [name]
  );
  return !!row;
}

async function columnExists(table, column) {
  const cols = await all(`PRAGMA table_info(${table})`);
  return cols.some(c => c.name === column);
}

async function migrate() {
  await run(`PRAGMA foreign_keys = OFF;`);
  await run(`BEGIN;`);

  try {
    // 1) Garantir que usuarios/alimentos existem (não mexe neles)
    if (!(await tableExists('usuarios'))) {
      throw new Error('Tabela "usuarios" não existe. Esse script assume seu DB antigo.');
    }
    if (!(await tableExists('alimentos'))) {
      throw new Error('Tabela "alimentos" não existe. Esse script assume seu DB antigo.');
    }

    // 2) Garantir que pacientes tem as colunas que o app usa
    // (no seu DB antigo já tem, mas deixo blindado)
    if (await tableExists('pacientes')) {
      if (!(await columnExists('pacientes', 'meta_kcal_diaria'))) {
        await run(`ALTER TABLE pacientes ADD COLUMN meta_kcal_diaria INTEGER;`);
      }
      if (!(await columnExists('pacientes', 'nutricionista_id'))) {
        await run(`ALTER TABLE pacientes ADD COLUMN nutricionista_id INTEGER;`);
      }
      // garante índice unique para usuario_id
      await run(`CREATE UNIQUE INDEX IF NOT EXISTS idx_pacientes_usuario_id ON pacientes(usuario_id);`);
    } else {
      // Se não existir, cria
      await run(`
        CREATE TABLE IF NOT EXISTS pacientes (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          usuario_id INTEGER NOT NULL UNIQUE,
          nutricionista_id INTEGER,
          meta_kcal_diaria INTEGER,
          FOREIGN KEY(usuario_id) REFERENCES usuarios(id),
          FOREIGN KEY(nutricionista_id) REFERENCES usuarios(id)
        );
      `);
      await run(`CREATE UNIQUE INDEX IF NOT EXISTS idx_pacientes_usuario_id ON pacientes(usuario_id);`);
    }

    // 3) MIGRAR RECEITAS (tabela antiga -> nova)
    // Antiga: titulo, ingredientes, modo_preparo, calorias, ...
    // Nova: nome, descricao, kcal_total
    if (await tableExists('receitas')) {
      // renomeia antiga
      if (!(await tableExists('receitas_old'))) {
        await run(`ALTER TABLE receitas RENAME TO receitas_old;`);
      } else {
        // se já existe receitas_old, remove a tabela receitas atual para recriar do zero
        await run(`DROP TABLE IF EXISTS receitas;`);
      }
    }

    // cria tabela nova receitas
    await run(`
      CREATE TABLE IF NOT EXISTS receitas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        descricao TEXT,
        kcal_total INTEGER NOT NULL
      );
    `);

    // migra dados se tiver receitas_old
    if (await tableExists('receitas_old')) {
      // migração simples: nome=titulo, kcal_total=calorias, descricao = ingredientes + modo_preparo
      await run(`
        INSERT INTO receitas (nome, descricao, kcal_total)
        SELECT
          COALESCE(titulo, 'Receita') AS nome,
          ('Ingredientes: ' || COALESCE(ingredientes,'') || '\n\nModo de preparo: ' || COALESCE(modo_preparo,'')) AS descricao,
          COALESCE(calorias, 0) AS kcal_total
        FROM receitas_old;
      `);
    }

    // 4) PLANOS_REFEICOES (antiga -> nova)
    if (await tableExists('planos_refeicoes')) {
      if (!(await tableExists('planos_refeicoes_old'))) {
        await run(`ALTER TABLE planos_refeicoes RENAME TO planos_refeicoes_old;`);
      } else {
        await run(`DROP TABLE IF EXISTS planos_refeicoes;`);
      }
    }

    await run(`
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

    await run(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_plano_unico
      ON planos_refeicoes(paciente_id, data, refeicao, receita_recomendada);
    `);

    // 5) DIARIO_REFEICOES (antiga -> nova)
    if (await tableExists('diario_refeicoes')) {
      if (!(await tableExists('diario_refeicoes_old'))) {
        await run(`ALTER TABLE diario_refeicoes RENAME TO diario_refeicoes_old;`);
      } else {
        await run(`DROP TABLE IF EXISTS diario_refeicoes;`);
      }
    }

    await run(`
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

    await run(`
      CREATE INDEX IF NOT EXISTS idx_diario_paciente_data
      ON diario_refeicoes(paciente_id, data);
    `);

    await run(`COMMIT;`);
    await run(`PRAGMA foreign_keys = ON;`);

    console.log('✅ Migração concluída!');
    console.log('ℹ️ Tabelas antigas preservadas como *_old (ex.: receitas_old).');
  } catch (e) {
    await run(`ROLLBACK;`);
    console.error('❌ Falha na migração:', e.message);
    throw e;
  } finally {
    db.close();
  }
}

migrate().catch(() => process.exit(1));
