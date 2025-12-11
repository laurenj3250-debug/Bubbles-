const { Expo } = require('expo-server-sdk');
const pool = require('../config/database');

// Create a new Expo SDK client
const expo = new Expo();

/**
 * Send a push notification to a user's partner
 * @param {number} userId - The ID of the user sending the signal
 * @param {string} title - Notification title
 * @param {string} body - Notification body
 * @param {object} data - Extra data to send with notification
 */
async function sendPushToPartner(userId, title, body, data = {}) {
    try {
        // Optimized: Single query to get partner's tokens
        // logic: Find accepted partnership -> Get partner ID -> Get tokens
        const tokenRes = await pool.query(
            `SELECT pt.token
             FROM partnerships p
             JOIN push_tokens pt ON (
               CASE WHEN p.user1_id = $1 THEN p.user2_id ELSE p.user1_id END = pt.user_id
             )
             WHERE (p.user1_id = $1 OR p.user2_id = $1)
             AND p.status = 'accepted'`,
            [userId]
        );

        if (tokenRes.rows.length === 0) {
            // console.log(`No reachable partner tokens found for user ${userId}`);
            return;
        }

        // 3. Construct messages
        const messages = [];
        for (const row of tokenRes.rows) {
            const pushToken = row.token;

            // Check if token is valid Expo token
            if (!Expo.isExpoPushToken(pushToken)) {
                console.error(`Push token ${pushToken} is not a valid Expo push token`);
                continue;
            }

            messages.push({
                to: pushToken,
                sound: 'default',
                title,
                body,
                data: { ...data, senderId: userId },
            });
        }

        // 4. Send chunks
        const chunks = expo.chunkPushNotifications(messages);

        for (const chunk of chunks) {
            try {
                await expo.sendPushNotificationsAsync(chunk);
            } catch (error) {
                console.error('Error sending push chunk:', error);
            }
        }

        console.log(`Push notification sent to partner ${partnerId}: "${title}"`);

    } catch (error) {
        console.error('Error in sendPushToPartner:', error);
    }
}

module.exports = {
    sendPushToPartner
};
