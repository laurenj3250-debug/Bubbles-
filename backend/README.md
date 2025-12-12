# 🫧 Bubbles Backend API

Backend API for the Bubbles couples context-sharing mobile app. Built with Node.js, Express, and PostgreSQL, designed to deploy on Railway.

## 🚀 Tech Stack

- **Node.js** + **Express** - REST API server
- **Database** - SQLite (local) / PostgreSQL (production)
- **JWT** - Authentication
- **Admin Panel** - Database management interface
- **Spotify Web API** - Music integration
- **OpenWeatherMap API** - Weather data
- **Expo Push Notifications** - Mobile notifications

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── database.js        # PostgreSQL connection pool
│   │   └── migrate.js         # Database schema migrations
│   ├── middleware/
│   │   └── auth.js            # JWT authentication middleware
│   ├── routes/
│   │   ├── auth.js            # Auth endpoints (register, login)
│   │   ├── users.js           # User management
│   │   ├── partners.js        # Partnership/couple linking
│   │   ├── signals.js         # Location, activity, music, device context
│   │   ├── spotify.js         # Spotify OAuth & data
│   │   └── privacy.js         # Privacy controls
│   └── server.js              # Main Express app
├── .env.example
├── package.json
├── railway.json               # Railway deployment config
└── README.md
```

## 🗄️ Database Schema

**Core Tables:**
- `users` - User accounts
- `partnerships` - Couple links (pending/accepted)
- `privacy_settings` - Sharing preferences per user
- `push_tokens` - Expo push notification tokens

**Signal Tables:**
- `location_signals` - GPS + weather + place data
- `activity_signals` - Steps, workouts, heart rate, sleep
- `music_signals` - Spotify now-playing & recent tracks
- `device_signals` - Battery, charging, timezone, DND
- `calendar_signals` - Calendar events & status
- `geofences` - User-defined location boundaries
- `spotify_tokens` - OAuth tokens (access + refresh)

## 🔧 Setup

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Environment Variables

Copy `.env.example` to `.env` and fill in:

```env
# Database Configuration
# For LOCAL DEVELOPMENT: Leave DATABASE_URL blank or comment it out to use SQLite
# For RAILWAY/PRODUCTION: Set DATABASE_URL to your Railway PostgreSQL connection string
# DATABASE_URL=postgresql://user:password@host:5432/bubbles

# Admin Panel (optional)
ADMIN_PASSWORD=admin123

# JWT Secret (generate a secure random string)
JWT_SECRET=your-super-secret-jwt-key

# Spotify API (get from https://developer.spotify.com/)
SPOTIFY_CLIENT_ID=your_client_id
SPOTIFY_CLIENT_SECRET=your_client_secret
SPOTIFY_REDIRECT_URI=https://your-api.railway.app/api/spotify/callback

# Weather API (get from https://openweathermap.org/api)
WEATHER_API_KEY=your_api_key

# Expo Push (optional, for notifications)
EXPO_ACCESS_TOKEN=your_token
```

### 3. Run Database Migrations

```bash
npm run migrate
```

### 4. Start Development Server

```bash
npm run dev
```

Server runs on `http://localhost:3000`

### 5. Access Admin Panel
Visit `http://localhost:3000/admin.html`
- Default password: `admin123`
- Inspect tables, run queries, and check health status.

## 🗄️ Database Configuration

This backend supports **dual database modes**:

1.  **SQLite (Default)**: Zero-configuration, file-based database for local development. Data is stored in `backend/bubbles.db`.
2.  **PostgreSQL**: For production (Railway) or local PostgreSQL instances.

To switch, use `../configure-database.bat` or edit `.env`. See `DATABASE_SETUP.md` for details.

## 🚂 Railway Deployment

### Prerequisites
1. Create a Railway account at https://railway.app
2. Install Railway CLI: `npm i -g @railway/cli`

### Deploy Steps

1. **Create a new Railway project**
   ```bash
   railway login
   railway init
   ```

