const pool = require('../config/database');
const bcrypt = require('bcryptjs');

/**
 * Add admin columns to users table and create default admin user
 */
async function setupAdmin() {
    try {
        console.log('🔧 Running admin setup...');

        // Add admin columns if they don't exist
        try {
            await pool.query(`
        ALTER TABLE users 
        ADD COLUMN is_admin BOOLEAN DEFAULT FALSE
      `);
            console.log('✅ Added is_admin column');
        } catch (err) {
            if (err.message.includes('duplicate column')) {
                console.log('ℹ️  is_admin column already exists');
            } else {
                throw err;
            }
        }

        try {
            await pool.query(`
        ALTER TABLE users 
        ADD COLUMN is_immutable BOOLEAN DEFAULT FALSE
      `);
            console.log('✅ Added is_immutable column');
        } catch (err) {
            if (err.message.includes('duplicate column')) {
                console.log('ℹ️  is_immutable column already exists');
            } else {
                throw err;
            }
        }

        // Check if admin user exists
        const adminCheck = await pool.query(
            'SELECT * FROM users WHERE email = ?',
            ['amps@sugarbum.app']
        );

        if (adminCheck.rows.length === 0) {
            // Create admin user
            const hashedPassword = await bcrypt.hash('h3nb3nny', 10);

            const result = await pool.query(`
        INSERT INTO users (name, email, password, is_admin, is_immutable, created_at)
        VALUES (?, ?, ?, ?, ?, datetime('now'))
      `, ['Amps', 'amps@sugarbum.app', hashedPassword, true, true]);

            console.log('✅ Created admin user: amps@sugarbum.app');
            console.log('   Password: h3nb3nny');
            console.log('   User is immutable and cannot be deleted from database');
        } else {
            // Update existing user to be admin
            await pool.query(`
        UPDATE users 
        SET is_admin = ?, is_immutable = ?
        WHERE email = ?
      `, [true, true, 'amps@sugarbum.app']);

            console.log('✅ Updated existing user to admin: amps@sugarbum.app');
        }

        console.log('🎉 Admin setup complete!');

    } catch (error) {
        console.error('❌ Admin setup failed:', error);
        throw error;
    }
}

module.exports = setupAdmin;
