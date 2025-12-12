const pool = require('../config/database');
const bcrypt = require('bcryptjs');

/**
 * Simple admin setup - assumes columns already exist
 * Run add-admin-columns.js script first if needed
 */
async function setupAdmin() {
    try {
        console.log('🔧 Running admin setup...');

        // Check if admin user exists
        const adminCheck = await pool.query(
            'SELECT * FROM users WHERE email = ?',
            ['amps@sugarbum.app']
        );

        if (adminCheck.rows.length === 0) {
            // Create admin user
            const hashedPassword = await bcrypt.hash('h3nb3nny', 10);

            try {
                await pool.query(`
          INSERT INTO users (name, email, password, is_admin, is_immutable)
          VALUES (?, ?, ?, ?, ?)
        `, ['Amps', 'amps@sugarbum.app', hashedPassword, 1, 1]);

                console.log('✅ Created admin user: amps@sugarbum.app');
                console.log('   Password: h3nb3nny');
            } catch (insertError) {
                // Columns might not exist yet, insert without admin columns
                console.log('ℹ️  Admin columns don\'t exist yet, creating user without admin flags');
                await pool.query(`
          INSERT INTO users (name, email, password)
          VALUES (?, ?, ?)
        `, ['Amps', 'amps@sugarbum.app', hashedPassword]);
                console.log('✅ Created user: amps@sugarbum.app (run migration to add admin columns)');
            }
        } else {
            // Try to update existing user to be admin
            try {
                await pool.query(`
          UPDATE users 
          SET is_admin = ?, is_immutable = ?
          WHERE email = ?
        `, [1, 1, 'amps@sugarbum.app']);
                console.log('✅ Updated user to admin: amps@sugarbum.app');
            } catch (updateError) {
                console.log('ℹ️  Admin user exists but columns not added yet');
            }
        }

        console.log('🎉 Admin setup complete!');

    } catch (error) {
        console.error('⚠️  Admin setup error:', error.message);
        // Don't throw - let server continue even if admin setup fails
    }
}

module.exports = setupAdmin;
