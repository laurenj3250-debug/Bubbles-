/**
 * Migration script to add admin columns to users table
 * Run this once: node scripts/add-admin-columns.js
 */

const pool = require('../src/config/database');

async function addAdminColumns() {
    try {
        console.log('Adding admin columns to users table...');

        // Add is_admin column
        try {
            await pool.query('ALTER TABLE users ADD COLUMN is_admin INTEGER DEFAULT 0');
            console.log('✅ Added is_admin column');
        } catch (err) {
            if (err.message.includes('duplicate column')) {
                console.log('ℹ️  is_admin column already exists');
            } else {
                throw err;
            }
        }

        // Add is_immutable column
        try {
            await pool.query('ALTER TABLE users ADD COLUMN is_immutable INTEGER DEFAULT 0');
            console.log('✅ Added is_immutable column');
        } catch (err) {
            if (err.message.includes('duplicate column')) {
                console.log('ℹ️  is_immutable column already exists');
            } else {
                throw err;
            }
        }

        console.log('🎉 Admin columns added successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error adding admin columns:', error);
        process.exit(1);
    }
}

addAdminColumns();
