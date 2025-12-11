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
          // Handle different query types
          if (text.trim().toUpperCase().startsWith('SELECT') ||
            text.trim().toUpperCase().startsWith('RETURNING')) {
            const stmt = sqlite.prepare(text);
            const rows = params ? stmt.all(...params) : stmt.all();
            resolve({ rows, rowCount: rows.length });
          } else if (text.trim().toUpperCase().includes('RETURNING')) {
            // INSERT/UPDATE with RETURNING
            const stmt = sqlite.prepare(text);
            const info = params ? stmt.run(...params) : stmt.run();
            // For RETURNING queries, we need to fetch the inserted/updated row
            const lastId = info.lastInsertRowid;
            if (lastId) {
              const selectStmt = sqlite.prepare(`SELECT * FROM users WHERE id = ?`);
              const rows = selectStmt.all(lastId);
              resolve({ rows, rowCount: rows.length });
            } else {
              resolve({ rows: [], rowCount: info.changes });
            }
          } else {
            // INSERT/UPDATE/DELETE without RETURNING
            const stmt = sqlite.prepare(text);
            const info = params ? stmt.run(...params) : stmt.run();
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
            sqlite.prepare('ROLLBACK').run();
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
