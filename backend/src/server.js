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
const capsuleRoutes = require('./routes/capsules');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable for React Native Web
  crossOriginEmbedderPolicy: false
}));
// CORS configuration - more secure for production
const corsOrigin = process.env.FRONTEND_URL || (process.env.NODE_ENV === 'production' ? false : '*');
if (!process.env.FRONTEND_URL && process.env.NODE_ENV === 'production') {
  console.warn('⚠️  WARNING: FRONTEND_URL not set in production! CORS will block all requests.');
} else if (!process.env.FRONTEND_URL && process.env.NODE_ENV === 'development') {
  console.warn('⚠️  WARNING: FRONTEND_URL not set in development! CORS is set to "*" (all origins). This is insecure for production. Set FRONTEND_URL to restrict allowed origins.');
}
app.use(cors({
  origin: corsOrigin,
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

// Request Logger (only in development)
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`[REQUEST] ${req.method} ${req.path}`);
    next();
  });
}


// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
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
app.use('/api/capsules', capsuleRoutes); // [NEW]

// Start Cron Jobs
require('./jobs/cron'); // [NEW]

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

// Start server with admin setup
const setupAdmin = require('./config/setup-admin');

app.listen(PORT, '0.0.0.0', async () => {
  console.log(`
💕 Sugarbum API Server Running
━━━━━━━━━━━━━━━━━━━━━━━━━━━
Port: ${PORT}
Environment: ${process.env.NODE_ENV || 'development'}
Time: ${new Date().toISOString()}
━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);

  // Run admin setup
  try {
    await setupAdmin();
  } catch (error) {
    console.error('⚠️  Admin setup failed:', error.message);
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  pool.end(() => {
    console.log('Database pool closed');
  });
});
