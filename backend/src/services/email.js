const fs = require('fs');
const path = require('path');

/**
 * Mock Email Service
 * Logs emails to console instead of sending them
 * Can be swapped for real email service later (nodemailer)
 */

class EmailService {
    constructor() {
        this.emailLog = [];
    }

    /**
     * Send email (mocked - logs to console)
     */
    async sendEmail({ to, subject, html }) {
        const email = {
            to,
            subject,
            html,
            sentAt: new Date().toISOString()
        };

        // Log to console
        console.log('\n📧 ===== MOCK EMAIL SENT =====');
        console.log(`To: ${to}`);
        console.log(`Subject: ${subject}`);
        console.log(`Sent: ${email.sentAt}`);
        console.log('HTML Preview:', html.substring(0, 200) + '...');
        console.log('=============================\n');

        // Store in memory log
        this.emailLog.push(email);

        return { success: true, messageId: `mock-${Date.now()}` };
    }

    /**
     * Send partner invitation email
     */
    async sendPartnerInvite(toEmail, inviterName) {
        const subject = `💕 ${inviterName} wants to connect with you on Sugarbum!`;
        const html = this.getPartnerInviteTemplate(inviterName);

        return this.sendEmail({ to: toEmail, subject, html });
    }

    /**
     * Get branded email template for partner invitation
     */
    getPartnerInviteTemplate(inviterName) {
        // Note: Logo should be base64 encoded or hosted
        // For now using placeholder, will add real logo later

        return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
      background: linear-gradient(135deg, #4A90A4 0%, #667eea 50%, #9b87c7 100%);
    }
    .container {
      max-width: 600px;
      margin: 40px auto;
      background: white;
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    }
    .header {
      background: linear-gradient(135deg, #4A90A4 0%, #667eea 100%);
      padding: 40px 20px;
      text-align: center;
    }
    .logo {
      width: 80px;
      height: 80px;
      margin: 0 auto 20px;
      background: white;
      border-radius: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 40px;
    }
    .header h1 {
      color: white;
      margin: 0;
      font-size: 28px;
    }
    .content {
      padding: 40px 30px;
      text-align: center;
    }
    .content h2 {
      color: #333;
      font-size: 24px;
      margin-bottom: 20px;
    }
    .content p {
      color: #666;
      font-size: 16px;
      line-height: 1.6;
      margin-bottom: 30px;
    }
    .cta-button {
      display: inline-block;
      background: linear-gradient(135deg, #4A90A4 0%, #667eea 100%);
      color: white;
      text-decoration: none;
      padding: 15px 40px;
      border-radius: 10px;
      font-size: 18px;
      font-weight: bold;
      margin: 20px 0;
    }
    .footer {
      padding: 20px;
      text-align: center;
      color: #999;
      font-size: 12px;
      border-top: 1px solid #eee;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">💕</div>
      <h1>You're Invited!</h1>
    </div>
    
    <div class="content">
      <h2>${inviterName} wants to connect with you on Sugarbum</h2>
      <p>
        Sugarbum helps you stay connected with your special person through automatic life signals.
        Share your location, music, activity, and more - effortlessly.
      </p>
      
      <a href="sugarbum://signup" class="cta-button">
        Join Sugarbum →
      </a>
      
      <p style="margin-top: 30px; font-size: 14px;">
        If the app doesn't open, <a href="https://sugarbum-backend-production.up.railway.app">visit our website</a>
      </p>
    </div>
    
    <div class="footer">
      💕 Sugarbum - Stay Connected<br>
      This is an automated message
    </div>
  </div>
</body>
</html>
    `;
    }

    /**
     * Get all sent emails (for testing/debugging)
     */
    getEmailLog() {
        return this.emailLog;
    }
}

// Singleton instance
const emailService = new EmailService();

module.exports = emailService;
