import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

// Firebase configuration for Sugarbum
const firebaseConfig = {
    apiKey: "AIzaSyDrgnBe7b2aRO-QDb3_nKzXq6qsaUngcwQ",
    authDomain: "sugarbum-d19a8.firebaseapp.com",
    databaseURL: "https://sugarbum-d19a8-default-rtdb.firebaseio.com",
    projectId: "sugarbum-d19a8",
    storageBucket: "sugarbum-d19a8.firebasestorage.app",
    messagingSenderId: "705769715026",
    appId: "1:705769715026:web:394494e46196983706768b",
    measurementId: "G-EK0P1WE6P9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get database reference
const database = getDatabase(app);

export { database };
