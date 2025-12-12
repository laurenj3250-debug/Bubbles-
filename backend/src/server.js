const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const path = require('path');
require('dotenv').config();

const pool = require('./config/database');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const partnerRoutes = require('./routes/partners');
const signalsRoutes = require('./routes/signals');
const spotifyRoutes = require('./routes/spotify');
const privacyRoutes = require('./routes/privacy');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable for React Native Web
  crossOriginEmbedderPolicy: false
}));
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));
app.use(compression());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static files from the React Native Web build
app.use(express.static(path.join(__dirname, '../public')));

const { authLimiter, apiLimiter } = require('./middleware/rateLimiters');

// Rate limiting
app.use('/api', apiLimiter); // Global API limit


// Health check
app.get('/health', async (req, res) => {
  try {
    // Use a database-agnostic query (1=1 works in both SQLite and PostgreSQL)
    await pool.query('SELECT 1');
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected'
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error.message
    });
  }
});

// API Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/partners', partnerRoutes);
app.use('/api/signals', signalsRoutes);
app.use('/api/spotify', spotifyRoutes);
app.use('/api/privacy', privacyRoutes);
app.use('/api/admin', adminRoutes);

// Serve the React Native Web app for all non-API routes
app.get('*', (req, res, next) => {
  // Skip if this is an API route
  if (req.path.startsWith('/api/') || req.path === '/health') {
    return next();
  }

  // Serve the index.html for the web app
  res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`
💕 Sugarbum API Server Running
━━━━━━━━━━━━━━━━━━━━━━━━━━━
Port: ${PORT}
Environment: ${process.env.NODE_ENV || 'development'}
Time: ${new Date().toISOString()}
━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  pool.end(() => {
    console.log('Database pool closed');
  });
});