2. **Add PostgreSQL database**
   - In Railway dashboard, click "New" → "Database" → "PostgreSQL"
   - Railway automatically sets `DATABASE_URL` environment variable

3. **Set environment variables**
   - Go to project → Variables
   - Add all variables from `.env.example`
   - Railway auto-injects `DATABASE_URL` and `PORT`

4. **Deploy**
   ```bash
   railway up
   ```

5. **Run migrations**
   ```bash
   railway run npm run migrate
   ```

6. **Get your API URL**
   ```bash
   railway domain
   ```

Your API will be live at `https://your-app.railway.app`

### Environment Variables on Railway

Set these in the Railway dashboard under "Variables":

- `JWT_SECRET` - Generate with `openssl rand -base64 32`
- `SPOTIFY_CLIENT_ID` - From Spotify Developer Dashboard
- `SPOTIFY_CLIENT_SECRET` - From Spotify Developer Dashboard
- `SPOTIFY_REDIRECT_URI` - `https://your-api.railway.app/api/spotify/callback`
- `WEATHER_API_KEY` - From OpenWeatherMap
- `FRONTEND_URL` - Your mobile app scheme (e.g., `exp://192.168.1.x:19000`)

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/push-token` - Register push notification token

### Partners
- `POST /api/partners/request` - Send partner request
- `GET /api/partners/requests` - Get pending requests
- `POST /api/partners/:id/respond` - Accept/reject request
- `GET /api/partners/current` - Get current partner
- `DELETE /api/partners/current` - Remove partnership

### Signals
- `POST /api/signals/location` - Share location
- `GET /api/signals/location/partner` - Get partner's location
- `POST /api/signals/activity` - Share activity/fitness data
- `GET /api/signals/activity/partner` - Get partner's activity
- `POST /api/signals/music` - Share now-playing
- `GET /api/signals/music/partner` - Get partner's music
- `POST /api/signals/device` - Share device context
- `GET /api/signals/partner/all` - Get all partner signals

### Spotify
- `GET /api/spotify/auth-url` - Get OAuth URL
- `GET /api/spotify/callback` - OAuth callback
- `GET /api/spotify/now-playing` - Current track
- `GET /api/spotify/recent` - Recently played
- `GET /api/spotify/status` - Connection status
- `DELETE /api/spotify/disconnect` - Disconnect Spotify

### Privacy
- `GET /api/privacy` - Get privacy settings
- `PUT /api/privacy` - Update settings
- `POST /api/privacy/pause` - Pause all sharing
- `POST /api/privacy/resume` - Resume sharing

All routes (except auth) require `Authorization: Bearer <token>` header.

## 🧪 Testing

Test the health endpoint:

```bash
curl https://your-api.railway.app/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2025-11-07T...",
  "database": "connected"
}
```

## 🔒 Security Features

- Helmet.js for HTTP security headers
- Rate limiting (100 requests per 15 min per IP)
- JWT token expiration (30 days)
- Bcrypt password hashing (10 rounds)
- CORS configuration
- SQL injection protection (parameterized queries)
- Privacy controls & granular sharing permissions

## ⚡ Performance Features

- **In-Memory Caching**: Daily capsules cached with 1-hour TTL
- **Partner ID Caching**: 5-minute cache for partnership lookups
- **Non-Blocking Firebase**: Real-time updates are fire-and-forget
- **Request Throttling**: Touch events throttled to 100ms (mobile)
- **Compression**: Gzip compression enabled for all responses
- **Connection Pooling**: PostgreSQL connection pool optimized
- **Smart Indexes**: Optimized queries on timestamp and user_id columns

**Performance Impact:**
- Capsule endpoint: ~90% reduction in DB queries
- Location sharing: <50ms response time
- Authentication: <100ms with bcrypt overhead

## 📚 Next Steps

- [ ] Implement calendar integration (Google Calendar API)
- [ ] Add background job processing (node-cron)
- [ ] Set up push notification triggers
- [ ] Add geofencing rules & arrival notifications
- [ ] Implement data aggregation & daily summaries
- [ ] Add WebSocket support for real-time updates

## 📄 License

MIT
