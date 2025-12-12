const express = require('express');
const pool = require('../config/database');
const { authenticate } = require('../middleware/auth');
const axios = require('axios');
const { sendPushToPartner } = require('../services/push');
const { db } = require('../config/firebase');

const router = express.Router();
router.use(authenticate);

// Firebase write with retry logic
async function writeToFirebaseWithRetry(ref, data, maxRetries = 2) {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      if (db) {
        await db.ref(ref).set(data);
        return true;
      } else {
        console.warn('Firebase not initialized, skipping write to:', ref);
        return false;
      }
    } catch (err) {
      if (attempt < maxRetries) {
        console.warn(`Firebase write attempt ${attempt + 1} failed, retrying...`);
        await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
      } else {
        console.error('Firebase write error after retries:', err.message);
        return false;
      }
    }
  }
  return false;
}

// Simple in-memory cache for partner IDs
const partnerCache = new Map();

// Helper: Get partner ID
async function getPartnerId(userId) {
  // Check cache (TTL 5 minutes)
  const cached = partnerCache.get(userId);
  if (cached && Date.now() - cached.timestamp < 5 * 60 * 1000) {
    return cached.partnerId;
  }

  const result = await pool.query(
    `SELECT CASE
       WHEN user1_id = $1 THEN user2_id
       ELSE user1_id
     END as partner_id
     FROM partnerships
     WHERE (user1_id = $1 OR user2_id = $1) AND status = 'accepted'`,
    [userId]
  );

  const partnerId = result.rows[0]?.partner_id || null;

  // Update cache
  if (partnerId) {
    partnerCache.set(userId, { partnerId, timestamp: Date.now() });
  }

  return partnerId;
}

// Helper: Check if sharing is allowed
async function checkPrivacy(userId, category) {
  const result = await pool.query(
    `SELECT ${category}, paused_until FROM privacy_settings WHERE user_id = $1`,
    [userId]
  );

  if (result.rows.length === 0) return true;

  const settings = result.rows[0];

  // Check if sharing is paused
  if (settings.paused_until && new Date(settings.paused_until) > new Date()) {
    return false;
  }

  return settings[category];
}

// Helper: Get weather data
async function getWeather(lat, lon) {
  try {
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${process.env.WEATHER_API_KEY}`
    );

    return {
      temp: response.data.main.temp,
      condition: response.data.weather[0].main,
      icon: response.data.weather[0].icon
    };
  } catch (error) {
    console.error('Weather API error:', error.message);
    return null;
  }
}

// ============= LOCATION SIGNALS =============

// Send location signal
router.post('/location', async (req, res) => {
  try {
    const { latitude, longitude, accuracy, placeName, placeType } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({ error: 'Latitude and longitude are required' });
    }

    // Check privacy
    const canShare = await checkPrivacy(req.user.id, 'share_location');
    if (!canShare) {
      return res.json({ message: 'Location sharing is disabled' });
    }

    // Get weather
    const weather = process.env.WEATHER_API_KEY
      ? await getWeather(latitude, longitude)
      : null;

    // Store location in PostgreSQL (for history)
    const result = await pool.query(
      `INSERT INTO location_signals
       (user_id, latitude, longitude, accuracy, place_name, place_type,
        weather_temp, weather_condition, weather_icon)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        req.user.id, latitude, longitude, accuracy, placeName, placeType,
        weather?.temp, weather?.condition, weather?.icon
      ]
    );

    // Update Firebase for real-time sync (Fire and forget)
    if (db) {
      const firebaseData = {
        latitude: Number(latitude),
        longitude: Number(longitude),
        timestamp: Date.now()
      };

      // Only add optional fields if they exist
      if (accuracy != null) firebaseData.accuracy = Number(accuracy);
      if (placeName) firebaseData.placeName = placeName;
      if (placeType) firebaseData.placeType = placeType;
      if (weather) firebaseData.weather = weather;

      writeToFirebaseWithRetry(`users/${req.user.id}/status/location`, firebaseData);
    }

    // Send Push Notification
    const senderName = req.user.name || 'Your partner';
    const notificationBody = placeName
      ? `📍 ${senderName} is at ${placeName}`
      : `📍 ${senderName} updated their location`;

    // Fire and forget (don't await)
    sendPushToPartner(req.user.id, 'Location Update', notificationBody, { type: 'location' });

    res.json({
      message: 'Location shared',
      signal: result.rows[0]
    });
  } catch (error) {
    console.error('❌ Location signal error:', error.message);
    console.error('Stack:', error.stack);
    res.status(500).json({ error: 'Failed to share location', details: error.message });
  }
});

