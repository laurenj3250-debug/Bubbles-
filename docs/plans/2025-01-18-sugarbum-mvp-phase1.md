# Bubbles MVP - Phase 1: Core Presence Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build core presence features that let Lauren and Adam see each other's status (location, activity, weather, music) in real-time with zero effort.

**Architecture:** React Native mobile app with Express.js backend. Background services auto-detect location, activity, and music. Firebase Realtime Database syncs status between users. PostgreSQL stores historical data.

**Tech Stack:** React Native (Expo 49), Node.js/Express, PostgreSQL, Firebase Realtime Database, Expo Location, HealthKit/Google Fit, Spotify Web API, OpenWeatherMap API

---

## Prerequisites

Before starting, ensure:
- Backend is running locally (already set up)
- Mobile app is running in Expo (already set up)
- PostgreSQL database is running (already set up)
- You have Spotify Developer account credentials
- You have OpenWeatherMap API key

---

## Task 1: Firebase Setup for Real-Time Sync

**Goal:** Set up Firebase Realtime Database for instant status updates between partners.

**Files:**
- Create: `backend/src/config/firebase.js`
- Create: `mobile/src/config/firebase.js`
- Modify: `backend/package.json`
- Modify: `mobile/package.json`

**Step 1: Install Firebase Admin SDK (Backend)**

```bash
cd backend
npm install firebase-admin
```

**Step 2: Create Firebase project and get credentials**

1. Go to https://console.firebase.google.com
2. Create new project: "Bubbles"
3. Enable Realtime Database
4. Generate service account key (Settings → Service Accounts → Generate new private key)
5. Save JSON file as `backend/firebase-service-account.json`

**Step 3: Add firebase-service-account.json to .gitignore**

```bash
cd backend
echo "firebase-service-account.json" >> .gitignore
```

**Step 4: Create backend Firebase config**

File: `backend/src/config/firebase.js`

```javascript
const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin
const serviceAccount = require(path.join(__dirname, '../../firebase-service-account.json'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FIREBASE_DATABASE_URL || 'https://bubbles-default-rtdb.firebaseio.com'
});

const db = admin.database();

module.exports = { admin, db };
```

**Step 5: Update backend .env.example**

File: `backend/.env.example`

Add:
```
FIREBASE_DATABASE_URL=https://bubbles-default-rtdb.firebaseio.com
```

**Step 6: Update backend .env with actual Firebase URL**

File: `backend/.env`

Add the actual Firebase Realtime Database URL from your Firebase console.

**Step 7: Install Firebase SDK (Mobile)**

```bash
cd mobile
npm install firebase
```

**Step 8: Create mobile Firebase config**

File: `mobile/src/config/firebase.js`

```javascript
import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

// Get these from Firebase Console → Project Settings → General → Your apps
const firebaseConfig = {
  apiKey: "AIzaSy...", // Replace with actual
  authDomain: "bubbles-xxxxx.firebaseapp.com",
  databaseURL: "https://bubbles-default-rtdb.firebaseio.com",
  projectId: "bubbles-xxxxx",
  storageBucket: "bubbles-xxxxx.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export { database };
```

**Step 9: Test Firebase connection**

```bash
cd backend
node -e "const {db} = require('./src/config/firebase'); db.ref('test').set({hello: 'world'}).then(() => console.log('✅ Firebase connected')).catch(e => console.error('❌', e));"
```

Expected: `✅ Firebase connected`

**Step 10: Commit**

```bash
git add backend/src/config/firebase.js backend/package.json backend/.env.example mobile/src/config/firebase.js mobile/package.json mobile/package-lock.json backend/package-lock.json
git commit -m "feat: add Firebase Realtime Database setup

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 2: Location Permissions & Background Services

**Goal:** Request location permissions and set up background location tracking.

**Files:**
- Modify: `mobile/app.json`
- Create: `mobile/src/services/LocationService.js`
- Create: `mobile/src/permissions/requestLocationPermission.js`

**Step 1: Install expo-location and expo-task-manager**

```bash
cd mobile
npm install expo-location expo-task-manager
```

**Step 2: Update app.json with location permissions**

File: `mobile/app.json`

Add to the `expo` object:

```json
{
  "expo": {
    "name": "Bubbles",
    "slug": "bubbles-mobile",
    "plugins": [
      [
        "expo-location",
        {
          "locationAlwaysAndWhenInUsePermission": "Allow Bubbles to use your location to share where you are with your partner.",
          "locationAlwaysPermission": "Allow Bubbles to use your location even when the app is closed so your partner always knows where you are.",
          "locationWhenInUsePermission": "Allow Bubbles to use your location while you're using the app.",
          "isIosBackgroundLocationEnabled": true,
          "isAndroidBackgroundLocationEnabled": true
        }
      ]
    ],
    "ios": {
      "infoPlist": {
        "NSLocationAlwaysAndWhenInUseUsageDescription": "Allow Bubbles to use your location to share where you are with your partner.",
        "NSLocationWhenInUseUsageDescription": "Allow Bubbles to use your location while you're using the app.",
        "NSLocationAlwaysUsageDescription": "Allow Bubbles to use your location even when the app is closed.",
        "UIBackgroundModes": ["location"]
      }
    },
    "android": {
      "permissions": [
        "ACCESS_FINE_LOCATION",
        "ACCESS_COARSE_LOCATION",
        "ACCESS_BACKGROUND_LOCATION"
      ]
    }
  }
}
```

**Step 3: Create location permission request helper**

File: `mobile/src/permissions/requestLocationPermission.js`

```javascript
import * as Location from 'expo-location';
import { Platform, Alert } from 'react-native';

export async function requestLocationPermission() {
  try {
    // Request foreground permission first
    const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();

    if (foregroundStatus !== 'granted') {
      Alert.alert(
        'Location Permission Required',
        'Bubbles needs your location to show your partner where you are. Please enable location access in Settings.',
        [{ text: 'OK' }]
      );
      return false;
    }

    // Request background permission (iOS and Android 10+)
    if (Platform.OS === 'ios' || Platform.Version >= 29) {
      const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();

      if (backgroundStatus !== 'granted') {
        Alert.alert(
          'Background Location',
          'For the best experience, allow location access "Always" so your partner can see where you are even when the app is closed.',
          [{ text: 'OK' }]
        );
      }
    }

    return true;
  } catch (error) {
    console.error('Error requesting location permission:', error);
    return false;
  }
}

