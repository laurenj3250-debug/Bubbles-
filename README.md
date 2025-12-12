<div align="center">
<img src="mobile/assets/icon.png" alt="Bubbles Logo" width="120"/>

# 🫧 Bubbles

**Previously known as Sugarbum**

*Stay connected with your person through automatic life signals*
</div>

Bubbles is a cross-platform mobile app that automatically shares bite-size life signals between couples — location + weather, activity/fitness, Spotify now-playing, calendar status, and device context — with push notifications and a Railway-powered backend.

## 🎯 Project Overview

### What It Does

Bubbles helps couples stay connected throughout their day by automatically sharing contextual information:

- **📍 Location + Weather**: See where your partner is and what the weather is like there
- **🏃 Activity/Fitness**: Share steps, workouts, heart rate, and sleep data
- **🎵 Music**: See what your partner is listening to on Spotify
- **📅 Calendar Status**: Know when they're busy (e.g., "in a meeting", "at the gym")
- **📱 Device Context**: Battery level, charging status, timezone, Do Not Disturb

### Why Mobile (Not Web)?

Background services, sensors, health data, geofencing, and push notifications require **native mobile permissions** that web apps can't access.

## 🏗️ Architecture

```
Bubbles/
├── backend/           # Node/Express API on Railway
│   ├── src/
│   │   ├── routes/   # API endpoints
│   │   ├── config/   # Database & migrations
│   │   └── middleware/
│   └── package.json
│
├── mobile/           # React Native (Expo) app
│   ├── src/
│   │   ├── screens/  # UI screens
│   │   ├── context/  # React context
│   │   └── config/   # API client
│   ├── App.js
│   └── app.json
│
└── README.md
```

### Tech Stack

**Backend:**
- Node.js + Express
- **Database:** SQLite (local dev) / PostgreSQL (production)
- Railway deployment ready
- JWT authentication
- Admin panel for database management
- Spotify Web API integration
- OpenWeatherMap API

**Mobile:**
- React Native (Expo)
- iOS + Android + **Web** support
- React Navigation
- HealthKit (iOS) / Google Fit (Android)
- Expo Location, Calendar, Notifications (native-only features gracefully degraded on web)
- AsyncStorage for local data
- Platform-specific module guards for native APIs

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- **No database installation required** (uses SQLite by default)
- Expo CLI (optional - can use `npx expo`)
- Spotify Developer Account (optional, for music features)
- OpenWeatherMap API key (optional, for weather)

### 1. Backend Setup

```bash
cd backend
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your credentials (optional for local dev)

# Run database migrations (creates SQLite database)
npm run migrate

# Start the server
npm run dev
```

**Backend runs on:** `http://localhost:8080`  
**Admin panel:** `http://localhost:8080/admin.html` (password: `admin123`)

See [backend/README.md](backend/README.md) and [backend/DATABASE_SETUP.md](backend/DATABASE_SETUP.md) for detailed setup.

### 2. Mobile App Setup

```bash
cd mobile
npm install

# Start Expo development server
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android
```

**Important:** Update the API URL in `mobile/src/config/api.js` to point to your backend.

### 3. Deploy to Railway

See [backend/README.md](backend/README.md) for Railway deployment instructions.

## 📱 App Features

### Core Screens

1. **Authentication**
   - Login / Register
   - JWT-based auth
   - Secure token storage

2. **Home Dashboard**
   - Partner's latest signals
   - Location + weather card
   - Activity stats
   - Now playing music
   - Device context
   - Pull to refresh

3. **Partner Management**
   - Send/receive partner requests
   - Accept/decline requests
   - View current partner
   - Remove partnership

4. **Privacy Controls**
   - Toggle sharing per category
   - Pause all sharing temporarily (1-24 hours)
   - Resume sharing
   - Privacy-first design

5. **Settings**
   - Account info
   - Connected services
   - Notification preferences
   - Logout

## 🔧 Database Configuration

The backend supports **two database options**:

- **SQLite** (default) - Zero-config local development
- **PostgreSQL** (Railway) - Production deployment

The database adapter automatically detects which to use based on the `DATABASE_URL` environment variable.

**To switch databases:** Use `configure-database.bat` or see [DATABASE_SETUP.md](backend/DATABASE_SETUP.md)

## 🛠️ Admin Panel

Access the admin panel at **http://localhost:3000/admin.html**

**Features:**
- View all database tables and data
- Execute SQL queries
- Monitor user registrations
- Database statistics dashboard

**Default Password:** `admin123` (configurable via `ADMIN_PASSWORD` in `.env`)

## 🗄️ Database Schema

### Core Tables

- `users` - User accounts
- `partnerships` - Couple links (pending/accepted)
- `privacy_settings` - Per-user sharing preferences
- `push_tokens` - Expo push notification tokens

### Signal Tables

- `location_signals` - GPS + weather + place data
- `activity_signals` - Steps, workouts, heart rate, sleep
- `music_signals` - Spotify now-playing & recent tracks
- `device_signals` - Battery, charging, timezone, DND
- `calendar_signals` - Calendar events & status
- `geofences` - User-defined location boundaries
- `spotify_tokens` - OAuth tokens (access + refresh)

## 🔐 API Endpoints