// Get partner's latest location
router.get('/location/partner', async (req, res) => {
  try {
    const partnerId = await getPartnerId(req.user.id);

    if (!partnerId) {
      return res.status(404).json({ error: 'No partner found' });
    }

    // Check if partner allows location sharing
    const canShare = await checkPrivacy(partnerId, 'share_location');
    if (!canShare) {
      return res.json({ location: null, reason: 'Partner has disabled location sharing' });
    }

    const result = await pool.query(
      `SELECT * FROM location_signals
       WHERE user_id = $1
       ORDER BY timestamp DESC
       LIMIT 1`,
      [partnerId]
    );

    res.json({ location: result.rows[0] || null });
  } catch (error) {
    console.error('Get partner location error:', error);
    res.status(500).json({ error: 'Failed to fetch partner location' });
  }
});

// ============= ACTIVITY SIGNALS =============

// Send activity/fitness signal
router.post('/activity', async (req, res) => {
  try {
    const {
      activityType, steps, distance, calories,
      heartRate, workoutType, workoutDuration
    } = req.body;

    const canShare = await checkPrivacy(req.user.id, 'share_activity');
    if (!canShare) {
      return res.json({ message: 'Activity sharing is disabled' });
    }

    const result = await pool.query(
      `INSERT INTO activity_signals
       (user_id, activity_type, steps, distance, calories,
        heart_rate, workout_type, workout_duration)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        req.user.id, activityType, steps, distance, calories,
        heartRate, workoutType, workoutDuration
      ]
    );

    // Send Push Notification
    if (steps > 5000 || workoutType) {
      const senderName = req.user.name || 'Your partner';
      const body = workoutType
        ? `🏃 ${senderName} just finished a ${workoutType} workout!`
        : `🔥 ${senderName} just hit ${steps} steps!`;

      sendPushToPartner(req.user.id, 'Activity Update', body, { type: 'activity' });
    }

    res.json({
      message: 'Activity shared',
      signal: result.rows[0]
    });
  } catch (error) {
    console.error('❌ Activity signal error:', error.message);
    console.error('Stack:', error.stack);
    res.status(500).json({ error: 'Failed to share activity', details: error.message });
  }
});

// Get partner's latest activity
router.get('/activity/partner', async (req, res) => {
  try {
    const partnerId = await getPartnerId(req.user.id);

    if (!partnerId) {
      return res.status(404).json({ error: 'No partner found' });
    }

    const canShare = await checkPrivacy(partnerId, 'share_activity');
    if (!canShare) {
      return res.json({ activity: null, reason: 'Partner has disabled activity sharing' });
    }

    // Get today's aggregated activity
    const result = await pool.query(
      `SELECT
         SUM(steps) as total_steps,
         SUM(distance) as total_distance,
         SUM(calories) as total_calories,
         MAX(heart_rate) as max_heart_rate,
         date
       FROM activity_signals
       WHERE user_id = $1 AND date = CURRENT_DATE
       GROUP BY date`,
      [partnerId]
    );

    res.json({ activity: result.rows[0] || null });
  } catch (error) {
    console.error('Get partner activity error:', error);
    res.status(500).json({ error: 'Failed to fetch partner activity' });
  }
});

// ============= MUSIC SIGNALS =============

// Send music signal (now playing)
router.post('/music', async (req, res) => {
  try {
    const {
      trackName, artistName, albumName, trackUri,
      isPlaying, progressMs, durationMs, albumArtUrl
    } = req.body;

    const canShare = await checkPrivacy(req.user.id, 'share_music');
    if (!canShare) {
      return res.json({ message: 'Music sharing is disabled' });
    }

    const result = await pool.query(
      `INSERT INTO music_signals
       (user_id, track_name, artist_name, album_name, track_uri,
        is_playing, progress_ms, duration_ms, album_art_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        req.user.id, trackName, artistName, albumName, trackUri,
        isPlaying, progressMs, durationMs, albumArtUrl
      ]
    );

    // Send Push Notification
    if (isPlaying) {
      const senderName = req.user.name || 'Your partner';
      sendPushToPartner(
        req.user.id,
        'Now Playing 🎵',
        `${senderName} is listening to ${trackName} by ${artistName}`,
        { type: 'music' }
      );
    }

    res.json({
      message: 'Music shared',
      signal: result.rows[0]
    });
  } catch (error) {
    console.error('❌ Music signal error:', error.message);
    console.error('Stack:', error.stack);
    res.status(500).json({ error: 'Failed to share music', details: error.message });
  }
});

