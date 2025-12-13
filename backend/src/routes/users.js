const express = require('express');
const pool = require('../config/database');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get user profile
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const result = await pool.query(
      `SELECT id, name, email, phone, avatar_url, created_at
       FROM users WHERE id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user: result.rows[0] });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Update own profile
router.put('/me', async (req, res) => {
  try {
    const { name, phone, avatar_url } = req.body;
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (name !== undefined) {
      updates.push(`name = $${paramCount++}`);
      values.push(name);
    }
    if (phone !== undefined) {
      updates.push(`phone = $${paramCount++}`);
      values.push(phone);
    }
    if (avatar_url !== undefined) {
      updates.push(`avatar_url = $${paramCount++}`);
      values.push(avatar_url);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(req.user.id);

    const result = await pool.query(
      `UPDATE users SET ${updates.join(', ')}
       WHERE id = $${paramCount}
       RETURNING id, name, email, phone, avatar_url, updated_at`,
      values
    );

    res.json({
      message: 'Profile updated',
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// ============= GDPR COMPLIANCE =============

// Export all user data (GDPR Article 20 - Data Portability)
router.get('/me/export', async (req, res) => {
  try {
    const userId = req.user.id;

    // Collect all user data from all tables
    const [
      userData,
      partnershipData,
      locationData,
      activityData,
      musicData,
      deviceData,
      privacyData,
      capsuleData
    ] = await Promise.all([
      // User profile
      pool.query(
        `SELECT id, name, email, phone, avatar_url, created_at, updated_at
         FROM users WHERE id = $1`,
        [userId]
      ),
      // Partnerships
      pool.query(
        `SELECT p.*,
           u1.email as user1_email, u1.name as user1_name,
           u2.email as user2_email, u2.name as user2_name
         FROM partnerships p
         LEFT JOIN users u1 ON p.user1_id = u1.id
         LEFT JOIN users u2 ON p.user2_id = u2.id
         WHERE user1_id = $1 OR user2_id = $1`,
        [userId]
      ),
      // Location signals
      pool.query(
        `SELECT latitude, longitude, accuracy, place_name, place_type,
                weather_temp, weather_condition, timestamp
         FROM location_signals WHERE user_id = $1
         ORDER BY timestamp DESC`,
        [userId]
      ),
      // Activity signals
      pool.query(
        `SELECT activity_type, steps, distance, calories, heart_rate,
                workout_type, workout_duration, date, timestamp
         FROM activity_signals WHERE user_id = $1
         ORDER BY timestamp DESC`,
        [userId]
      ),
      // Music signals
      pool.query(
        `SELECT track_name, artist_name, album_name, is_playing,
                progress_ms, duration_ms, timestamp
         FROM music_signals WHERE user_id = $1
         ORDER BY timestamp DESC`,
        [userId]
      ),
      // Device signals
      pool.query(
        `SELECT battery_level, is_charging, timezone, do_not_disturb, timestamp
         FROM device_signals WHERE user_id = $1
         ORDER BY timestamp DESC`,
        [userId]
      ),
      // Privacy settings
      pool.query(
        `SELECT share_location, share_activity, share_music, share_calendar,
                share_device_context, paused_until, updated_at
         FROM privacy_settings WHERE user_id = $1`,
        [userId]
      ),
      // Daily capsules (via partnership)
      pool.query(
        `SELECT dc.content, dc.date, dc.created_at
         FROM daily_capsules dc
         JOIN partnerships p ON dc.partnership_id = p.id
         WHERE (p.user1_id = $1 OR p.user2_id = $1)
         ORDER BY dc.date DESC`,
        [userId]
      )
    ]);

    // Build export package
    const exportData = {
      exportDate: new Date().toISOString(),
      exportVersion: '1.0',
      user: userData.rows[0] || null,
      partnerships: partnershipData.rows,
      signals: {
        location: locationData.rows,
        activity: activityData.rows,
        music: musicData.rows,
        device: deviceData.rows
      },
      privacySettings: privacyData.rows[0] || null,
      dailyCapsules: capsuleData.rows
    };

    // Set headers for file download
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="sugarbum-data-export-${userId}-${Date.now()}.json"`);

    res.json(exportData);
  } catch (error) {
    console.error('Data export error:', error);
    res.status(500).json({ error: 'Failed to export data' });
  }
});

// Delete account (GDPR Article 17 - Right to Erasure)
router.delete('/me', async (req, res) => {
  try {
    const userId = req.user.id;
    const { confirmEmail } = req.body;

    // Verify user wants to delete by confirming their email
    if (!confirmEmail || confirmEmail !== req.user.email) {
      return res.status(400).json({
        error: 'Please confirm deletion by providing your email address',
        required: 'confirmEmail'
      });
    }

    // Check if user is immutable (admin)
    const userCheck = await pool.query(
      'SELECT is_immutable FROM users WHERE id = $1',
      [userId]
    );

    if (userCheck.rows[0]?.is_immutable) {
      return res.status(403).json({ error: 'Admin accounts cannot be deleted via API' });
    }

    // Delete all user data in order (respecting foreign key constraints)
    // Note: Using transactions would be better for production
    await Promise.all([
      pool.query('DELETE FROM push_tokens WHERE user_id = $1', [userId]),
      pool.query('DELETE FROM location_signals WHERE user_id = $1', [userId]),
      pool.query('DELETE FROM activity_signals WHERE user_id = $1', [userId]),
      pool.query('DELETE FROM music_signals WHERE user_id = $1', [userId]),
      pool.query('DELETE FROM device_signals WHERE user_id = $1', [userId]),
      pool.query('DELETE FROM privacy_settings WHERE user_id = $1', [userId]),
      pool.query('DELETE FROM spotify_tokens WHERE user_id = $1', [userId]),
      // Daily capsules are linked to partnerships, not users directly
      // They get cascade deleted when partnerships are deleted
    ]);

    // Delete partnerships (user could be user1 or user2)
    // This also covers pending requests since they're stored as partnerships with status='pending'
    await pool.query(
      'DELETE FROM partnerships WHERE user1_id = $1 OR user2_id = $1',
      [userId]
    );

    // Finally delete the user
    await pool.query('DELETE FROM users WHERE id = $1', [userId]);

    res.json({
      message: 'Account and all associated data have been permanently deleted',
      deletedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Account deletion error:', error);
    res.status(500).json({ error: 'Failed to delete account' });
  }
});

module.exports = router;
