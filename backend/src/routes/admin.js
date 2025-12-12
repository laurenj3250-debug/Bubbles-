const express = require('express');
const pool = require('../config/database');
const { isSQLite, isPostgres } = require('../config/database');

const router = express.Router();

// Admin panel authentication - REQUIRES strong password in environment
const ADMIN_PANEL_PASSWORD = process.env.ADMIN_PANEL_PASSWORD;

if (!ADMIN_PANEL_PASSWORD) {
  console.error('⚠️  SECURITY WARNING: ADMIN_PANEL_PASSWORD not set! Admin panel will be inaccessible.');
}

const checkAdminAuth = (req, res, next) => {
  if (!ADMIN_PANEL_PASSWORD) {
    return res.status(503).json({ error: 'Admin panel not configured' });
  }

  const authHeader = req.headers.authorization;

  console.log('Auth attempt - Header:', authHeader ? 'Present' : 'Missing');

  if (!authHeader || !authHeader.startsWith('Basic ')) {
    res.setHeader('WWW-Authenticate', 'Basic realm="Admin"');
    return res.status(401).json({ error: 'Authentication required' });
  }

  const base64Credentials = authHeader.split(' ')[1];
  const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
  const [username, password] = credentials.split(':');

  if (password !== ADMIN_PANEL_PASSWORD) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  next();
};

// Config info (requires authentication)
router.get('/config', checkAdminAuth, (req, res) => {
  res.json({
    message: 'Admin panel configuration',
    passwordSet: !!ADMIN_PANEL_PASSWORD,
    database: isSQLite ? 'SQLite' : 'PostgreSQL',
    nodeEnv: process.env.NODE_ENV || 'development'
  });
});

// Get all tables in database
router.get('/tables', checkAdminAuth, async (req, res) => {
  try {
    let result;

    if (isSQLite) {
      // SQLite: query sqlite_master
      result = await pool.query(`
        SELECT name as table_name
        FROM sqlite_master
        WHERE type='table' AND name NOT LIKE 'sqlite_%'
        ORDER BY name
      `);
    } else {
      // PostgreSQL: use information_schema
      result = await pool.query(`
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
        ORDER BY table_name
      `);
    }

    res.json({ tables: result.rows.map(row => row.table_name) });
  } catch (error) {
    console.error('Error fetching tables:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get data from a specific table
router.get('/table/:tableName', checkAdminAuth, async (req, res) => {
  try {
    const { tableName } = req.params;
    const limit = parseInt(req.query.limit) || 100;
    const offset = parseInt(req.query.offset) || 0;

    // Validate table name format (only alphanumeric and underscore)
    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(tableName)) {
      return res.status(400).json({ error: 'Invalid table name format' });
    }

    // Validate table name to prevent SQL injection
    let validTables;
    if (isSQLite) {
      validTables = await pool.query(`
        SELECT name as table_name
        FROM sqlite_master
        WHERE type='table' AND name = ?
      `, [tableName]);
    } else {
      validTables = await pool.query(`
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = $1
      `, [tableName]);
    }

    if (validTables.rows.length === 0) {
      return res.status(404).json({ error: 'Table not found' });
    }

    // Get total count (works for both)
    const countResult = await pool.query(`SELECT COUNT(*) as count FROM ${tableName}`);
    const total = parseInt(countResult.rows[0].count);

    // Get data
    let dataResult;
    if (isSQLite) {
      dataResult = await pool.query(
        `SELECT * FROM ${tableName} ORDER BY id DESC LIMIT ? OFFSET ?`,
        [limit, offset]
      );
    } else {
      dataResult = await pool.query(
        `SELECT * FROM ${tableName} ORDER BY id DESC LIMIT $1 OFFSET $2`,
        [limit, offset]
      );
    }

    // Get column information
    let columnsResult;
    if (isSQLite) {
      columnsResult = await pool.query(`PRAGMA table_info(${tableName})`);
      columnsResult.rows = columnsResult.rows.map(col => ({
        column_name: col.name,
        data_type: col.type
      }));
    } else {
      columnsResult = await pool.query(`
        SELECT column_name, data_type
        FROM information_schema.columns
        WHERE table_name = $1
        ORDER BY ordinal_position
      `, [tableName]);
    }

    res.json({
      table: tableName,
      total,
      limit,
      offset,
      columns: columnsResult.rows,
      data: dataResult.rows
    });
  } catch (error) {
    console.error('Error fetching table data:', error);
    res.status(500).json({ error: error.message });
  }
});

// Execute custom SQL query (read-only)
router.post('/query', checkAdminAuth, async (req, res) => {
  try {
    const { sql } = req.body;

    if (!sql) {
      return res.status(400).json({ error: 'SQL query is required' });
    }

    // Only allow SELECT queries for safety
    const trimmedSql = sql.trim().toUpperCase();
    if (!trimmedSql.startsWith('SELECT')) {
      return res.status(400).json({ error: 'Only SELECT queries are allowed' });
    }

    const result = await pool.query(sql);

    res.json({
      rows: result.rows,
      rowCount: result.rowCount,
      fields: result.fields?.map(f => ({ name: f.name, dataTypeID: f.dataTypeID })) || []
    });
  } catch (error) {
    console.error('Error executing query:', error);
    res.status(400).json({ error: error.message });
  }
});

// Get database statistics
router.get('/stats', checkAdminAuth, async (req, res) => {
  try {
    const stats = {};

    // Get counts from each table
    const tables = ['users', 'partnerships', 'privacy_settings', 'location_signals',
      'activity_signals', 'music_signals', 'device_signals',
      'calendar_signals', 'push_tokens', 'spotify_tokens', 'geofences'];

    for (const table of tables) {
      try {
        const result = await pool.query(`SELECT COUNT(*) as count FROM ${table}`);
        stats[table] = parseInt(result.rows[0].count);
      } catch (err) {
        stats[table] = 0;
      }
    }

    res.json({ stats });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: error.message });
  }
});

// Test database connection
router.get('/health', checkAdminAuth, async (req, res) => {
  try {
    // Use database-agnostic query
    const result = await pool.query('SELECT 1 as test');

    let dbInfo = {};
    if (isSQLite) {
      const versionResult = await pool.query('SELECT sqlite_version() as version');
      dbInfo = {
        status: 'connected',
        timestamp: new Date().toISOString(),
        database: 'SQLite',
        version: versionResult.rows[0].version
      };
    } else {
      const versionResult = await pool.query('SELECT version()');
      dbInfo = {
        status: 'connected',
        timestamp: new Date().toISOString(),
        database: 'PostgreSQL',
        version: versionResult.rows[0].version
      };
    }

    res.json(dbInfo);
  } catch (error) {
    res.status(500).json({
      status: 'error',
      error: error.message
    });
  }
});

// Clear all data from a specific table
router.delete('/table/:tableName/clear', checkAdminAuth, async (req, res) => {
  try {
    const { tableName } = req.params;

    // Validate table name format
    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(tableName)) {
      return res.status(400).json({ error: 'Invalid table name format' });
    }

    // Validate table exists
    let validTables;
    if (isSQLite) {
      validTables = await pool.query(`
        SELECT name as table_name
        FROM sqlite_master
        WHERE type='table' AND name = ?
      `, [tableName]);
    } else {
      validTables = await pool.query(`
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = $1
      `, [tableName]);
    }

    if (validTables.rows.length === 0) {
      return res.status(404).json({ error: 'Table not found' });
    }

    // Clear the table
    await pool.query(`DELETE FROM ${tableName}`);

    res.json({
      success: true,
      message: `All data cleared from ${tableName}`
    });
  } catch (error) {
    console.error('Error clearing table:', error);
    res.status(500).json({ error: error.message });
  }
});

