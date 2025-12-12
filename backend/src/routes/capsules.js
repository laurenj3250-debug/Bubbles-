const express = require('express');
const router = express.Router();
const { generateCapsule } = require('../services/capsule');
const pool = require('../config/database');

// GET /api/capsules/current (Today's capsule or last generated)
router.get('/current', async (req, res) => {
    try {
        const { id: userId } = req.user;

        // Find partnership
        const partnershipResult = await pool.query(
            `SELECT id FROM partnerships 
       WHERE (user1_id = $1 OR user2_id = $1) AND status = 'accepted'`,
            [userId]
        );

        if (partnershipResult.rows.length === 0) {
            return res.status(404).json({ error: 'No active partnership' });
        }
        const partnershipId = partnershipResult.rows[0].id;

        // Get latest capsule
        const capsuleResult = await pool.query(
            `SELECT * FROM daily_capsules 
       WHERE partnership_id = $1 
       ORDER BY date DESC LIMIT 1`,
            [partnershipId]
        );

        if (capsuleResult.rows.length === 0) {
            return res.json({ capsule: null });
        }

        res.json({ capsule: capsuleResult.rows[0] });

    } catch (error) {
        console.error('Get current capsule error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// POST /api/capsules/generate (Manual Trigger for Dev/Testing)
router.post('/generate', async (req, res) => {
    try {
        const { id: userId } = req.user;

        // Find partnership
        const partnershipResult = await pool.query(
            `SELECT id FROM partnerships 
         WHERE (user1_id = $1 OR user2_id = $1) AND status = 'accepted'`,
            [userId]
        );

        if (partnershipResult.rows.length === 0) {
            return res.status(404).json({ error: 'No active partnership' });
        }
        const partnershipId = partnershipResult.rows[0].id;

        const capsule = await generateCapsule(partnershipId);
        res.json({ message: 'Capsule generated', capsule });

    } catch (error) {
        console.error('Generate capsule error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
