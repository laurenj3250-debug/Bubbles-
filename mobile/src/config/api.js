import axios from 'axios';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

// API URL - use relative path when served from same server, otherwise use full URL
const getApiUrl = () => {
  // Check if we're running on web
  if (typeof window !== 'undefined' && window.document) {
    // Use relative path for web
    return '/api';
  }

  // dev: Use local backend
  // Smart detection for Physical Device or Emulator via Expo Go
  // This gets the IP of the computer running Metro bundler
  const debuggerHost = Constants.expoConfig?.hostUri || Constants.manifest?.debuggerHost;
  const localhost = debuggerHost?.split(':')[0] || 'localhost';

  // For Android Emulator, localhost is 10.0.2.2 usually, but if using hostUri it might be the LAN IP.
  // If running in Emulator, hostUri might return the LAN IP too.
  // Let is just use the deteced host IP, fallback to localhost.

  if (debuggerHost) {
    return `http://${localhost}:3000/api`;
  }

  // Fallback for independent builds or when debuggerHost is missing
  const Platform = require('react-native').Platform;
  const fallbackHost = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';

  // return `http://${fallbackHost}:3000/api`;

  // Production Railway URL
  return 'https://sugarbum-backend-production.up.railway.app/api';
};

const API_URL = getApiUrl();

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - logout user
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('user');
      // Navigation will be handled by App.js auth state
    }
    return Promise.reject(error);
  }
);

export default api;
