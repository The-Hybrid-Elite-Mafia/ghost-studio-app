// Local stand-in for the Cloudflare D1 binding used by the hosted app.
// Backed by sql.js (SQLite compiled to WebAssembly), saved to one file on disk after every change.
import fs from 'node:fs';
import path from 'node:path';

const toSql = value => value === undefined ? null : value === true ? 1 : value === false ? 0 : value instanceof Uint8Array ? value : value;

export async function openD1({initSqlJs, wasmBinary, file, migrationsDir}) {
  const SQL = await initSqlJs({wasmBinary});
  const existing = file && fs.existsSync(file) ? fs.readFileSync(file) : null;
  const db = existing ? new SQL.Database(existing) : new SQL.Database();
  db.run('PRAGMA foreign_keys=ON');
  let inBatch = false;

  function persist() {
    if (!file) return;
    const data = Buffer.from(db.export());
    const temp = file + '.tmp';
    fs.mkdirSync(path.dirname(file), {recursive: true});
    fs.writeFileSync(temp, data);
    fs.renameSync(temp, file);
  }
  const totalChanges = () => db.exec('SELECT total_changes()')[0].values[0][0];

  function execute(sql, args) {
    const before = totalChanges();
    const statement = db.prepare(sql);
    const rows = [];
    try {
      statement.bind(args.map(toSql));
      while (statement.step()) rows.push(statement.getAsObject());
    } finally {
      statement.free();
    }
    const changes = totalChanges() - before;
    const lastRowId = db.exec('SELECT last_insert_rowid()')[0].values[0][0];
    if (changes > 0 && !inBatch) persist();
    return {rows, meta: {changes, last_row_id: lastRowId, changed_db: changes > 0, rows_read: rows.length, rows_written: changes}};
  }

  class Statement {
    constructor(sql, args = []) { this.sql = sql; this.args = args; }
    bind(...args) { return new Statement(this.sql, args); }
    async first(column) {
      const {rows} = execute(this.sql, this.args);
      const row = rows[0] ?? null;
      return column === undefined || row === null ? row : row[column] ?? null;
    }
    async all() { const {rows, meta} = execute(this.sql, this.args); return {success: true, results: rows, meta}; }
    async run() { const {rows, meta} = execute(this.sql, this.args); return {success: true, results: rows, meta}; }
    async raw() { const {rows} = execute(this.sql, this.args); return rows.map(r => Object.values(r)); }
    _sync() { const {rows, meta} = execute(this.sql, this.args); return {success: true, results: rows, meta}; }
  }

  const api = {
    prepare: sql => new Statement(sql),
    async batch(statements) {
      inBatch = true;
      let results;
      try {
        db.run('BEGIN');
        try {
          results = statements.map(s => s._sync());
          db.run('COMMIT');
        } catch (error) {
          db.run('ROLLBACK');
          throw error;
        }
      } finally {
        inBatch = false;
      }
      if (results.some(r => r.meta.changes > 0)) persist();
      return results;
    },
    async exec(sql) { db.exec(sql); persist(); return {count: 1}; },
    withSession() { return api; },
    close() { db.close(); },
    _database: db,
  };

  if (migrationsDir) {
    db.run('CREATE TABLE IF NOT EXISTS desktop_migrations (name TEXT PRIMARY KEY NOT NULL, applied_at INTEGER NOT NULL)');
    const done = new Set(db.exec('SELECT name FROM desktop_migrations')[0]?.values.map(v => v[0]) ?? []);
    const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort();
    for (const name of files) {
      if (done.has(name)) continue;
      const sql = fs.readFileSync(path.join(migrationsDir, name), 'utf8');
      db.run('BEGIN');
      try {
        for (const part of sql.split('--> statement-breakpoint')) if (part.trim()) db.run(part);
        db.run('INSERT INTO desktop_migrations(name, applied_at) VALUES(?, ?)', [name, Date.now()]);
        db.run('COMMIT');
      } catch (error) {
        db.run('ROLLBACK');
        throw new Error('Database update ' + name + ' failed: ' + error.message);
      }
    }
    persist();
  }
  return api;
}
