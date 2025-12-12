const pool = require('../config/database');
const bcrypt = require('bcryptjs');

/**
 * Admin setup - creates admin user from environment variables
 * Set ADMIN_EMAIL and ADMIN_PASSWORD in .env to create admin user on startup
 */
async function setupAdmin() {
    try {
        // Only create admin if credentials are provided in environment
        const adminEmail = process.env.ADMIN_EMAIL;
        const adminPassword = process.env.ADMIN_PASSWORD_HASH || process.env.ADMIN_INITIAL_PASSWORD;

        if (!adminEmail || !adminPassword) {
            console.log('ℹ️  No admin credentials provided in environment variables. Skipping admin setup.');
            console.log('   Set ADMIN_EMAIL and ADMIN_INITIAL_PASSWORD in .env to create admin user.');
            return;
        }

        console.log('🔧 Running admin setup...');

        // Check if admin user exists
        const adminCheck = await pool.query(
            'SELECT * FROM users WHERE email = ?',
            [adminEmail]
        );

        if (adminCheck.rows.length === 0) {
            // Hash password if provided as plain text
            const hashedPassword = process.env.ADMIN_PASSWORD_HASH || await bcrypt.hash(adminPassword, 10);

            try {
                await pool.query(`
          INSERT INTO users (name, email, password_hash, is_admin, is_immutable)
          VALUES (?, ?, ?, ?, ?)
        `, ['Admin', adminEmail, hashedPassword, 1, 1]);

                console.log(`✅ Created admin user: ${adminEmail}`);
            } catch (insertError) {
                console.error('⚠️  Failed to create admin user:', insertError.message);
            }
        } else {
            // Try to update existing user to be admin
            try {
                await pool.query(`
          UPDATE users
          SET is_admin = ?, is_immutable = ?
          WHERE email = ?
        `, [1, 1, adminEmail]);
                console.log(`✅ Updated user to admin: ${adminEmail}`);
            } catch (updateError) {
                console.log('ℹ️  Admin user exists but admin columns may not be added yet');
            }
        }

        console.log('🎉 Admin setup complete!');

    } catch (error) {
        console.error('⚠️  Admin setup error:', error.message);
        // Don't throw - let server continue even if admin setup fails
    }
}

module.exports = setupAdmin;
