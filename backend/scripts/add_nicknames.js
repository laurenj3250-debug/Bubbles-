const pool = require('../src/config/database');
require('dotenv').config();

async function addNicknames() {
    const client = await pool.connect();

    try {
        console.log('🔄 Adding nickname columns to partnerships...');
        await client.query('BEGIN');

        // Add user1_nickname if not exists
        await client.query(`
      ALTER TABLE partnerships 
      ADD COLUMN IF NOT EXISTS user1_nickname VARCHAR(100);
    `);

        // Add user2_nickname if not exists
        await client.query(`
      ALTER TABLE partnerships 
      ADD COLUMN IF NOT EXISTS user2_nickname VARCHAR(100);
    `);

        await client.query('COMMIT');
        console.log('✅ Nickname columns added successfully');
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('❌ Failed to add nickname columns:', err);
    } finally {
        client.release();
        pool.end();
    }
}

addNicknames();
