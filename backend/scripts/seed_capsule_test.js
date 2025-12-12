const pool = require('../src/config/database');
const bcrypt = require('bcryptjs');

const seed = async () => {
    try {
        console.log('🌱 Seeding Test Data...');

        // Clear existing test data (optional, be careful)
        // await pool.query('DELETE FROM dail_capsules'); 
        // await pool.query('DELETE FROM partnerships');
        // await pool.query('DELETE FROM users');

        const hashedPassword = await bcrypt.hash('password123', 10);

        // 1. Create Users
        const u1 = await pool.query(`
            INSERT INTO users (name, email, password_hash) 
            VALUES ('Romeo', 'romeo@example.com', $1) 
            RETURNING id`, [hashedPassword]
        );
        const u1Id = u1.rows[0].id;

        const u2 = await pool.query(`
            INSERT INTO users (name, email, password_hash) 
            VALUES ('Juliet', 'juliet@example.com', $1) 
            RETURNING id`, [hashedPassword]
        );
        const u2Id = u2.rows[0].id;

        console.log(`Created users: ${u1Id}, ${u2Id}`);

        // 2. Create Partnership
        const part = await pool.query(`
            INSERT INTO partnerships (user1_id, user2_id, status, accepted_at)
            VALUES ($1, $2, 'accepted', CURRENT_TIMESTAMP)
            RETURNING id`, [u1Id, u2Id]
        );
        const pId = part.rows[0].id;
        console.log(`Created partnership: ${pId}`);

        // 3. Create Location Signals (Today)
        const today = new Date().toISOString();

        // User 1 at "Central Park"
        await pool.query(`
            INSERT INTO location_signals (user_id, latitude, longitude, place_name, timestamp)
            VALUES ($1, 40.785091, -73.968285, 'Central Park', $2)
        `, [u1Id, today]);

        // User 2 at "Central Park" (Match!)
        await pool.query(`
            INSERT INTO location_signals (user_id, latitude, longitude, place_name, timestamp)
            VALUES ($1, 40.785091, -73.968285, 'Central Park', $2)
        `, [u2Id, today]);

        console.log('✅ Seed complete. Ready to generate capsule.');
        process.exit(0);

    } catch (e) {
        console.error('Seed failed:', e);
        process.exit(1);
    }
};

seed();
