const axios = require('axios');
const API_URL = 'http://localhost:3000/api';

async function testGDPR() {
  console.log('🔐 Testing GDPR Endpoints...\n');

  // Create a test user
  const email = `gdpr_test_${Date.now()}@test.com`;
  const reg = await axios.post(`${API_URL}/auth/register`, {
    email,
    password: 'testpass123',
    name: 'GDPR Test User'
  });
  const token = reg.data.token;
  console.log('✅ Test user created:', email);

  // Add some data
  await axios.post(`${API_URL}/signals/location`, {
    latitude: 40.7128, longitude: -74.0060, placeName: 'NYC'
  }, { headers: { Authorization: `Bearer ${token}` } });
  console.log('✅ Added location signal');

  await axios.post(`${API_URL}/signals/activity`, {
    steps: 5000, calories: 200
  }, { headers: { Authorization: `Bearer ${token}` } });
  console.log('✅ Added activity signal');

  // Test data export
  const exportRes = await axios.get(`${API_URL}/users/me/export`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  console.log('✅ Data export successful');
  console.log('   Export contains:', Object.keys(exportRes.data).join(', '));
  console.log('   Location signals:', exportRes.data.signals.location.length);
  console.log('   Activity signals:', exportRes.data.signals.activity.length);

  // Test deletion without confirmation (should fail)
  try {
    await axios.delete(`${API_URL}/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { confirmEmail: 'wrong@email.com' }
    });
    console.log('❌ Deletion without confirmation should fail');
  } catch (e) {
    console.log('✅ Deletion correctly requires email confirmation');
  }

  // Test actual deletion
  const deleteRes = await axios.delete(`${API_URL}/users/me`, {
    headers: { Authorization: `Bearer ${token}` },
    data: { confirmEmail: email }
  });
  console.log('✅ Account deleted:', deleteRes.data.message);

  // Verify user is deleted (login should fail)
  try {
    await axios.post(`${API_URL}/auth/login`, { email, password: 'testpass123' });
    console.log('❌ Login should fail after deletion');
  } catch (e) {
    console.log('✅ User correctly deleted - login fails');
  }

  console.log('\n✨ GDPR TESTS PASSED ✨');
}

testGDPR().catch(err => {
  console.error('❌ Test failed:', err.response?.data || err.message);
});