export async function checkLocationPermission() {
  const { status } = await Location.getForegroundPermissionsAsync();
  return status === 'granted';
}
```

**Step 4: Create LocationService**

File: `mobile/src/services/LocationService.js`

```javascript
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { database } from '../config/firebase';
import { ref, set } from 'firebase/database';
import api from '../config/api';

const LOCATION_TASK_NAME = 'background-location-task';

// Define the background task
TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
  if (error) {
    console.error('Background location error:', error);
    return;
  }

  if (data) {
    const { locations } = data;
    const location = locations[0];

    try {
      // Get user ID from storage
      const userStr = await AsyncStorage.getItem('user');
      if (!userStr) return;

      const user = JSON.parse(userStr);

      // Update Firebase for real-time sync
      await set(ref(database, `users/${user.id}/location`), {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy,
        timestamp: Date.now()
      });

      // Also save to backend for history
      await api.post('/signals/location', {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy
      });

    } catch (err) {
      console.error('Error updating location:', err);
    }
  }
});

class LocationService {
  async startTracking() {
    try {
      const isRegistered = await TaskManager.isTaskRegisteredAsync(LOCATION_TASK_NAME);

      if (!isRegistered) {
        await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
          accuracy: Location.Accuracy.Balanced,
          timeInterval: 5 * 60 * 1000, // Update every 5 minutes
          distanceInterval: 100, // Or when moved 100 meters
          foregroundService: {
            notificationTitle: 'Bubbles is sharing your location',
            notificationBody: 'Tap to open the app',
            notificationColor: '#8B5CF6'
          },
          pausesUpdatesAutomatically: true
        });

        console.log('✅ Background location tracking started');
      }
    } catch (error) {
      console.error('Error starting location tracking:', error);
    }
  }

  async stopTracking() {
    try {
      const isRegistered = await TaskManager.isTaskRegisteredAsync(LOCATION_TASK_NAME);

      if (isRegistered) {
        await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
        console.log('✅ Background location tracking stopped');
      }
    } catch (error) {
      console.error('Error stopping location tracking:', error);
    }
  }

  async getCurrentLocation() {
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced
      });

      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy
      };
    } catch (error) {
      console.error('Error getting current location:', error);
      return null;
    }
  }
}

export default new LocationService();
```

**Step 5: Test location service**

Create test file: `mobile/src/services/__tests__/LocationService.test.js`

```javascript
import LocationService from '../LocationService';
import * as Location from 'expo-location';

jest.mock('expo-location');

describe('LocationService', () => {
  it('should get current location', async () => {
    Location.getCurrentPositionAsync.mockResolvedValue({
      coords: {
        latitude: 40.7128,
        longitude: -74.0060,
        accuracy: 10
      }
    });

    const result = await LocationService.getCurrentLocation();

    expect(result).toEqual({
      latitude: 40.7128,
      longitude: -74.0060,
      accuracy: 10
    });
  });
});
```

Run test:
```bash
cd mobile
npm test -- LocationService.test.js
```

Expected: PASS

**Step 6: Commit**

```bash
git add mobile/app.json mobile/src/services/LocationService.js mobile/src/permissions/requestLocationPermission.js mobile/src/services/__tests__/LocationService.test.js mobile/package.json mobile/package-lock.json
git commit -m "feat: add location permissions and background tracking

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 3: Weather API Integration

**Goal:** Fetch weather data based on user's location.

**Files:**
- Create: `backend/src/services/WeatherService.js`
- Create: `backend/src/routes/weather.js`
- Modify: `backend/src/server.js`
- Modify: `backend/.env.example`

**Step 1: Get OpenWeatherMap API key**

1. Sign up at https://openweathermap.org/api
2. Get free API key
3. Add to `backend/.env`:

```
WEATHER_API_KEY=your_openweathermap_api_key_here
```

**Step 2: Create WeatherService**

File: `backend/src/services/WeatherService.js`

```javascript
const axios = require('axios');

class WeatherService {
  constructor() {
    this.apiKey = process.env.WEATHER_API_KEY;
    this.baseUrl = 'https://api.openweathermap.org/data/2.5';
  }

  async getWeather(latitude, longitude) {
    try {
      const response = await axios.get(`${this.baseUrl}/weather`, {
        params: {
          lat: latitude,
          lon: longitude,
          appid: this.apiKey,
          units: 'metric' // Celsius
        }
      });

      const data = response.data;

      return {
        temp: Math.round(data.main.temp),
        condition: data.weather[0].main,
        description: data.weather[0].description,
        icon: data.weather[0].icon,
        humidity: data.main.humidity,
        windSpeed: data.wind.speed,
        city: data.name
      };
    } catch (error) {
      console.error('Error fetching weather:', error.message);
      return null;
    }
  }
}

module.exports = new WeatherService();
```

**Step 3: Create weather API route**

File: `backend/src/routes/weather.js`

```javascript
const express = require('express');
const router = express.Router();
const weatherService = require('../services/WeatherService');
const authMiddleware = require('../middleware/auth');

// Get weather for a location
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { latitude, longitude } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({
        error: 'Latitude and longitude are required'
      });
    }

    const weather = await weatherService.getWeather(
      parseFloat(latitude),
      parseFloat(longitude)
    );

    if (!weather) {
      return res.status(500).json({
        error: 'Failed to fetch weather data'
      });
    }

    res.json(weather);
  } catch (error) {
    console.error('Weather route error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
```

**Step 4: Add weather route to server**

File: `backend/src/server.js`

Add after other route imports:

```javascript
const weatherRoutes = require('./routes/weather');
```

Add after other route registrations:

```javascript
app.use('/api/weather', weatherRoutes);
```

**Step 5: Update .env.example**

File: `backend/.env.example`

Add:
```
WEATHER_API_KEY=your-openweathermap-api-key
```

**Step 6: Test weather endpoint**

