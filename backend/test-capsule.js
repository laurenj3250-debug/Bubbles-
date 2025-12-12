const { generateCapsule } = require('./src/services/capsule');
const pool = require('./src/config/database');

const run = async () => {
    try {
        console.log('🧪 Testing Capsule Generation...');

        // Find a partnership
        const parts = await pool.query('SELECT * FROM partnerships LIMIT 1');
        if (parts.rows.length === 0) {
            console.log('No partnerships found to test.');
            return;
        }

        const pId = parts.rows[0].id;
        console.log(`Generating for partnership ${pId}...`);

        const capsule = await generateCapsule(pId);
        console.log('✅ Capsule Generated:', capsule);

        process.exit(0);

    } catch (e) {
        console.error('Test Failed:', e);
        process.exit(1);
    }
};

run();
