const pool = require('../config/database');
const { isSQLite } = require('../config/database');

/**
 * Generates a Daily Capsule for a given partnership ID.
 * @param {number} partnershipId 
 * @param {Date} [targetDate] - Defaults to current date
 */
const generateCapsule = async (partnershipId, targetDate = new Date()) => {
    try {
        // 1. Get Partnership Info
        const partResult = await pool.query(
            'SELECT * FROM partnerships WHERE id = $1',
            [partnershipId]
        );

        if (partResult.rows.length === 0) throw new Error('Partnership not found');
        const partnership = partResult.rows[0];

        // Format date for queries (YYYY-MM-DD)
        const dateStr = targetDate.toISOString().split('T')[0];

        // 2. Fetch Signals for both users
        const stats = {
            together_minutes: 0,
            distance_km: 0,
            music_overlap: 0,
            top_mood: 'Chill' // Placeholder
        };

        // --- LOGIC: Fetch Locations ---
        // In a real app, we'd do complex geospatial querying. 
        // For MVP, we'll just check if they had location signals within 100m of each other around same time.
        // This is computationally expensive in SQL for large datasets, so we'll simplify:
        // "Did they both share location from the same 'place_name'?"

        // Fetch user1 locations
        const u1Locs = await pool.query(
            `SELECT place_name, timestamp FROM location_signals 
       WHERE user_id = $1 AND date(timestamp) = $2`,
            [partnership.user1_id, dateStr]
        );

        // Fetch user2 locations
        const u2Locs = await pool.query(
            `SELECT place_name, timestamp FROM location_signals 
       WHERE user_id = $1 AND date(timestamp) = $2`,
            [partnership.user2_id, dateStr]
        );

        // Calculate "Together Time" (Naive)
        // If they were at the same place name on the same day.
        const sharedPlaces = new Set();
        u1Locs.rows.forEach(l1 => {
            const match = u2Locs.rows.find(l2 => l2.place_name === l1.place_name && l1.place_name);
            if (match) sharedPlaces.add(l1.place_name);
        });

        // 3. Construct Content JSON
        const content = {
            message: sharedPlaces.size > 0
                ? `You both visited ${Array.from(sharedPlaces).slice(0, 3).join(', ')} today!`
                : "You were busy bees today! 🐝",
            shared_places: Array.from(sharedPlaces),
            photo_count: 0, // Placeholder
            highlights: [
                "Synced up at 9:00 AM",
                "Listened to similar vibes"
            ]
        };

        // 4. Save to DB
        // Handle JSON compatibility (SQLite stores as string)
        const contentVal = isSQLite ? JSON.stringify(content) : content;
        const statsVal = isSQLite ? JSON.stringify(stats) : stats;

        const query = `
      INSERT INTO daily_capsules (partnership_id, date, content, stats)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT(partnership_id, date) 
      DO UPDATE SET content = $3, stats = $4
      RETURNING id
    `;

        const result = await pool.query(query, [partnershipId, dateStr, contentVal, statsVal]);

        console.log(`Capsule generated for partnership ${partnershipId}, ID: ${result.rows[0].id}`);
        return result.rows[0];

    } catch (error) {
        console.error('Generate capsule error:', error);
        throw error;
    }
};

module.exports = {
    generateCapsule
};