```bash
cd backend

# Start server if not running
npm run dev &

# Test the endpoint (replace with your actual JWT token)
curl -X GET "http://localhost:3000/api/weather?latitude=55.8642&longitude=-4.2518" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

Expected output (Glasgow weather):
```json
{
  "temp": 12,
  "condition": "Clouds",
  "description": "overcast clouds",
  "icon": "04d",
  "humidity": 82,
  "windSpeed": 5.2,
  "city": "Glasgow"
}
```

**Step 7: Commit**

```bash
git add backend/src/services/WeatherService.js backend/src/routes/weather.js backend/src/server.js backend/.env.example
git commit -m "feat: add weather API integration

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 4: Spotify Integration (Now Playing)

**Goal:** Connect to Spotify to detect what music user is listening to.

**Files:**
- Create: `backend/src/services/SpotifyService.js`
- Create: `backend/src/routes/spotify.js`
- Modify: `backend/src/server.js`
- Create: `mobile/src/screens/SpotifyConnectScreen.js`

**Step 1: Create Spotify App**

1. Go to https://developer.spotify.com/dashboard
2. Create new app: "Bubbles"
3. Set redirect URI: `exp://localhost:19000/--/spotify-callback` (for Expo dev)
4. Note Client ID and Client Secret
5. Add to `backend/.env`:

```
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
SPOTIFY_REDIRECT_URI=exp://localhost:19000/--/spotify-callback
```

**Step 2: Install Spotify Web API library**

```bash
cd backend
npm install spotify-web-api-node
```

**Step 3: Create SpotifyService**

File: `backend/src/services/SpotifyService.js`

```javascript
const SpotifyWebApi = require('spotify-web-api-node');

class SpotifyService {
  constructor() {
    this.clientId = process.env.SPOTIFY_CLIENT_ID;
    this.clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
    this.redirectUri = process.env.SPOTIFY_REDIRECT_URI;
  }

  createSpotifyApi(accessToken = null, refreshToken = null) {
    const spotifyApi = new SpotifyWebApi({
      clientId: this.clientId,
      clientSecret: this.clientSecret,
      redirectUri: this.redirectUri
    });

    if (accessToken) {
      spotifyApi.setAccessToken(accessToken);
    }
    if (refreshToken) {
      spotifyApi.setRefreshToken(refreshToken);
    }

    return spotifyApi;
  }

  getAuthUrl(scopes = ['user-read-currently-playing', 'user-read-recently-played']) {
    const spotifyApi = this.createSpotifyApi();
    return spotifyApi.createAuthorizeURL(scopes, 'state');
  }

  async exchangeCodeForTokens(code) {
    try {
      const spotifyApi = this.createSpotifyApi();
      const data = await spotifyApi.authorizationCodeGrant(code);

      return {
        accessToken: data.body.access_token,
        refreshToken: data.body.refresh_token,
        expiresIn: data.body.expires_in
      };
    } catch (error) {
      console.error('Error exchanging code for tokens:', error);
      throw error;
    }
  }

  async refreshAccessToken(refreshToken) {
    try {
      const spotifyApi = this.createSpotifyApi(null, refreshToken);
      const data = await spotifyApi.refreshAccessToken();

      return {
        accessToken: data.body.access_token,
        expiresIn: data.body.expires_in
      };
    } catch (error) {
      console.error('Error refreshing token:', error);
      throw error;
    }
  }

  async getCurrentlyPlaying(accessToken) {
    try {
      const spotifyApi = this.createSpotifyApi(accessToken);
      const data = await spotifyApi.getMyCurrentPlayingTrack();

      if (!data.body || !data.body.item) {
        return null;
      }

      const track = data.body.item;

      return {
        trackName: track.name,
        artistName: track.artists.map(a => a.name).join(', '),
        albumName: track.album.name,
        albumArt: track.album.images[0]?.url,
        isPlaying: data.body.is_playing,
        progressMs: data.body.progress_ms,
        durationMs: track.duration_ms,
        trackUri: track.uri
      };
    } catch (error) {
      if (error.statusCode === 401) {
        // Token expired
        return { error: 'token_expired' };
      }
      console.error('Error getting currently playing:', error);
      return null;
    }
  }
}

module.exports = new SpotifyService();
```

**Step 4: Create Spotify routes**

File: `backend/src/routes/spotify.js`

```javascript
const express = require('express');
const router = express.Router();
const spotifyService = require('../services/SpotifyService');
const authMiddleware = require('../middleware/auth');
const pool = require('../config/database');

// Get Spotify auth URL
router.get('/auth-url', authMiddleware, (req, res) => {
  const authUrl = spotifyService.getAuthUrl();
  res.json({ authUrl });
});

// Exchange code for tokens (called after OAuth redirect)
router.post('/callback', authMiddleware, async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ error: 'Code is required' });
    }

    const tokens = await spotifyService.exchangeCodeForTokens(code);

    // Calculate expiry timestamp
    const expiresAt = new Date(Date.now() + tokens.expiresIn * 1000);

    // Save tokens to database
    await pool.query(
      `INSERT INTO spotify_tokens (user_id, access_token, refresh_token, expires_at)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id)
       DO UPDATE SET
         access_token = $2,
         refresh_token = $3,
         expires_at = $4,
         updated_at = CURRENT_TIMESTAMP`,
      [req.user.userId, tokens.accessToken, tokens.refreshToken, expiresAt]
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Spotify callback error:', error);
    res.status(500).json({ error: 'Failed to connect Spotify' });
  }
});

// Get currently playing track
router.get('/now-playing', authMiddleware, async (req, res) => {
  try {
    // Get user's Spotify tokens
    const result = await pool.query(
      'SELECT access_token, refresh_token, expires_at FROM spotify_tokens WHERE user_id = $1',
      [req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Spotify not connected' });
    }

    let { access_token, refresh_token, expires_at } = result.rows[0];

    // Check if token expired
    if (new Date(expires_at) < new Date()) {
      // Refresh the token
      const newTokens = await spotifyService.refreshAccessToken(refresh_token);
      access_token = newTokens.accessToken;

      const newExpiresAt = new Date(Date.now() + newTokens.expiresIn * 1000);

      await pool.query(
        'UPDATE spotify_tokens SET access_token = $1, expires_at = $2 WHERE user_id = $3',
        [access_token, newExpiresAt, req.user.userId]
      );
    }

    const nowPlaying = await spotifyService.getCurrentlyPlaying(access_token);

    if (!nowPlaying) {
      return res.json({ playing: false });
    }

    res.json({ playing: true, ...nowPlaying });
  } catch (error) {
    console.error('Now playing error:', error);
    res.status(500).json({ error: 'Failed to get now playing' });
  }
});

// Get partner's currently playing
router.get('/partner/now-playing', authMiddleware, async (req, res) => {
  try {
    // Get user's partner
    const partnerResult = await pool.query(
      `SELECT
        CASE
          WHEN user1_id = $1 THEN user2_id
          ELSE user1_id
        END as partner_id
       FROM partnerships
       WHERE (user1_id = $1 OR user2_id = $1) AND status = 'accepted'`,
      [req.user.userId]
    );

    if (partnerResult.rows.length === 0) {
      return res.status(404).json({ error: 'No partner found' });
    }

    const partnerId = partnerResult.rows[0].partner_id;

    // Get partner's Spotify tokens
    const tokenResult = await pool.query(
      'SELECT access_token, refresh_token, expires_at FROM spotify_tokens WHERE user_id = $1',
      [partnerId]
    );

    if (tokenResult.rows.length === 0) {
      return res.json({ playing: false, message: 'Partner has not connected Spotify' });
    }

    let { access_token, refresh_token, expires_at } = tokenResult.rows[0];

    // Check if token expired and refresh if needed
    if (new Date(expires_at) < new Date()) {
      const newTokens = await spotifyService.refreshAccessToken(refresh_token);
      access_token = newTokens.accessToken;

      const newExpiresAt = new Date(Date.now() + newTokens.expiresIn * 1000);

      await pool.query(
        'UPDATE spotify_tokens SET access_token = $1, expires_at = $2 WHERE user_id = $3',
        [access_token, newExpiresAt, partnerId]
      );
    }

    const nowPlaying = await spotifyService.getCurrentlyPlaying(access_token);

    if (!nowPlaying) {
      return res.json({ playing: false });
    }

    res.json({ playing: true, ...nowPlaying });
  } catch (error) {
    console.error('Partner now playing error:', error);
    res.status(500).json({ error: 'Failed to get partner now playing' });
  }
});

module.exports = router;
```