### Authentication
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Partners
- `POST /api/partners/request` - Send partner request
- `GET /api/partners/requests` - Get pending requests
- `POST /api/partners/:id/respond` - Accept/reject
- `GET /api/partners/current` - Get partner
- `DELETE /api/partners/current` - Remove

### Signals
- `POST /api/signals/location` - Share location
- `POST /api/signals/activity` - Share activity
- `POST /api/signals/music` - Share music
- `POST /api/signals/device` - Share device context
- `GET /api/signals/partner/all` - Get all partner signals

### Privacy
- `GET /api/privacy` - Get settings
- `PUT /api/privacy` - Update settings
- `POST /api/privacy/pause` - Pause sharing
- `POST /api/privacy/resume` - Resume

### Spotify
- `GET /api/spotify/auth-url` - Get OAuth URL
- `GET /api/spotify/now-playing` - Current track
- `GET /api/spotify/recent` - Recent tracks

All routes (except auth) require `Authorization: Bearer <token>` header.

## 🛣️ Roadmap: "Ambient Presence"

### ✅ Phase 1: Foundation (COMPLETE)
- [x] Backend API + Database Adapter (SQLite/Postgres)
- [x] Admin Panel
- [x] User Auth & Partnership Linking
- [x] Push Notifications Service

### 🚧 Phase 2: Core Signals & Mobile (Currently Active)
- [x] Mobile App Config & Auto-IP Detection
- [x] Mobile Push Token Registration
- [x] Manual Location Sharing
- [ ] **Background Sync** (Passive Location/Battery via `expo-task-manager`)
- [ ] **Realtime Presence** (Transition endpoints to Socket.io)

### 📋 Phase 3: The "Killer Features"
- [ ] **Home Screen Widget** (iOS/Android) for instant connection
- [ ] **Haptic Touch** (Vibrate partner's phone via WebSocket)
- [ ] **Spotify Sync** (Listen Along)

## 🔒 Privacy & Security

- **Opt-in by default**: Users choose what to share
- **Granular controls**: Toggle each data category independently
- **Pause mode**: Temporarily disable all sharing
- **Data encryption**: TLS/SSL for all API calls
- **Secure storage**: JWT tokens stored in secure storage
- **Partner-only**: Data only shared with connected partner
- **No third-party sharing**: Your data stays between you and your partner

## 🧪 Development

### Backend Development

```bash
cd backend
npm run dev  # Runs with nodemon for auto-reload
```

### Mobile Development

```bash
cd mobile
npm start    # Start Expo dev server
```

Use Expo Go app on your phone or simulators/emulators for testing.

### Database Migrations

```bash
cd backend
npm run migrate  # Run migrations
```

## 📦 Deployment

### Backend (Railway)

1. Create Railway account
2. Create new project
3. Add PostgreSQL database
4. Set environment variables
5. Deploy: `railway up`
6. Run migrations: `railway run npm run migrate`

### Mobile (Expo)

For production builds:

```bash
cd mobile
eas build --platform ios    # iOS build
eas build --platform android # Android build
```

See [Expo EAS Build docs](https://docs.expo.dev/build/introduction/) for details.

## 🔧 Troubleshooting

### Backend Won't Start

**Issue:** Server crashes on startup  
**Solution:** Check that migrations have run: `cd backend && npm run migrate`

**Issue:** "Port already in use"  
**Solution:** Kill existing node processes: `Get-Process node | Stop-Process -Force`

### Database Issues

**Issue:** Location/signal writes fail  
**Solution:** Ensure you're using the latest code with the fixed SQLite adapter (commit 80e9fe1+)

**Issue:** Firebase errors in logs  
**Solution:** Firebase is optional. If not needed, you can ignore these warnings. The REST API works independently.

### Verification Test Fails

**Issue:** `verify-full-flow.js` returns errors  
**Solution:** 
1. Ensure server is running on port 8080
2. Check database migrations completed: `npm run migrate`
3. Review server logs for specific errors

### Mobile App Can't Connect

**Issue:** Network request failed  
**Solution:** Update `mobile/src/config/api.js` with your machine's IP address (not localhost if testing on device)

## 🐛 Known Issues & Limitations

- Location sharing requires manual permission grants
- Background location tracking needs additional setup
- Spotify integration requires Spotify Premium
- HealthKit only available on iOS
- Google Fit only available on Android
- Calendar integration in development

## 📝 Environment Variables

### Backend (.env)

```env
PORT=3000
NODE_ENV=development

# Database (leave blank for SQLite, set for PostgreSQL)
# DATABASE_URL=postgresql://...

# Admin Panel
ADMIN_PASSWORD=admin123

JWT_SECRET=your-secret
SPOTIFY_CLIENT_ID=...
SPOTIFY_CLIENT_SECRET=...
WEATHER_API_KEY=...
```

### Mobile

Update `API_URL` in `mobile/src/config/api.js`

## 🤝 Contributing

This is a personal project, but suggestions and feedback are welcome!

## 📄 License

MIT

## 🙏 Acknowledgments

- Built with [React Native](https://reactnative.dev/) and [Expo](https://expo.dev/)
- Backend powered by [Express](https://expressjs.com/)
- Deployed on [Railway](https://railway.app/)
- Weather by [OpenWeatherMap](https://openweathermap.org/)
- Music by [Spotify Web API](https://developer.spotify.com/)

---

**Made with 💜 for staying connected**
