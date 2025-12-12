const rateLimit = require('express-rate-limit');

// Strict limiter for authentication (Login/Register)
// Prevents brute-force attacks
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // Limit each IP to 20 requests per window
    message: { error: 'Too many login attempts, please try again later' },
    standardHeaders: true,
    legacyHeaders: false,
});

// Relaxed limiter for general API use
// Allows for frequent signal updates
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 300, // Limit each IP to 300 requests per window (20 req/min)
    message: { error: 'Too many requests, please slow down' },
    standardHeaders: true,
    legacyHeaders: false,
});

module.exports = {
    authLimiter,
    apiLimiter
};
