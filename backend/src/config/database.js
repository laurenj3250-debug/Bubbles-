require('dotenv').config();

const DATABASE_URL = process.env.DATABASE_URL;

// Determine which database to use
const usePostgres = DATABASE_URL && DATABASE_URL.startsWith('postgres');

let db;

if (usePostgres) {
  // PostgreSQL setup (for Railway/production)
  console.log('🐘 Using PostgreSQL database');
  const { Pool } = require('pg');

  const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? {
      rejectUnauthorized: false
    } : false
  });

  pool.on('connect', () => {
    console.log('✅ Connected to PostgreSQL database');
  });

  pool.on('error', (err) => {
    console.error('❌ Unexpected error on idle PostgreSQL client', err);
    process.exit(-1);
  });

  db = pool;
} else {
  // SQLite setup (for local development)
  console.log('🗄️  Using SQLite database (local development)');
  const Database = require('better-sqlite3');
  const path = require('path');

  const dbPath = path.join(__dirname, '../../bubbles.db');
  const sqlite = new Database(dbPath);

  console.log(`✅ Connected to SQLite database at ${dbPath}`);

  // Enable foreign keys
  sqlite.pragma('foreign_keys = ON');

  // Wrapper to make SQLite API compatible with pg Pool
  db = {
    query: (text, params) => {
      return new Promise((resolve, reject) => {
        try {
          // Convert Postgres $1, $2, etc syntax to SQLite ?
          // We must also reconstruct the params array to match the new order/count of ?
          let sqliteText = text;
          let sqliteParams = params;

          if (params && params.length > 0) {
            const newParams = [];
            let foundPostgresParams = false;

            sqliteText = text.replace(/\$(\d+)/g, (match, index) => {
              // Postgres is 1-indexed, array is 0-indexed
              foundPostgresParams = true;
              newParams.push(params[parseInt(index) - 1]);
              return '?';
            });

            if (foundPostgresParams) {
              sqliteParams = newParams;
            }
          }

          // Handle different query types
          if (sqliteText.trim().toUpperCase().startsWith('SELECT') ||
            sqliteText.trim().toUpperCase().startsWith('RETURNING')) {
            const stmt = sqlite.prepare(sqliteText);
            const rows = sqliteParams ? stmt.all(...sqliteParams) : stmt.all();
            resolve({ rows, rowCount: rows.length });
          } else if (sqliteText.trim().toUpperCase().includes('RETURNING')) {
            // INSERT/UPDATE with RETURNING
            // Extract table name from the query (works for INSERT INTO table_name ...)
            const tableMatch = sqliteText.match(/INSERT\s+INTO\s+(\w+)/i);
            const tableName = tableMatch ? tableMatch[1] : null;

            // Remove RETURNING clause for SQLite (it doesn't support it)
            const queryWithoutReturning = sqliteText.replace(/RETURNING\s+\*/i, '').trim();

            const stmt = sqlite.prepare(queryWithoutReturning);
            const info = sqliteParams ? stmt.run(...sqliteParams) : stmt.run();

            // For RETURNING queries, we need to fetch the inserted/updated row
            const lastId = info.lastInsertRowid;
            if (lastId && tableName) {
              const selectStmt = sqlite.prepare(`SELECT * FROM ${tableName} WHERE id = ?`);
              const rows = selectStmt.all(lastId);
              resolve({ rows, rowCount: rows.length });
            } else {
              resolve({ rows: [], rowCount: info.changes });
            }
          } else {
            // INSERT/UPDATE/DELETE without RETURNING
            const stmt = sqlite.prepare(sqliteText);
            const info = sqliteParams ? stmt.run(...sqliteParams) : stmt.run();
            resolve({ rows: [], rowCount: info.changes });
          }
        } catch (error) {
          reject(error);
        }
      });
    },
    connect: async () => {
      // Return a transaction-compatible client
      let inTransaction = false;
      return {
        query: db.query,
        release: () => {
          if (inTransaction) {
            sqlite.prepare('ROLLBACK').run();
            inTransaction = false;
          }
        },
        query: async (text, params) => {
          if (text === 'BEGIN') {
            sqlite.prepare('BEGIN').run();
            inTransaction = true;
            return { rows: [], rowCount: 0 };
          } else if (text === 'COMMIT') {
            sqlite.prepare('COMMIT').run();
            inTransaction = false;
            return { rows: [], rowCount: 0 };
          } else if (text === 'ROLLBACK') {
            try {
              sqlite.prepare('ROLLBACK').run();
            } catch (e) {
              // Ignore if no transaction is active
            }
            inTransaction = false;
            return { rows: [], rowCount: 0 };
          }
          return db.query(text, params);
        },
        release: () => {
          if (inTransaction) {
            try {
              sqlite.prepare('ROLLBACK').run();
            } catch (e) {
              // Ignore if no transaction
            }
            inTransaction = false;
          }
        }
      };
    },
    end: () => {
      sqlite.close();
      return Promise.resolve();
    }
  };
}

module.exports = db;
module.exports.isPostgres = usePostgres;
module.exports.isSQLite = !usePostgres;