// Clear all data from all tables (nuclear option)
router.delete('/database/clear-all', checkAdminAuth, async (req, res) => {
  try {
    const tables = ['location_signals', 'activity_signals', 'music_signals',
      'device_signals', 'calendar_signals', 'push_tokens',
      'spotify_tokens', 'geofences', 'partnerships',
      'privacy_settings', 'users'];

    const results = [];
    for (const table of tables) {
      try {
        await pool.query(`DELETE FROM ${table}`);
        results.push({ table, status: 'cleared' });
      } catch (err) {
        results.push({ table, status: 'error', error: err.message });
      }
    }

    res.json({
      success: true,
      message: 'Database cleared',
      results
    });
  } catch (error) {
    console.error('Error clearing database:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete specific row by ID
router.delete('/table/:tableName/row/:id', checkAdminAuth, async (req, res) => {
  try {
    const { tableName, id } = req.params;

    // Validate table name format
    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(tableName)) {
      return res.status(400).json({ error: 'Invalid table name format' });
    }

    // Validate table exists
    let validTables;
    if (isSQLite) {
      validTables = await pool.query(`
        SELECT name as table_name
        FROM sqlite_master
        WHERE type='table' AND name = ?
      `, [tableName]);
    } else {
      validTables = await pool.query(`
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = $1
      `, [tableName]);
    }

    if (validTables.rows.length === 0) {
      return res.status(404).json({ error: 'Table not found' });
    }

    // Delete the row
    if (isSQLite) {
      await pool.query(`DELETE FROM ${tableName} WHERE id = ?`, [id]);
    } else {
      await pool.query(`DELETE FROM ${tableName} WHERE id = $1`, [id]);
    }

    res.json({
      success: true,
      message: `Row ${id} deleted from ${tableName}`
    });
  } catch (error) {
    console.error('Error deleting row:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

