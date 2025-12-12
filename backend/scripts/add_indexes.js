const pool = require('../src/config/database');
require('dotenv').config();

async function addIndexes() {
    const client = await pool.connect();

    try {
        console.log('🔄 ensuring database indexes...');
        await client.query('BEGIN');

        // Partnership lookups
        await client.query(`
      CREATE INDEX IF NOT EXISTS idx_partnerships_users 
      ON partnerships(user1_id, user2_id, status);
    `);

        // Privacy lookups
        await client.query(`
      CREATE INDEX IF NOT EXISTS idx_privacy_user 
      ON privacy_settings(user_id);
    `);

        // Location history (sorting by timestamp is common)
        await client.query(`
      CREATE INDEX IF NOT EXISTS idx_location_user_time 
      ON location_signals(user_id, timestamp DESC);
    `);

        // Activity aggregation (filtering by date)
        await client.query(`
      CREATE INDEX IF NOT EXISTS idx_activity_user_date 
      ON activity_signals(user_id, date);
    `);

        // Music history
        await client.query(`
      CREATE INDEX IF NOT EXISTS idx_music_user_time 
      ON music_signals(user_id, timestamp DESC);
    `);

        // Device signals
        await client.query(`
      CREATE INDEX IF NOT EXISTS idx_device_user_time 
      ON device_signals(user_id, timestamp DESC);
    `);

        await client.query('COMMIT');
        console.log('✅ Database indexes optimized successfully');
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('❌ Failed to add indexes:', err);
    } finally {
        client.release();
        pool.end();
    }
}

addIndexes();