// Get partner's now playing
router.get('/music/partner', async (req, res) => {
  try {
    const partnerId = await getPartnerId(req.user.id);

    if (!partnerId) {
      return res.status(404).json({ error: 'No partner found' });
    }

    const canShare = await checkPrivacy(partnerId, 'share_music');
    if (!canShare) {
      return res.json({ music: null, reason: 'Partner has disabled music sharing' });
    }

    const result = await pool.query(
      `SELECT * FROM music_signals
       WHERE user_id = $1
       ORDER BY timestamp DESC
       LIMIT 1`,
      [partnerId]
    );

    res.json({ music: result.rows[0] || null });
  } catch (error) {
    console.error('Get partner music error:', error);
    res.status(500).json({ error: 'Failed to fetch partner music' });
  }
});

// ============= MISS YOU SIGNAL =============

// Send "Miss You" Love Bomb
router.post('/miss-you', async (req, res) => {
  try {
    const partnerId = await getPartnerId(req.user.id);
    if (!partnerId) {
      return res.status(404).json({ error: 'No partner found' });
    }

    // 1. Update Firebase for Realtime Trigger (The "Love Bomb")
    const firebaseWriteSuccess = await writeToFirebaseWithRetry(`users/${partnerId}/inbox/miss_you`, {
      senderId: req.user.id,
      timestamp: Date.now(),
      type: 'love_bomb'
    });
    if (!firebaseWriteSuccess) {
      console.error('Failed to write "miss you" signal to Firebase for partner:', partnerId);
      return res.status(500).json({ error: 'Failed to send love (realtime update failed)' });
    }

    // 2. Send Push Notification (High Priority)
    const senderName = req.user.name || 'Your partner';
    sendPushToPartner(
      req.user.id,
      `❤️ Miss You!`,
      `${senderName} is sending you some love. Open the app!`,
      { type: 'miss_you', priority: 'high' }
    );

    res.json({ message: 'Love sent!' });

  } catch (error) {
    console.error('Miss you error:', error);
    res.status(500).json({ error: 'Failed to send love' });
  }
});

// ============= DEVICE CONTEXT =============

// Send device context
router.post('/device', async (req, res) => {
  try {
    const { batteryLevel, isCharging, timezone, doNotDisturb } = req.body;

    const canShare = await checkPrivacy(req.user.id, 'share_device_context');
    if (!canShare) {
      return res.json({ message: 'Device context sharing is disabled' });
    }

    const result = await pool.query(
      `INSERT INTO device_signals
       (user_id, battery_level, is_charging, timezone, do_not_disturb)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [req.user.id, batteryLevel, isCharging, timezone, doNotDisturb]
    );

    // Send Push only for low battery or charging
    const senderName = req.user.name || 'Your partner';
    if (batteryLevel && batteryLevel < 20 && !isCharging) {
      sendPushToPartner(req.user.id, 'Low Battery 🪫', `${senderName}'s battery is at ${batteryLevel}%`, { type: 'device' });
    }

    res.json({
      message: 'Device context shared',
      signal: result.rows[0]
    });
  } catch (error) {
    console.error('Device signal error:', error);
    res.status(500).json({ error: 'Failed to share device context' });
  }
});

// Get all partner signals (dashboard)
router.get('/partner/all', async (req, res) => {
  try {
    const partnerId = await getPartnerId(req.user.id);

    if (!partnerId) {
      return res.status(404).json({ error: 'No partner found' });
    }

    // Get latest signals of each type
    const [location, activity, music, device] = await Promise.all([
      checkPrivacy(partnerId, 'share_location').then(async (canShare) => {
        if (!canShare) return null;
        const result = await pool.query(
          'SELECT * FROM location_signals WHERE user_id = $1 ORDER BY timestamp DESC LIMIT 1',
          [partnerId]
        );
        return result.rows[0] || null;
      }),

      checkPrivacy(partnerId, 'share_activity').then(async (canShare) => {
        if (!canShare) return null;
        const result = await pool.query(
          `SELECT SUM(steps) as total_steps, SUM(distance) as total_distance,
                  SUM(calories) as total_calories, MAX(heart_rate) as max_heart_rate
           FROM activity_signals WHERE user_id = $1 AND date = CURRENT_DATE`,
          [partnerId]
        );
        return result.rows[0] || null;
      }),

      checkPrivacy(partnerId, 'share_music').then(async (canShare) => {
        if (!canShare) return null;
        const result = await pool.query(
          'SELECT * FROM music_signals WHERE user_id = $1 ORDER BY timestamp DESC LIMIT 1',
          [partnerId]
        );
        return result.rows[0] || null;
      }),

      pool.query(
        'SELECT * FROM device_signals WHERE user_id = $1 ORDER BY timestamp DESC LIMIT 1',
        [partnerId]
      ).then(result => result.rows[0] || null)
    ]);

    res.json({
      partner_id: partnerId,
      signals: {
        location,
        activity,
        music,
        device
      }
    });
  } catch (error) {
    console.error('Get all partner signals error:', error);
    res.status(500).json({ error: 'Failed to fetch partner signals' });
  }
});

module.exports = router;
