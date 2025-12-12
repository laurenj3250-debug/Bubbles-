import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

// Firebase configuration for Sugarbum
const firebaseConfig = {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
    databaseURL: process.env.EXPO_PUBLIC_FIREBASE_DATABASE_URL,
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: "sugarbum-d19a8.appspot.com",
    messagingSenderId: "1071287363690",
    appId: "1:1071287363690:web:8029982463428941783857",
    measurementId: "G-654321"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get database reference
const database = getDatabase(app);

export { database };