**Step 5: Add Spotify routes to server**

File: `backend/src/server.js`

Add import:
```javascript
const spotifyRoutes = require('./routes/spotify');
```

Add route registration:
```javascript
app.use('/api/spotify', spotifyRoutes);
```

**Step 6: Update .env.example**

File: `backend/.env.example`

Add:
```
SPOTIFY_CLIENT_ID=your-spotify-client-id
SPOTIFY_CLIENT_SECRET=your-spotify-client-secret
SPOTIFY_REDIRECT_URI=exp://localhost:19000/--/spotify-callback
```

**Step 7: Commit**

```bash
git add backend/src/services/SpotifyService.js backend/src/routes/spotify.js backend/src/server.js backend/.env.example backend/package.json backend/package-lock.json
git commit -m "feat: add Spotify integration for now playing

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 5: "Adam's Now" Home Screen - Frontend

**Goal:** Build the main home screen that shows partner's current status.

**Files:**
- Create: `mobile/src/screens/HomeScreen.js`
- Create: `mobile/src/components/PartnerStatusCard.js`
- Create: `mobile/src/components/WeatherDisplay.js`
- Create: `mobile/src/components/MusicNowPlaying.js`
- Modify: `mobile/App.js`

**Step 1: Install required dependencies**

```bash
cd mobile
npm install @react-native-community/netinfo date-fns
```

**Step 2: Create WeatherDisplay component**

File: `mobile/src/components/WeatherDisplay.js`

```javascript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function WeatherDisplay({ weather }) {
  if (!weather) return null;

  const getWeatherEmoji = (condition) => {
    const emojiMap = {
      'Clear': '☀️',
      'Clouds': '☁️',
      'Rain': '🌧️',
      'Snow': '❄️',
      'Thunderstorm': '⛈️',
      'Drizzle': '🌦️',
      'Mist': '🌫️',
      'Fog': '🌫️'
    };
    return emojiMap[condition] || '🌤️';
  };

  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>{getWeatherEmoji(weather.condition)}</Text>
      <Text style={styles.temp}>{weather.temp}°C</Text>
      <Text style={styles.city}>{weather.city}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
  },
  emoji: {
    fontSize: 32,
    marginRight: 8,
  },
  temp: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginRight: 8,
  },
  city: {
    fontSize: 14,
    color: '#6B7280',
  }
});
```

**Step 3: Create MusicNowPlaying component**

File: `mobile/src/components/MusicNowPlaying.js`

```javascript
import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

