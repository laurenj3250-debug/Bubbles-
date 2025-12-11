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
        // 1. Find the partner's ID
        const partnerRes = await pool.query(
            `SELECT CASE
         WHEN user1_id = $1 THEN user2_id
         ELSE user1_id
       END as partner_id
       FROM partnerships
       WHERE (user1_id = $1 OR user2_id = $1) AND status = 'accepted'`,
            [userId]
        );

        const partnerId = partnerRes.rows[0]?.partner_id;

        if (!partnerId) {
            // console.log(`No partner found for user ${userId}, skipping push.`);
            return;
        }

        // 2. Get partner's push token(s)
        const tokenRes = await pool.query(
            'SELECT token FROM push_tokens WHERE user_id = $1',
            [partnerId]
        );

        if (tokenRes.rows.length === 0) {
            // console.log(`No push token for partner ${partnerId}, skipping push.`);
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
