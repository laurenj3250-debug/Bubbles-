const cron = require('node-cron');
const pool = require('../config/database');
const { generateCapsule } = require('../services/capsule');

// Schedule: Daily at 9:00 PM (21:00)
cron.schedule('0 21 * * *', async () => {
    console.log('💊 Starting Daily Capsule Generation Job...');

    try {
        // 1. Find all active partnerships
        const result = await pool.query(
            "SELECT id FROM partnerships WHERE status = 'accepted'"
        );

        const partnerships = result.rows;
        console.log(`Found ${partnerships.length} active partnerships.`);

        // 2. Generate for each
        for (const p of partnerships) {
            try {
                await generateCapsule(p.id);
            } catch (err) {
                console.error(`Failed to generate capsule for partnership ${p.id}:`, err);
            }
        }

        console.log('✅ Daily Capsule Job Completed.');

    } catch (error) {
        console.error('Critical Cron Job Error:', error);
    }
});

console.log('📅 Cron Jobs Initialized');