export default function MusicNowPlaying({ music }) {
  if (!music || !music.playing) {
    return (
      <View style={styles.container}>
        <Text style={styles.notPlaying}>🎵 Not listening to music</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {music.albumArt && (
        <Image
          source={{ uri: music.albumArt }}
          style={styles.albumArt}
        />
      )}
      <View style={styles.info}>
        <Text style={styles.trackName} numberOfLines={1}>
          {music.trackName}
        </Text>
        <Text style={styles.artistName} numberOfLines={1}>
          {music.artistName}
        </Text>
      </View>
      <Text style={styles.playingIcon}>▶️</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#1DB954',
    borderRadius: 8,
  },
  notPlaying: {
    color: '#fff',
    fontSize: 14,
  },
  albumArt: {
    width: 50,
    height: 50,
    borderRadius: 4,
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  trackName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  artistName: {
    fontSize: 14,
    color: '#E8F5E9',
  },
  playingIcon: {
    fontSize: 20,
    marginLeft: 8,
  }
});
```

**Step 4: Create PartnerStatusCard component**

File: `mobile/src/components/PartnerStatusCard.js`

```javascript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { formatDistanceToNow } from 'date-fns';
import WeatherDisplay from './WeatherDisplay';
import MusicNowPlaying from './MusicNowPlaying';

export default function PartnerStatusCard({ partner, location, weather, music, lastActive }) {
  const getActivityEmoji = (activity) => {
    const emojiMap = {
      'working_out': '💪',
      'walking': '🚶',
      'running': '🏃',
      'cycling': '🚴',
      'sitting': '🛋️',
      'driving': '🚗'
    };
    return emojiMap[activity] || '📱';
  };

  const getActivityText = (activity) => {
    const textMap = {
      'working_out': 'Working out',
      'walking': 'Walking',
      'running': 'Running',
      'cycling': 'Cycling',
      'sitting': 'Chilling',
      'driving': 'Driving'
    };
    return textMap[activity] || 'Active';
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.partnerName}>{partner.name}'s Now</Text>
        {lastActive && (
          <Text style={styles.lastActive}>
            {formatDistanceToNow(new Date(lastActive), { addSuffix: true })}
          </Text>
        )}
      </View>

      {/* Location */}
      {location && (
        <View style={styles.section}>
          <Text style={styles.sectionIcon}>📍</Text>
          <Text style={styles.sectionText}>{location}</Text>
        </View>
      )}

      {/* Activity */}
      <View style={styles.section}>
        <Text style={styles.sectionIcon}>{getActivityEmoji('sitting')}</Text>
        <Text style={styles.sectionText}>{getActivityText('sitting')}</Text>
      </View>

      {/* Weather */}
      {weather && (
        <View style={styles.section}>
          <WeatherDisplay weather={weather} />
        </View>
      )}

      {/* Music */}
      {music && (
        <View style={styles.section}>
          <MusicNowPlaying music={music} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  partnerName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  lastActive: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  section: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  sectionText: {
    fontSize: 16,
    color: '#4B5563',
  }
});
```

**Step 5: Create HomeScreen**

File: `mobile/src/screens/HomeScreen.js`

```javascript
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  StyleSheet,
  SafeAreaView
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { database } from '../config/firebase';
import { ref, onValue, off } from 'firebase/database';
import api from '../config/api';
import PartnerStatusCard from '../components/PartnerStatusCard';

export default function HomeScreen() {
  const [partner, setPartner] = useState(null);
  const [partnerLocation, setPartnerLocation] = useState(null);
  const [partnerWeather, setPartnerWeather] = useState(null);
  const [partnerMusic, setPartnerMusic] = useState(null);
  const [lastActive, setLastActive] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPartner();
  }, []);

  const loadPartner = async () => {
    try {
      // Get partner info
      const response = await api.get('/partners/current');

      if (response.data.partner) {
        setPartner(response.data.partner);

        // Set up real-time listeners
        setupRealtimeListeners(response.data.partner.id);

        // Load initial data
        await loadPartnerData(response.data.partner.id);
      }
    } catch (error) {
      console.error('Error loading partner:', error);
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeListeners = (partnerId) => {
    // Listen to partner's location updates
    const locationRef = ref(database, `users/${partnerId}/location`);
    onValue(locationRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setPartnerLocation(data.placeName || 'Unknown location');
        setLastActive(data.timestamp);

        // Fetch weather for new location
        fetchWeather(data.latitude, data.longitude);
      }
    });

    // Listen to partner's music updates
    const musicRef = ref(database, `users/${partnerId}/music`);
    onValue(musicRef, (snapshot) => {
      const data = snapshot.val();
      setPartnerMusic(data);
    });

    // Cleanup listeners on unmount
    return () => {
      off(locationRef);
      off(musicRef);
    };
  };

  const fetchWeather = async (latitude, longitude) => {
    try {
      const response = await api.get('/weather', {
        params: { latitude, longitude }
      });
      setPartnerWeather(response.data);
    } catch (error) {
      console.error('Error fetching weather:', error);
    }
  };

  const loadPartnerData = async (partnerId) => {
    try {
      // Fetch partner's now playing
      const musicResponse = await api.get('/spotify/partner/now-playing');
      setPartnerMusic(musicResponse.data);
    } catch (error) {
      console.error('Error loading partner data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    if (partner) {
      await loadPartnerData(partner.id);
    }
    setRefreshing(false);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <Text>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!partner) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <Text style={styles.noPartnerText}>No partner connected</Text>
          <Text style={styles.noPartnerSubtext}>
            Go to Partner tab to connect
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.content}>
          <Text style={styles.title}>Bubbles</Text>

          <PartnerStatusCard
            partner={partner}
            location={partnerLocation}
            weather={partnerWeather}
            music={partnerMusic}
            lastActive={lastActive}
          />

          <Text style={styles.sectionTitle}>Today Together</Text>

          <View style={styles.placeholderCard}>
            <Text style={styles.placeholderText}>
              Your shared moments will appear here
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#8B5CF6',
    marginBottom: 24,
  },
  noPartnerText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  noPartnerSubtext: {
    fontSize: 14,
    color: '#6B7280',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 24,
    marginBottom: 12,
  },
  placeholderCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
  },
  placeholderText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  }
});
```

**Step 6: Update App.js to use new HomeScreen**

File: `mobile/App.js`

Replace the existing import and component:

```javascript
import HomeScreen from './src/screens/HomeScreen';
```

The HomeScreen should already be registered in the Tab navigator, so this should work.

**Step 7: Test the HomeScreen**

```bash
cd mobile
npm start
```

1. Open app in Expo Go
2. Log in with laurenj3250@gmail.com
3. Should see "Adam's Now" card (if partner is connected)
4. Pull to refresh should work

Expected: Home screen displays with partner status card

**Step 8: Commit**

```bash
git add mobile/src/screens/HomeScreen.js mobile/src/components/PartnerStatusCard.js mobile/src/components/WeatherDisplay.js mobile/src/components/MusicNowPlaying.js mobile/package.json mobile/package-lock.json
git commit -m "feat: add 'Adam's Now' home screen with real-time status

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 6: Photo & Voice Memo Sharing

**Goal:** Allow users to share photos and voice memos with their partner.

**Files:**
- Create: `backend/src/routes/media.js`
- Create: `mobile/src/components/QuickCaptureButton.js`
- Create: `mobile/src/screens/CameraScreen.js`
- Modify: `backend/src/server.js`
- Modify: `backend/package.json`

**Step 1: Install media handling dependencies (backend)**

```bash
cd backend
npm install multer aws-sdk @aws-sdk/client-s3 @aws-sdk/s3-request-presigner uuid
```

**Step 2: Set up S3 or local file storage configuration**

File: `backend/src/config/storage.js`

