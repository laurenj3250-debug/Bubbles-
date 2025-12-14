# Sugarbum - Next Steps & Roadmap

> "Be together, apart" - A couples context-sharing app

**Last Updated:** December 14, 2025
**Current Status:** MVP Functional - Ready for Testing

---

## What's Working Now

### Core Features
- [x] User authentication (register, login, JWT)
- [x] Partner invitation system (email-based)
- [x] Location sharing with weather data
- [x] "Miss You" button with push notifications
- [x] Privacy pause controls
- [x] Daily capsules (AI-generated summaries)
- [x] Admin panel for debugging

### UI/Branding
- [x] Sugarbum logo (SVG component)
- [x] Themed tab bar icons
- [x] "Be together, apart" tagline
- [x] Consistent color scheme

### Infrastructure
- [x] Railway backend deployment
- [x] PostgreSQL database (production)
- [x] SQLite support (local development)
- [x] Expo SDK 53 compatibility

---

## Immediate Next Steps (Priority 1)

### 1. Test on Physical Devices
**Why:** Verify the Expo connectivity fix works on real phones

**Steps:**
1. Install Expo Go on iOS/Android
2. Run `cd mobile && npm start`
3. Scan QR code with Expo Go
4. Test login, registration, partner features
5. Verify no white screen issues

### 2. Generate Production App Icons
**Why:** The current icons use the old design; need Sugarbum logo

**Steps:**
1. Export SugarbumLogo as PNG at various sizes:
   - 1024x1024 (App Store)
   - 512x512 (Play Store)
   - 192x192 (adaptive-icon)
   - 48x48 (notification icon)
2. Replace `mobile/assets/icon.png`, `splash.png`, `adaptive-icon.png`
3. Update `app.json` splash background to `#191938`

### 3. Test Partner Flow End-to-End
**Why:** Core feature needs validation

**Steps:**
1. Create two test accounts
2. Send partner request from Account A
3. Accept request on Account B
4. Verify both see each other's status
5. Test "Miss You" notification delivery

---

## Short-Term Improvements (Priority 2)

### 4. Add Onboarding Flow
**Why:** New users need guidance

**Implementation:**
- Create `OnboardingScreen.js` with 3-4 slides
- Explain core features (location, miss you, capsules)
- Request permissions during onboarding
- Store `hasOnboarded` in AsyncStorage

### 5. Enhance Home Screen
**Why:** Current home screen could show more partner context

**Add:**
- Partner's current weather
- Time in partner's timezone
- Last activity timestamp
- Quick action buttons (call, message)

### 6. Implement Haptic Feedback
**Why:** Physical feedback improves UX

**Where:**
- "Miss You" button press
- Tab bar icon selection
- Pull to refresh
- Success/error states

```javascript
import * as Haptics from 'expo-haptics';
Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
```

---

## Medium-Term Features (Priority 3)

### 7. Real-Time Updates with Firebase
**Why:** Currently uses polling; real-time is better UX

**Implementation:**
- Already have Firebase config files
- Add listeners for partner status changes
- Update HomeScreen to subscribe on mount
- Unsubscribe on unmount

### 8. Spotify Integration
**Why:** See what partner is listening to

**Status:** Backend routes exist (`/api/spotify/*`)

**TODO:**
- Create Spotify OAuth screen in mobile
- Handle token refresh
- Display "Now Playing" card
- Add "Listen Along" deep link

### 9. Background Location Tracking
**Why:** Share location without opening app

**Note:** Requires native build (not Expo Go)

**Implementation:**
- Use `expo-task-manager` (already installed)
- Configure geofencing for common places
- Add notification for background tracking
- Respect privacy pause settings

---

## Long-Term Vision (Priority 4)

### 10. Distance Destroyer Game
**Why:** Gamification increases engagement

**Concept:**
- Virtual journey between partners
- Steps/workouts = travel distance
- Meet in the middle = celebration
- Weekly resets with stats

### 11. Streak Tracking
**Why:** Build daily habits

**Streaks:**
- Good morning messages
- Daily capsule opened
- Photos shared
- Miss you sent

### 12. Yearly Wrapped
**Why:** Spotify-style annual recap

**Include:**
- Total messages/photos
- Most active months
- Favorite songs
- Combined achievements

---

## Technical Debt

### Code Quality
- [ ] Add TypeScript (gradual migration)
- [ ] Add ESLint configuration
- [ ] Add unit tests for critical paths
- [ ] Add E2E tests with Detox

### Performance
- [ ] Implement image caching
- [ ] Add skeleton loading states
- [ ] Optimize re-renders with useMemo
- [ ] Add offline support

### Security
- [ ] Audit JWT expiration (currently 30 days)
- [ ] Add rate limiting per user
- [ ] Review SQL injection protection
- [ ] Add request validation

---

## My Suggestions

### Quick Wins (1-2 hours each)
1. **Add loading skeletons** - Better perceived performance
2. **Implement pull-to-refresh** - Standard mobile pattern
3. **Add error boundaries** - Graceful error handling
4. **Create "About" screen** - App info, version, credits

### High Impact (1-2 days each)
1. **Voice notes** - Quick audio messages between partners
2. **Photo sharing** - Share moments easily
3. **Countdown timers** - "Days until we meet"
4. **Customizable widgets** - iOS/Android home screen

### Differentiators (1+ weeks)
1. **AI relationship insights** - Patterns in communication
2. **Shared playlists** - Auto-generated from both tastes
3. **Virtual date ideas** - Suggestions based on interests
4. **Mood tracking** - Emotional context sharing

---

## Development Commands

```bash
# Start everything
cd backend && npm start &
cd mobile && npm start

# Test backend
curl http://localhost:3000/health
cd backend && node verify-full-flow.js

# Build for production
cd mobile && eas build --platform all

# Deploy backend
git push origin main  # Railway auto-deploys
```

---

## Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Navigation](https://reactnavigation.org/)
- [Railway Deployment](https://railway.app/)
- [Sugarbum Design System](./design/sugarbum-design-system.md)

---

**Sugarbum** - Be together, apart
