const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

// Initialize Firebase Admin SDK
let db = null;

try {
    let serviceAccount;

    // Check for base64-encoded credentials (Railway deployment)
    if (process.env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
        console.log('🔥 Loading Firebase credentials from environment variable...');
        const decoded = Buffer.from(
            process.env.FIREBASE_SERVICE_ACCOUNT_BASE64,
            'base64'
        ).toString('utf-8');
        serviceAccount = JSON.parse(decoded);
    } else {
        // Check if service account file exists (local development)
        const serviceAccountPath = path.join(__dirname, '../../firebase-service-account.json');

        if (!fs.existsSync(serviceAccountPath)) {
            console.log('⚠️  Firebase service account not found - Firebase features disabled');
            console.log('   (This is normal on Railway - REST API and PostgreSQL still work)');
            throw new Error('No Firebase credentials available');
        }

        serviceAccount = require(serviceAccountPath);
    }

    // Initialize Firebase Admin
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: process.env.FIREBASE_DATABASE_URL || 'https://sugarbum-d19a8-default-rtdb.firebaseio.com'
    });

    // Get database reference
    db = admin.database();

    console.log('🔥 Firebase Admin SDK initialized successfully');
} catch (error) {
    console.error('⚠️  Firebase Admin SDK initialization failed:', error.message);
    console.error('   Firebase real-time features disabled. REST API still functional.');
}

module.exports = { admin, db };