```javascript
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// For MVP, use local file storage
// In production, switch to S3

const uploadDir = path.join(__dirname, '../../uploads');

// Create uploads directory if it doesn't exist
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|mp4|mov|m4a|mp3|wav/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images, videos, and audio files are allowed.'));
    }
  }
});

module.exports = upload;
```

**Step 3: Create media routes**

File: `backend/src/routes/media.js`

```javascript
const express = require('express');
const router = express.Router();
const upload = require('../config/storage');
const authMiddleware = require('../middleware/auth');
const pool = require('../config/database');
const { db } = require('../config/firebase');
const path = require('path');

// Upload photo
router.post('/photo', authMiddleware, upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    const { caption } = req.body;

    // Save to database
    const result = await pool.query(
      `INSERT INTO media_signals (user_id, type, url, caption)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [req.user.userId, 'photo', fileUrl, caption || null]
    );

    const media = result.rows[0];

    // Get partner ID
    const partnerResult = await pool.query(
      `SELECT
        CASE
          WHEN user1_id = $1 THEN user2_id
          ELSE user1_id
        END as partner_id
       FROM partnerships
       WHERE (user1_id = $1 OR user2_id = $1) AND status = 'accepted'`,
      [req.user.userId]
    );

    if (partnerResult.rows.length > 0) {
      const partnerId = partnerResult.rows[0].partner_id;

      // Notify partner via Firebase
      await db.ref(`users/${partnerId}/newMedia`).set({
        type: 'photo',
        url: fileUrl,
        from: req.user.userId,
        timestamp: Date.now()
      });
    }

    res.json({
      success: true,
      media: {
        id: media.id,
        type: media.type,
        url: fileUrl,
        caption: media.caption,
        created_at: media.created_at
      }
    });
  } catch (error) {
    console.error('Photo upload error:', error);
    res.status(500).json({ error: 'Failed to upload photo' });
  }
});

