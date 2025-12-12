import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

// Firebase configuration for Sugarbum
const firebaseConfig = {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || "AIzaSyDummyKeyForLocalDevelopment123456789",
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || "sugarbum-d19a8.firebaseapp.com",
    databaseURL: process.env.EXPO_PUBLIC_FIREBASE_DATABASE_URL || "https://sugarbum-d19a8-default-rtdb.firebaseio.com",
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || "sugarbum-d19a8",
    storageBucket: "sugarbum-d19a8.appspot.com",
    messagingSenderId: "1071287363690",
    appId: "1:1071287363690:web:8029982463428941783857",
    measurementId: "G-654321"
};

// Initialize Firebase
let app;
let database;

try {
    app = initializeApp(firebaseConfig);
    database = getDatabase(app);
    console.log('✅ Firebase initialized successfully');
} catch (error) {
    console.error('Firebase Initialization Error:', error);
    // Create a dummy database object to prevent crashes
    database = null;
}

export { database };
