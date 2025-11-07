import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Change this to your Railway backend URL or use localhost for development
const API_URL = __DEV__
  ? 'http://localhost:3000/api'
  : 'https://bubbles-production-ac7a.up.railway.app/api';

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