// Upload voice memo
router.post('/voice-memo', authMiddleware, upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    const { duration } = req.body;

    // Save to database
    const result = await pool.query(
      `INSERT INTO media_signals (user_id, type, url, metadata)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [req.user.userId, 'voice_memo', fileUrl, JSON.stringify({ duration: parseInt(duration) || 0 })]
    );

    const media = result.rows[0];

    // Get partner ID and notify
    const partnerResult = await pool.query(
      `SELECT
        CASE
          WHEN user1_id = $1 THEN user2_id
          ELSE user1_id
        END as partner_id
       FROM partnerships
       WHERE (user1_id = $1 OR user2_id = $1) AND status = 'accepted'`,
      [req.user.userId]
    );

    if (partnerResult.rows.length > 0) {
      const partnerId = partnerResult.rows[0].partner_id;

      await db.ref(`users/${partnerId}/newMedia`).set({
        type: 'voice_memo',
        url: fileUrl,
        duration: parseInt(duration) || 0,
        from: req.user.userId,
        timestamp: Date.now()
      });
    }

    res.json({
      success: true,
      media: {
        id: media.id,
        type: media.type,
        url: fileUrl,
        created_at: media.created_at
      }
    });
  } catch (error) {
    console.error('Voice memo upload error:', error);
    res.status(500).json({ error: 'Failed to upload voice memo' });
  }
});

// Get recent media from partner
router.get('/partner/recent', authMiddleware, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    // Get partner ID
    const partnerResult = await pool.query(
      `SELECT
        CASE
          WHEN user1_id = $1 THEN user2_id
          ELSE user1_id
        END as partner_id
       FROM partnerships
       WHERE (user1_id = $1 OR user2_id = $1) AND status = 'accepted'`,
      [req.user.userId]
    );

    if (partnerResult.rows.length === 0) {
      return res.json({ media: [] });
    }

    const partnerId = partnerResult.rows[0].partner_id;

    // Get partner's recent media
    const result = await pool.query(
      `SELECT id, type, url, caption, metadata, created_at
       FROM media_signals
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT $2`,
      [partnerId, limit]
    );

    res.json({ media: result.rows });
  } catch (error) {
    console.error('Get partner media error:', error);
    res.status(500).json({ error: 'Failed to get partner media' });
  }
});

module.exports = router;
```

**Step 4: Add media_signals table to database**

File: `backend/src/config/migrate.js`

Add this table creation after existing tables:

```javascript
// Media signals (photos, voice memos)
await client.query(`
  CREATE TABLE IF NOT EXISTS media_signals (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    url TEXT NOT NULL,
    caption TEXT,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`);

await client.query(`
  CREATE INDEX IF NOT EXISTS idx_media_signals_user_created
  ON media_signals(user_id, created_at DESC)
`);
```

**Step 5: Run migration to create media_signals table**

```bash
cd backend
npm run migrate
```

Expected: `✅ All tables created successfully`

**Step 6: Add media routes to server and serve uploads**

File: `backend/src/server.js`

Add import:
```javascript
const mediaRoutes = require('./routes/media');
```

Add static file serving for uploads (before routes):
```javascript
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
```

Add route registration:
```javascript
app.use('/api/media', mediaRoutes);
```

**Step 7: Add uploads directory to .gitignore**

```bash
cd backend
echo "uploads/" >> .gitignore
```

**Step 8: Install mobile media dependencies**

```bash
cd mobile
npm install expo-camera expo-av expo-image-picker
```

**Step 9: Update app.json with camera permissions**

File: `mobile/app.json`

Add to iOS infoPlist:
```json
"NSCameraUsageDescription": "Bubbles needs camera access to let you share photos with your partner.",
"NSMicrophoneUsageDescription": "Bubbles needs microphone access to let you share voice memos with your partner.",
"NSPhotoLibraryUsageDescription": "Bubbles needs photo library access to let you share photos with your partner."
```

Add to Android permissions:
```json
"android": {
  "permissions": [
    "CAMERA",
    "RECORD_AUDIO",
    "READ_EXTERNAL_STORAGE",
    "WRITE_EXTERNAL_STORAGE"
  ]
}
```

**Step 10: Create QuickCaptureButton component**

File: `mobile/src/components/QuickCaptureButton.js`

```javascript
import React, { useState } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  Text
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Audio } from 'expo-av';
import api from '../config/api';

export default function QuickCaptureButton({ onCapture }) {
  const [showOptions, setShowOptions] = useState(false);
  const [recording, setRecording] = useState(null);
  const [isRecording, setIsRecording] = useState(false);

  const requestPermissions = async (type) => {
    if (type === 'camera') {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      return status === 'granted';
    } else if (type === 'audio') {
      const { status } = await Audio.requestPermissionsAsync();
      return status === 'granted';
    }
    return false;
  };

  const takePhoto = async () => {
    setShowOptions(false);

    const hasPermission = await requestPermissions('camera');
    if (!hasPermission) {
      Alert.alert('Permission required', 'Camera permission is needed to take photos');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: true,
      aspect: [4, 3]
    });

    if (!result.canceled) {
      await uploadPhoto(result.assets[0].uri);
    }
  };

  const uploadPhoto = async (uri) => {
    try {
      const formData = new FormData();
      formData.append('photo', {
        uri,
        type: 'image/jpeg',
        name: 'photo.jpg'
      });

      const response = await api.post('/media/photo', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        Alert.alert('Success', 'Photo sent to your partner! 📸');
        if (onCapture) onCapture();
      }
    } catch (error) {
      console.error('Upload photo error:', error);
      Alert.alert('Error', 'Failed to send photo');
    }
  };

  const startRecording = async () => {
    setShowOptions(false);

    const hasPermission = await requestPermissions('audio');
    if (!hasPermission) {
      Alert.alert('Permission required', 'Microphone permission is needed to record audio');
      return;
    }

    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      setRecording(recording);
      setIsRecording(true);
    } catch (error) {
      console.error('Start recording error:', error);
      Alert.alert('Error', 'Failed to start recording');
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      const status = await recording.getStatusAsync();

      setRecording(null);
      setIsRecording(false);

      if (uri) {
        await uploadVoiceMemo(uri, status.durationMillis);
      }
    } catch (error) {
      console.error('Stop recording error:', error);
      Alert.alert('Error', 'Failed to save recording');
    }
  };

  const uploadVoiceMemo = async (uri, duration) => {
    try {
      const formData = new FormData();
      formData.append('audio', {
        uri,
        type: 'audio/m4a',
        name: 'voice-memo.m4a'
      });
      formData.append('duration', Math.floor(duration / 1000));

      const response = await api.post('/media/voice-memo', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        Alert.alert('Success', 'Voice memo sent! 🎤');
        if (onCapture) onCapture();
      }
    } catch (error) {
      console.error('Upload voice memo error:', error);
      Alert.alert('Error', 'Failed to send voice memo');
    }
  };

  if (isRecording) {
    return (
      <View style={styles.recordingContainer}>
        <Text style={styles.recordingText}>🎤 Recording...</Text>
        <TouchableOpacity
          style={[styles.button, styles.stopButton]}
          onPress={stopRecording}
        >
          <Text style={styles.buttonText}>⏹️ Stop</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <>
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setShowOptions(true)}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>

      <Modal
        visible={showOptions}
        transparent
        animationType="fade"
        onRequestClose={() => setShowOptions(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowOptions(false)}
        >
          <View style={styles.optionsContainer}>
            <TouchableOpacity
              style={styles.optionButton}
              onPress={takePhoto}
            >
              <Text style={styles.optionIcon}>📸</Text>
              <Text style={styles.optionText}>Take Photo</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.optionButton}
              onPress={startRecording}
            >
              <Text style={styles.optionIcon}>🎤</Text>
              <Text style={styles.optionText}>Voice Memo</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.optionButton, styles.cancelButton]}
              onPress={() => setShowOptions(false)}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  fabIcon: {
    fontSize: 32,
    color: '#fff',
    fontWeight: '300',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  optionsContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    marginBottom: 12,
  },
  optionIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  optionText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  cancelButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    justifyContent: 'center',
  },
  cancelText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  recordingContainer: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    backgroundColor: '#EF4444',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  recordingText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 12,
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  stopButton: {
    backgroundColor: '#fff',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
  }
});
```

**Step 11: Add QuickCaptureButton to HomeScreen**

File: `mobile/src/screens/HomeScreen.js`

Add import:
```javascript
import QuickCaptureButton from '../components/QuickCaptureButton';
```

Add before closing `</SafeAreaView>`:
```javascript
<QuickCaptureButton onCapture={onRefresh} />
```

**Step 12: Test photo and voice memo sharing**

```bash
cd mobile
npm start
```

1. Open app
2. Tap + button
3. Take photo → should upload and show success
4. Tap + button
5. Record voice memo → should upload

**Step 13: Commit**

```bash
git add backend/src/routes/media.js backend/src/config/storage.js backend/src/config/migrate.js backend/src/server.js mobile/src/components/QuickCaptureButton.js mobile/src/screens/HomeScreen.js mobile/app.json backend/package.json mobile/package.json backend/.gitignore
git commit -m "feat: add photo and voice memo sharing

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 7: "Miss You" Button

**Goal:** Add one-tap button to send instant "miss you" signal to partner.

**Files:**
- Create: `mobile/src/components/MissYouButton.js`
- Create: `backend/src/routes/signals.js`
- Modify: `mobile/src/screens/HomeScreen.js`
- Modify: `backend/src/server.js`

**Step 1: Create miss_you_signals table**

File: `backend/src/config/migrate.js`

Add after other tables:

```javascript
// Miss you signals
await client.query(`
  CREATE TABLE IF NOT EXISTS miss_you_signals (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    partner_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`);

await client.query(`
  CREATE INDEX IF NOT EXISTS idx_miss_you_user_created
  ON miss_you_signals(user_id, created_at DESC)
`);
```

Run migration:
```bash
cd backend
npm run migrate
```

**Step 2: Create signals routes**

File: `backend/src/routes/signals.js`

```javascript
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const pool = require('../config/database');
const { db } = require('../config/firebase');

// Send "miss you" signal
router.post('/miss-you', authMiddleware, async (req, res) => {
  try {
    // Get partner ID
    const partnerResult = await pool.query(
      `SELECT
        CASE
          WHEN user1_id = $1 THEN user2_id
          ELSE user1_id
        END as partner_id
       FROM partnerships
       WHERE (user1_id = $1 OR user2_id = $1) AND status = 'accepted'`,
      [req.user.userId]
    );

    if (partnerResult.rows.length === 0) {
      return res.status(404).json({ error: 'No partner found' });
    }

    const partnerId = partnerResult.rows[0].partner_id;

    // Save to database
    await pool.query(
      `INSERT INTO miss_you_signals (user_id, partner_id)
       VALUES ($1, $2)`,
      [req.user.userId, partnerId]
    );

    // Send real-time notification via Firebase
    await db.ref(`users/${partnerId}/missYou`).set({
      from: req.user.userId,
      timestamp: Date.now()
    });

    // Get user info for notification
    const userResult = await pool.query(
      'SELECT name FROM users WHERE id = $1',
      [req.user.userId]
    );

    res.json({
      success: true,
      message: `${userResult.rows[0].name} misses you! 💜`
    });
  } catch (error) {
    console.error('Miss you signal error:', error);
    res.status(500).json({ error: 'Failed to send miss you signal' });
  }
});

// Get miss you stats
router.get('/miss-you/stats', authMiddleware, async (req, res) => {
  try {
    // Get partner ID
    const partnerResult = await pool.query(
      `SELECT
        CASE
          WHEN user1_id = $1 THEN user2_id
          ELSE user1_id
        END as partner_id
       FROM partnerships
       WHERE (user1_id = $1 OR user2_id = $1) AND status = 'accepted'`,
      [req.user.userId]
    );

    if (partnerResult.rows.length === 0) {
      return res.json({ sent: 0, received: 0, thisWeek: 0 });
    }

    const partnerId = partnerResult.rows[0].partner_id;

    // Count sent
    const sentResult = await pool.query(
      'SELECT COUNT(*) FROM miss_you_signals WHERE user_id = $1',
      [req.user.userId]
    );

    // Count received
    const receivedResult = await pool.query(
      'SELECT COUNT(*) FROM miss_you_signals WHERE user_id = $1',
      [partnerId]
    );

    // Count this week
    const thisWeekResult = await pool.query(
      `SELECT COUNT(*) FROM miss_you_signals
       WHERE (user_id = $1 OR user_id = $2)
       AND created_at >= NOW() - INTERVAL '7 days'`,
      [req.user.userId, partnerId]
    );

    res.json({
      sent: parseInt(sentResult.rows[0].count),
      received: parseInt(receivedResult.rows[0].count),
      thisWeek: parseInt(thisWeekResult.rows[0].count)
    });
  } catch (error) {
    console.error('Miss you stats error:', error);
    res.status(500).json({ error: 'Failed to get stats' });
  }
});

module.exports = router;
```

**Step 3: Add signals routes to server**

File: `backend/src/server.js`

Add import:
```javascript
const signalsRoutes = require('./routes/signals');
```

Add route registration:
```javascript
app.use('/api/signals', signalsRoutes);
```

**Step 4: Create MissYouButton component**

File: `mobile/src/components/MissYouButton.js`

```javascript
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Vibration
} from 'react-native';
import api from '../config/api';

export default function MissYouButton() {
  const [stats, setStats] = useState({ sent: 0, received: 0, thisWeek: 0 });
  const [sending, setSending] = useState(false);
  const scaleAnim = useState(new Animated.Value(1))[0];

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await api.get('/signals/miss-you/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error loading miss you stats:', error);
    }
  };

  const handlePress = async () => {
    if (sending) return;

    setSending(true);

    // Haptic feedback
    Vibration.vibrate(50);

    // Animation
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.2,
        duration: 100,
        useNativeDriver: true
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true
      })
    ]).start();

    try {
      await api.post('/signals/miss-you');

      // Update stats
      setStats(prev => ({
        ...prev,
        sent: prev.sent + 1,
        thisWeek: prev.thisWeek + 1
      }));

      // Show success feedback
      setTimeout(() => setSending(false), 500);
    } catch (error) {
      console.error('Error sending miss you:', error);
      setSending(false);
    }
  };

  return (
    <View style={styles.container}>
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <TouchableOpacity
          style={[styles.button, sending && styles.buttonSending]}
          onPress={handlePress}
          disabled={sending}
          activeOpacity={0.7}
        >
          <Text style={styles.icon}>💜</Text>
          <Text style={styles.text}>
            {sending ? 'Sending...' : 'Miss You'}
          </Text>
        </TouchableOpacity>
      </Animated.View>

      <View style={styles.stats}>
        <Text style={styles.statsText}>
          This week: {stats.thisWeek} 💜
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 20,
  },
  button: {
    backgroundColor: '#8B5CF6',
    borderRadius: 60,
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonSending: {
    backgroundColor: '#A78BFA',
  },
  icon: {
    fontSize: 48,
    marginBottom: 8,
  },
  text: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  stats: {
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
  },
  statsText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  }
});
```

**Step 5: Add MissYouButton to HomeScreen**

File: `mobile/src/screens/HomeScreen.js`

Add import:
```javascript
import MissYouButton from '../components/MissYouButton';
```

Add after PartnerStatusCard and before "Today Together" section:

```javascript
<MissYouButton />
```

**Step 6: Test miss you button**

```bash
cd mobile
npm start
```

1. Open app
2. Tap "Miss You" button
3. Should vibrate, animate, and show success
4. Stats should increment

**Step 7: Commit**

```bash
git add backend/src/routes/signals.js backend/src/config/migrate.js backend/src/server.js mobile/src/components/MissYouButton.js mobile/src/screens/HomeScreen.js
git commit -m "feat: add 'Miss You' button with real-time signals

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Next Steps

This completes the MVP Phase 1 implementation plan. You now have:

✅ Firebase real-time sync
✅ Background location tracking
✅ Weather integration
✅ Spotify now playing
✅ "Adam's Now" home screen
✅ Photo & voice memo sharing
✅ "Miss You" button

**To continue building:**
1. Test all features thoroughly with both accounts
2. Fix any bugs discovered
3. Move on to Phase 2 implementation plan (passive games)

---

## Plan Saved

Plan complete and saved to `docs/plans/2025-01-18-bubbles-mvp-phase1.md`.

**Two execution options:**

**1. Subagent-Driven (this session)** - I dispatch fresh subagent per task, review between tasks, fast iteration

**2. Parallel Session (separate)** - Open new session with executing-plans, batch execution with checkpoints

**Which approach would you prefer?**
