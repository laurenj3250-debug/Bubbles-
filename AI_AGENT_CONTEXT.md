# AI Agent Context: Sugarbum Project

**Last Updated:** 2025-12-13
**Project Status:** OPERATIONAL - All Core Features Functional
**Tagline:** "Be together, apart"

---

## Project Overview

**Sugarbum** is a couples context-sharing mobile app built with:
- **Backend:** Node.js + Express + SQLite (local) / PostgreSQL (production)
- **Mobile:** React Native (Expo SDK 53)
- **Deployment:** Railway (backend), Expo EAS (mobile)
- **Real-time:** Firebase Realtime Database (optional)

### Core Features (All Working)
1. User Authentication (JWT)
2. Partnership system (email invites)
3. Location sharing with weather
4. Activity/fitness signals
5. Music signals (Spotify integration)
6. Device context (battery, timezone)
7. "Miss You" love bomb notifications
8. Daily capsules (AI-generated summaries)

---

## Recent Updates (Dec 13, 2025)

### Logo & Branding Integration
- Added `SugarbumLogo.js` - SVG component with full logo (two bums, heart, wifi signals)
- Added `SugarbumIcon.js` - Compact icon version
- Added `TabBarIcons.js` - Themed SVG icons (Home, Partner, Settings)
- Updated LoginScreen and RegisterScreen with new branding
- Tagline: "Be together, apart"

### Expo Connectivity Fix
- Fixed critical syntax error in `mobile/src/config/api.js`
- Removed unreachable code causing white screen/download errors

### Theme Updates
- Added logo-specific colors: `logoPink`, `logoGreen`, `logoHeart`, `logoNavy`
- Updated `deepNavy` to match logo background (#191938)
- Added `navyText` for text color (#3D3B5E)

---

## Project Structure

```
Sugarbum/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.js      # SQLite/Postgres dual adapter
│   │   │   ├── firebase.js      # Optional real-time
│   │   │   └── migrate.js       # Database schema
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── partners.js
│   │   │   ├── signals.js
│   │   │   ├── capsules.js
│   │   │   └── ...
│   │   ├── services/
│   │   │   ├── push.js          # Expo push notifications
│   │   │   └── capsule.js       # AI capsule generation
│   │   └── server.js
│   └── package.json
├── mobile/
│   ├── src/
│   │   ├── components/
│   │   │   ├── SugarbumLogo.js  # NEW - Logo SVG
│   │   │   ├── TabBarIcons.js   # NEW - Tab icons
│   │   │   └── ...
│   │   ├── screens/
│   │   ├── theme/
│   │   │   └── colors.js        # UPDATED - Logo colors
│   │   └── config/
│   │       └── api.js           # FIXED - Syntax error
│   └── App.js                   # UPDATED - New icons
├── docs/
│   ├── NEXT_STEPS.md
│   └── design/
└── README.md
```

---

## Development Workflow

### Starting the Backend
```bash
cd backend
npm install
npm run migrate    # Create tables
npm start          # Port 3000 (default)
```

### Starting Mobile
```bash
cd mobile
npm install
npm start          # Opens Expo DevTools
```

### Testing
```bash
# Backend health
curl http://localhost:3000/health

# Full system test
cd backend && node verify-full-flow.js
```

---

## Key Technical Details

### Database Adapter
- Detects `DATABASE_URL` env var for PostgreSQL
- Falls back to SQLite (`bubbles.db`) for local dev
- Handles SQLite quirks (no RETURNING, no SERIAL)

### API Configuration
```javascript
// Mobile connects to Railway by default
return 'https://sugarbum-backend-production.up.railway.app/api';
```

### Logo Colors (for consistency)
```javascript
logoPink: '#D4A5A5'    // Left bum
logoGreen: '#8FAF8F'   // Right bum
logoHeart: '#E55050'   // Heart
logoNavy: '#191938'    // Background
```

---

## Known Issues & Fixes

### Fixed Issues
1. **API.js Syntax Error** - Removed unreachable code causing Expo white screen
2. **SQLite RETURNING Handler** - Dynamic table name extraction
3. **Firebase Null Handling** - Conditional field inclusion

### Current Limitations
- Background location requires native build (not Expo Go)
- Spotify OAuth needs app store deployment for production
- Firebase real-time optional (REST API works independently)

---

## For Future AI Agents

1. **Always test after changes** - Run `node verify-full-flow.js`
2. **Commit frequently** - Descriptive messages
3. **Update this document** when architecture changes
4. **Use Sugarbum branding** - Not "Bubbles" in user-facing text
5. **Logo SVG components** - Use `SugarbumLogo` and `SugarbumIcon`
6. **Push to git** before ending session

---

**Sugarbum** - Be together, apart
