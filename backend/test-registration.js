const axios = require('axios');

const API_URL = 'http://localhost:3000/api';

async function testRegistration() {
    console.log('🧪 Testing Registration Flow...\n');

    // Create a unique test user
    const testUser = {
        name: 'Test User',
        email: `test_${Date.now()}@bubbles.app`,
        password: 'testpassword123'
    };

    try {
        // 1. Register new user
        console.log('1️⃣ Registering user:', testUser.email);
        const regResponse = await axios.post(`${API_URL}/auth/register`, testUser);

        console.log('✅ Registration successful!');
        console.log('   User ID:', regResponse.data.user.id);
        console.log('   Token:', regResponse.data.token.substring(0, 20) + '...');

        const userId = regResponse.data.user.id;
        const token = regResponse.data.token;

        // 2. Login with same credentials
        console.log('\n2️⃣ Testing login with new credentials...');
        const loginResponse = await axios.post(`${API_URL}/auth/login`, {
            email: testUser.email,
            password: testUser.password
        });

        console.log('✅ Login successful!');
        console.log('   User ID:', loginResponse.data.user.id);
        console.log('   Token:', loginResponse.data.token.substring(0, 20) + '...');

        // 3. Fetch user data with token
        console.log('\n3️⃣ Fetching user data with token...');
        const meResponse = await axios.get(`${API_URL}/auth/me`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log('✅ User data retrieved!');
        console.log('   Name:', meResponse.data.user.name);
        console.log('   Email:', meResponse.data.user.email);

        console.log('\n✨ All tests passed! Registration flow is working perfectly.');

    } catch (error) {
        console.error('\n❌ Test failed!');
        console.error('Full error:', error);
        if (error.response) {
            console.error('   Status:', error.response.status);
            console.error('   Data:', error.response.data);
        } else if (error.request) {
            console.error('   No response received from server');
            console.error('   Request:', error.request);
        } else {
            console.error('   Error message:', error.message);
        }
        process.exit(1);
    }
}

testRegistration();
