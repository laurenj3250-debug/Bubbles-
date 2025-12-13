import axios from 'axios';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

// API URL - use relative path when served from same server, otherwise use full URL
const getApiUrl = () => {
  // Check if we're running on web
  if (typeof window !== 'undefined' && window.document) {
    // In development, explicitly point to backend port
    // In production, backend and frontend are served from same origin
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'http://localhost:3000/api';
    }
    // Production: use relative path
    return '/api';
  }

  // Mobile native: Use Railway backend for shared testing
  // This ensures both phones connect to the same database
  return 'https://sugarbum-backend-production.up.railway.app/api';
};

return `http://${fallbackHost}:3000/api`;
};

const API_URL = getApiUrl();

// Get base URL for admin panel (without /api suffix)
export const getBaseUrl = () => {
  return API_URL.replace('/api', '');
};

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
