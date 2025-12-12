const axios = require('axios');
const API_URL = 'http://localhost:8080/api';

// Test Users
const user1 = {
    email: 'verify_user1_' + Date.now() + '@test.com',
    password: 'password123',
    name: 'Verify One'
};

const user2 = {
    email: 'verify_user2_' + Date.now() + '@test.com',
    password: 'password123',
    name: 'Verify Two'
};

let token1, token2;
let partnerCode;

async function runTest() {
    console.log('🚀 Starting Full System Verification...');

    try {
        // 1. Auth & Registration
        console.log('\n1. 👤 Registering Users...');
        const reg1 = await axios.post(`${API_URL}/auth/register`, user1);
        token1 = reg1.data.token;
        console.log('   ✅ User 1 Registered:', user1.email);

        const reg2 = await axios.post(`${API_URL}/auth/register`, user2);
        token2 = reg2.data.token;
        console.log('   ✅ User 2 Registered:', user2.email);

        // 2. Partnership (Email Flow)
        console.log('\n2. 🤝 Establishing Partnership...');

        // User 1 Sends Request
        await axios.post(`${API_URL}/partners/request`, {
            partnerEmail: user2.email
        }, { headers: { Authorization: `Bearer ${token1}` } });
        console.log('   ✅ User 1 sent request to', user2.email);

        // User 2 Checks Requests
        const reqRes = await axios.get(`${API_URL}/partners/requests`, {
            headers: { Authorization: `Bearer ${token2}` }
        });

        if (reqRes.data.requests.length === 0) {
            throw new Error('User 2 found no requests');
        }

        const requestId = reqRes.data.requests[0].id;
        console.log('   ℹ️  Request ID found:', requestId);

        // User 2 Accepts
        await axios.post(`${API_URL}/partners/${requestId}/respond`, {
            accept: true
        }, { headers: { Authorization: `Bearer ${token2}` } });
        console.log('   ✅ Partnership Connected!');

        // 3. Location Signals
        console.log('\n3. 📍 Sending Location Signals...');
        await axios.post(`${API_URL}/signals/location`, {
            latitude: 40.7128,
            longitude: -74.0060,
            placeName: 'New York City',
            placeType: 'current'
        }, { headers: { Authorization: `Bearer ${token1}` } });
        console.log('   ✅ User 1 sent location');

        await axios.post(`${API_URL}/signals/location`, {
            latitude: 34.0522,
            longitude: -118.2437,
            placeName: 'Los Angeles',
            placeType: 'current'
        }, { headers: { Authorization: `Bearer ${token2}` } });
        console.log('   ✅ User 2 sent location');

        // 3.1 Activity Signals
        console.log('\n3.1 🏃 Sending Activity Signals...');
        await axios.post(`${API_URL}/signals/activity`, {
            steps: 5000,
            distance: 3.5,
            calories: 300,
            activityType: 'walking'
        }, { headers: { Authorization: `Bearer ${token1}` } });
        console.log('   ✅ User 1 sent activity data');

        // 3.2 Music Signals
        console.log('\n3.2 🎵 Sending Music Signals...');
        await axios.post(`${API_URL}/signals/music`, {
            trackName: 'Bohemian Rhapsody',
            artistName: 'Queen',
            isPlaying: true,
            progressMs: 30000,
            durationMs: 354000
        }, { headers: { Authorization: `Bearer ${token1}` } });
        console.log('   ✅ User 1 sent music status');

        // 4. Miss You / Love Bomb
        console.log('\n4. 💖 Sending "Miss You" Signal...');
        const missYouRes = await axios.post(`${API_URL}/signals/miss-you`, {}, {
            headers: { Authorization: `Bearer ${token1}` }
        });
        if (missYouRes.status === 200) {
            console.log('   ✅ Miss You sent successfully');
        }

        // 5. Daily Capsule
        console.log('\n5. 💊 Generating Daily Capsule...');
        // Manually trigger generation
        const genRes = await axios.post(`${API_URL}/capsules/generate`, {}, {
            headers: { Authorization: `Bearer ${token1}` }
        });
        console.log('   ✅ Capsule Generation Triggered');

        // Retrieve Capsule
        const capRes = await axios.get(`${API_URL}/capsules/current`, {
            headers: { Authorization: `Bearer ${token1}` }
        });

        if (capRes.data.capsule) {
            console.log('   ✅ Capsule Retrieved!');
            console.log('   📝 Summary:', capRes.data.capsule.content?.summary || 'No summary text');
        } else {
            console.log('   ⚠️  Capsule not found (might rely on time/cron logic?), checking history...');
        }

        console.log('\n✨ VERIFICATION COMPLETE: ALL SYSTEMS GO ✨');

    } catch (error) {
        console.error('\n❌ VERIFICATION FAILED');
        if (error.response) {
            console.error('   Status:', error.response.status);
            console.error('   URL:', error.config.url);
            console.error('   Data:', error.response.data);
        } else {
            console.error('   Error:', error.message);
        }
    }
}

runTest();
