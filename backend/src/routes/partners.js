const express = require('express');
const pool = require('../config/database');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
router.use(authenticate);

// Send partner request
router.post('/request', async (req, res) => {
  const client = await pool.connect();

  try {
    const { partnerEmail } = req.body;

    if (!partnerEmail) {
      return res.status(400).json({ error: 'Partner email is required' });
    }

    // Find partner by email
    const partnerResult = await client.query(
      'SELECT id, email, name FROM users WHERE email = $1',
      [partnerEmail.toLowerCase()]
    );

    if (partnerResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found with that email' });
    }

    const partner = partnerResult.rows[0];

    if (partner.id === req.user.id) {
      return res.status(400).json({ error: 'Cannot partner with yourself' });
    }

    // Check if partnership already exists
    const existingPartnership = await client.query(
      `SELECT * FROM partnerships
       WHERE (user1_id = $1 AND user2_id = $2)
          OR (user1_id = $2 AND user2_id = $1)`,
      [req.user.id, partner.id]
    );

    if (existingPartnership.rows.length > 0) {
      return res.status(400).json({ error: 'Partnership already exists or pending' });
    }

    // Create partnership request
    const result = await client.query(
      `INSERT INTO partnerships (user1_id, user2_id, status)
       VALUES ($1, $2, 'pending')
       RETURNING id, created_at`,
      [req.user.id, partner.id]
    );

    res.status(201).json({
      message: 'Partner request sent',
      partnership: {
        id: result.rows[0].id,
        partner: { id: partner.id, name: partner.name, email: partner.email },
        status: 'pending',
        created_at: result.rows[0].created_at
      }
    });
  } catch (error) {
    console.error('Partner request error:', error);
    res.status(500).json({ error: 'Failed to send partner request' });
  } finally {
    client.release();
  }
});

// Get pending requests
router.get('/requests', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT p.id, p.status, p.created_at,
              u.id as partner_id, u.name as partner_name, u.email as partner_email, u.avatar_url
       FROM partnerships p
       JOIN users u ON u.id = p.user1_id
       WHERE p.user2_id = $1 AND p.status = 'pending'`,
      [req.user.id]
    );

    res.json({ requests: result.rows });
  } catch (error) {
    console.error('Get requests error:', error);
    res.status(500).json({ error: 'Failed to fetch requests' });
  }
});

// Accept/reject partner request
router.post('/:partnershipId/respond', async (req, res) => {
  const client = await pool.connect();

  try {
    const { partnershipId } = req.params;
    const { accept } = req.body; // true or false

    // Verify this user is user2 (recipient)
    const partnership = await client.query(
      'SELECT * FROM partnerships WHERE id = $1 AND user2_id = $2',
      [partnershipId, req.user.id]
    );

    if (partnership.rows.length === 0) {
      return res.status(404).json({ error: 'Partnership request not found' });
    }

    if (accept) {
      await client.query(
        `UPDATE partnerships
         SET status = 'accepted', accepted_at = CURRENT_TIMESTAMP
         WHERE id = $1`,
        [partnershipId]
      );

      res.json({ message: 'Partner request accepted' });
    } else {
      await client.query(
        'DELETE FROM partnerships WHERE id = $1',
        [partnershipId]
      );

      res.json({ message: 'Partner request rejected' });
    }
  } catch (error) {
    console.error('Respond to request error:', error);
    res.status(500).json({ error: 'Failed to respond to request' });
  } finally {
    client.release();
  }
});

// Get current partner
router.get('/current', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT p.id as partnership_id, p.accepted_at,
              u.id, u.name, u.email, u.avatar_url, u.phone
       FROM partnerships p
       JOIN users u ON (u.id = p.user1_id OR u.id = p.user2_id)
       WHERE (p.user1_id = $1 OR p.user2_id = $1)
         AND p.status = 'accepted'
         AND u.id != $1`,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.json({ partner: null });
    }

    res.json({ partner: result.rows[0] });
  } catch (error) {
    console.error('Get partner error:', error);
    res.status(500).json({ error: 'Failed to fetch partner' });
  }
});

// Remove partnership
router.delete('/current', async (req, res) => {
  try {
    await pool.query(
      `DELETE FROM partnerships
       WHERE (user1_id = $1 OR user2_id = $1) AND status = 'accepted'`,
      [req.user.id]
    );

    res.json({ message: 'Partnership removed' });
  } catch (error) {
    console.error('Remove partner error:', error);
    res.status(500).json({ error: 'Failed to remove partnership' });
  }
});

module.exports = router;
