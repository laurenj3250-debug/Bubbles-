const express = require('express');
const router = express.Router();
const { generateCapsule } = require('../services/capsule');
const pool = require('../config/database');
const { authenticate } = require('../middleware/auth');

// Simple in-memory cache for capsules (TTL: 1 hour)
const capsuleCache = new Map();
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

function getCachedCapsule(partnershipId, date) {
    const key = `${partnershipId}-${date}`;
    const cached = capsuleCache.get(key);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return cached.data;
    }
    return null;
}

function setCachedCapsule(partnershipId, date, data) {
    const key = `${partnershipId}-${date}`;
    capsuleCache.set(key, { data, timestamp: Date.now() });

    // Periodic cleanup: every 20 writes or if cache > 100, clear old entries
    if (capsuleCache.size % 20 === 0 || capsuleCache.size > 100) {
        const entriesToDelete = [];
        const now = Date.now();
        for (const [k, v] of capsuleCache.entries()) {
            if (now - v.timestamp > CACHE_TTL) {
                entriesToDelete.push(k);
            }
        }
        entriesToDelete.forEach(k => capsuleCache.delete(k));
    }
}

// Apply middleware to all routes
router.use(authenticate);

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

        // Check cache first (using today's date as key)
        const today = new Date().toISOString().split('T')[0];
        const cached = getCachedCapsule(partnershipId, today);
        if (cached) {
            console.log('✅ Serving capsule from cache');
            return res.json({ capsule: cached, cached: true });
        }

        // Get latest capsule from DB
        const capsuleResult = await pool.query(
            `SELECT * FROM daily_capsules 
       WHERE partnership_id = $1 
       ORDER BY date DESC LIMIT 1`,
            [partnershipId]
        );

        if (capsuleResult.rows.length === 0) {
            return res.json({ capsule: null });
        }

        const capsule = capsuleResult.rows[0];

        // Cache if it's today's capsule
        if (capsule.date === today) {
            setCachedCapsule(partnershipId, today, capsule);
        }

        res.json({ capsule });

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
