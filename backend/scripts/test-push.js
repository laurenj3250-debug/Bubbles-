
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const pool = require('../src/config/database');
const axios = require('axios');

const API_URL = 'http://localhost:3000/api';
const SENDER_EMAIL = 'sender@test.com';
const RECEIVER_EMAIL = 'receiver@test.com';
const PASSWORD = 'password123';
const FAKE_TOKEN = 'ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]';

async function runTest() {
    console.log('🔔 Starting Push Notification Test...');

    try {
        // 1. Setup Data in DB directly
        console.log('1. Setting up test users in database...');

        // Clean up old test data
        await pool.query('DELETE FROM users WHERE email IN (?, ?)', [SENDER_EMAIL, RECEIVER_EMAIL]);

        // Create Receiver
        await pool.query(
            `INSERT INTO users (email, password_hash, name) 
       VALUES (?, ?, ?)`,
            [RECEIVER_EMAIL, 'hash', 'Test Receiver']
        );
        const receiverRes = await pool.query('SELECT id FROM users WHERE email = ?', [RECEIVER_EMAIL]);
        const receiverId = receiverRes.rows[0].id;

        // Create Sender
        await pool.query(
            `INSERT INTO users (email, password_hash, name) 
         VALUES (?, ?, ?)`,
            [SENDER_EMAIL, 'hash', 'Test Sender']
        );
        const senderRes = await pool.query('SELECT id FROM users WHERE email = ?', [SENDER_EMAIL]);
        const senderId = senderRes.rows[0].id;

        // Create Partnership
        await pool.query(
            `INSERT INTO partnerships (user1_id, user2_id, status) VALUES (?, ?, 'accepted')`,
            [senderId, receiverId]
        );

        // Add Push Token for Receiver
        await pool.query(
            `INSERT INTO push_tokens (user_id, token, device_type) VALUES (?, ?, 'ios')`,
            [receiverId, FAKE_TOKEN]
        );

        console.log('✅ Test data verified:');
        console.log(`   - Sender ID: ${senderId}`);
        console.log(`   - Receiver ID: ${receiverId}`);
        console.log(`   - Partnership: Accepted`);
        console.log(`   - Receiver Token: ${FAKE_TOKEN}`);

        // 2. Register/Login via API as Sender to get JWT
        // (We inserted with dummy hash, so we can't login with password logic unless we hashed it correctly. 
        //  Easier: Just creating a fresh user *via API* would handle hashing, OR we assume we can't login with dummy hash.
        //  Let's use the register endpoint for the Sender to ensure we get a valid token, or just insert a known hash. 
        //  Actually, let's use the API for EVERYTHING to be safe about Auth.)

        // Cleaning up again to use API flow strictly
        await pool.query('DELETE FROM users WHERE email IN (?, ?)', [SENDER_EMAIL, RECEIVER_EMAIL]);

        console.log('\n2. Registering users via API...');

        // Register Receiver
        const receiverAuth = await axios.post(`${API_URL}/auth/register`, {
            email: RECEIVER_EMAIL, password: PASSWORD, name: 'Receiver'
        });
        const receiverToken = receiverAuth.data.token;
        const receiverObjId = receiverAuth.data.user.id;

        // Register Sender
        const senderAuth = await axios.post(`${API_URL}/auth/register`, {
            email: SENDER_EMAIL, password: PASSWORD, name: 'Sender'
        });
        const senderToken = senderAuth.data.token;
        const senderObjId = senderAuth.data.user.id;

        console.log('✅ Users registered via API');

        // 3. Setup Partnership & Token via API/DB mixed (since partner flow is multi-step)
        // Let's force it in DB to save time/complexity
        await pool.query(
            `INSERT INTO partnerships (user1_id, user2_id, status) VALUES (?, ?, 'accepted')`,
            [senderObjId, receiverObjId]
        );

        // Add token for Receiver via API
        await axios.post(`${API_URL}/auth/push-token`, {
            token: FAKE_TOKEN,
            deviceType: 'ios'
        }, { headers: { Authorization: `Bearer ${receiverToken}` } });

        console.log('✅ Partnership linked & Push Token registered');

        // 4. Trigger Signal
        console.log('\n3. Sending Location Signal as Sender...');
        const signalRes = await axios.post(`${API_URL}/signals/location`, {
            latitude: 40.7128,
            longitude: -74.0060,
            placeName: "Test City"
        }, { headers: { Authorization: `Bearer ${senderToken}` } });

        console.log(`✅ Signal sent! Response: ${signalRes.status} ${signalRes.statusText}`);
        console.log('👉 CHECK YOUR SERVER TERMINAL NOW!');
        console.log('   You should see: "Push notification sent to partner..."');

    } catch (error) {
        console.error('❌ Test Failed:', error.response?.data || error.message);
    } finally {
        // Optional: Cleanup
        // await pool.query('DELETE FROM users WHERE email IN ($1, $2)', [SENDER_EMAIL, RECEIVER_EMAIL]);
    }
}

runTest();
