const express = require('express');
const pool = require('../config/database');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
router.use(authenticate);

// Get privacy settings
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT share_location, share_activity, share_music,
              share_calendar, share_device_context, paused_until
       FROM privacy_settings
       WHERE user_id = $1`,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      // Create default settings if they don't exist
      await pool.query(
        'INSERT INTO privacy_settings (user_id) VALUES ($1)',
        [req.user.id]
      );

      return res.json({
        share_location: true,
        share_activity: true,
        share_music: true,
        share_calendar: true,
        share_device_context: true,
        paused_until: null
      });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get privacy settings error:', error);
    res.status(500).json({ error: 'Failed to fetch privacy settings' });
  }
});

// Update privacy settings
router.put('/', async (req, res) => {
  try {
    const {
      shareLocation,
      shareActivity,
      shareMusic,
      shareCalendar,
      shareDeviceContext
    } = req.body;

    const updates = [];
    const values = [];
    let paramCount = 1;

    if (shareLocation !== undefined) {
      updates.push(`share_location = $${paramCount++}`);
      values.push(shareLocation);
    }
    if (shareActivity !== undefined) {
      updates.push(`share_activity = $${paramCount++}`);
      values.push(shareActivity);
    }
    if (shareMusic !== undefined) {
      updates.push(`share_music = $${paramCount++}`);
      values.push(shareMusic);
    }
    if (shareCalendar !== undefined) {
      updates.push(`share_calendar = $${paramCount++}`);
      values.push(shareCalendar);
    }
    if (shareDeviceContext !== undefined) {
      updates.push(`share_device_context = $${paramCount++}`);
      values.push(shareDeviceContext);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No settings to update' });
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(req.user.id);

    const result = await pool.query(
      `UPDATE privacy_settings
       SET ${updates.join(', ')}
       WHERE user_id = $${paramCount}
       RETURNING *`,
      values
    );

    res.json({
      message: 'Privacy settings updated',
      settings: result.rows[0]
    });
  } catch (error) {
    console.error('Update privacy settings error:', error);
    res.status(500).json({ error: 'Failed to update privacy settings' });
  }
});

// Pause all sharing temporarily
router.post('/pause', async (req, res) => {
  try {
    const { hours } = req.body; // How many hours to pause

    if (!hours || hours < 1) {
      return res.status(400).json({ error: 'Hours must be at least 1' });
    }

    const pausedUntil = new Date(Date.now() + hours * 60 * 60 * 1000);

    await pool.query(
      `UPDATE privacy_settings
       SET paused_until = $1, updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $2`,
      [pausedUntil, req.user.id]
    );

    res.json({
      message: 'Sharing paused',
      pausedUntil
    });
  } catch (error) {
    console.error('Pause sharing error:', error);
    res.status(500).json({ error: 'Failed to pause sharing' });
  }
});

// Resume sharing
router.post('/resume', async (req, res) => {
  try {
    await pool.query(
      `UPDATE privacy_settings
       SET paused_until = NULL, updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $1`,
      [req.user.id]
    );

    res.json({ message: 'Sharing resumed' });
  } catch (error) {
    console.error('Resume sharing error:', error);
    res.status(500).json({ error: 'Failed to resume sharing' });
  }
});

module.exports = router;
