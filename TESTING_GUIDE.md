# 🧪 Bubbles Testing Guide

Complete testing guide for all features and platforms.

## 📋 Quick Start Testing

### 1. Backend Server Test

```bash
cd /home/user/Bubbles-/backend
npm install  # If not already installed
npm start
```

**Expected Output:**
```
🔥 Firebase Admin SDK initialized successfully
✅ Database connected (SQLite/PostgreSQL)
🚀 Server running on port 3000
```

**Quick Health Check:**
```bash
curl http://localhost:3000/health
```

Should return:
```json
{
  "status": "healthy",
  "database": "connected",
  "timestamp": "2025-12-12T..."
}
```

---

### 2. Web Version Test

```bash
cd /home/user/Bubbles-/mobile
npm install  # If not already installed
npm run web
```

**Expected:** Browser opens to `http://localhost:19006`

**What to Check:**
- ✅ No console errors related to Vibration, Haptics, or useNativeDriver
- ✅ Login/Register screens render
- ✅ Animations work smoothly
- ✅ All buttons clickable
- ✅ Forms functional

---

### 3. Admin Panel Test

**Open:** `http://localhost:3000/admin.html`

**⚠️ SECURITY WARNING:**
The default credentials below are for **LOCAL TESTING ONLY** and MUST be changed in production!
Set `ADMIN_PASSWORD` environment variable to use a secure password.

**Login:**
- Username: `admin`
- Password: `admin123` (default - **CHANGE IN PRODUCTION!**)
- Or use your custom `ADMIN_PASSWORD` from .env

**What to Test:**
1. Dashboard loads with stats
2. Click on table names (users, partnerships, etc.)
3. View table data
4. Run custom query: `SELECT * FROM users LIMIT 5`
5. Check health status tab

---

## 🎯 Feature Testing Checklist

### Authentication & Registration

#### Test 1: User Registration
**On Web or Mobile:**

1. Navigate to Register screen
2. Fill in:
   - Name: "Test User 1"
   - Email: "test1@example.com"
   - Phone: "1234567890" (optional)
   - Password: "password123"
   - Confirm: "password123"
3. Click "Create Account"

**Expected:**
- ✅ Registration succeeds
- ✅ Auto-login and redirect to Home screen
- ✅ "No Partner Yet" message displayed

**Verify in Admin Panel:**
```sql
SELECT * FROM users WHERE email = 'test1@example.com'
```

#### Test 2: User Login
1. Log out (Settings → Logout)
2. Return to Login screen
3. Enter: `test1@example.com` / `password123`
4. Click "Login"

**Expected:**
- ✅ Login succeeds
- ✅ Redirects to Home screen

---

### Partner Linking

#### Test 3: Create Second User & Link Partners

**In New Browser/Incognito Tab:**

1. Register second user:
   - Email: "test2@example.com"
   - Password: "password123"
2. Go to Partner screen
3. Click "Send Partner Request"
4. Enter: `test1@example.com`
5. Click Send

**In First Tab (test1):**
6. Refresh Partner screen
7. See pending request from test2
8. Click "Accept"

**Expected:**
- ✅ Partnership status: "accepted"
- ✅ Both users now see partner info
- ✅ Real-time features enabled

**Verify in Admin Panel:**
```sql
SELECT * FROM partnerships WHERE status = 'accepted'
```

---

### Real-Time Features (Requires Partner)

#### Test 4: Location Sharing

**Prerequisites:** Both users linked as partners

1. User 1: Click "Share My Location" on Home screen
2. Grant location permission (if mobile)
3. Wait for success message

**Expected:**
- ✅ Success alert: "Location Shared"
- ✅ Location stored in database

**Verify:**
```sql
SELECT * FROM location_signals ORDER BY created_at DESC LIMIT 1
```

**In User 2's Browser/App:**
- Refresh Home screen
- Should see partner's location signal (if Firebase connected)

#### Test 5: "Miss You" Love Bomb

**User 1:**
1. Click "Send Miss You" button
2. Confirm send

**User 2 (must be on Home screen):**
- ✅ Love bomb overlay appears (💖 animation)
- ✅ Haptic feedback (mobile only)
- ✅ Auto-dismisses after 4 seconds

**Verify:**
```sql
-- No DB entry, this is Firebase real-time only
-- Check Firebase console or logs
```

#### Test 6: Digital Touch

**User 1:**
1. Click 👆 icon to enable Touch Mode
2. Touch/drag on screen

**User 2 (on Home screen with Firebase):**
- Should see partner's touch position in real-time
- When touches overlap, "spark" animation

**Note:** Requires Firebase Realtime Database to be configured

---

### Firebase Configuration Test

#### Check Firebase Status

**Mobile App Console:**
Look for: `✅ Firebase initialized successfully`

**If you see:** `Firebase config missing!`

**Fix:**
```bash
cd /home/user/Bubbles-/mobile
```

Create `.env` file:
```bash
EXPO_PUBLIC_FIREBASE_API_KEY=your-api-key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=sugarbum-d19a8.firebaseapp.com
EXPO_PUBLIC_FIREBASE_DATABASE_URL=https://sugarbum-d19a8-default-rtdb.firebaseio.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=sugarbum-d19a8
```

Or use defaults (already set in code).

---

### Privacy Settings

#### Test 7: Privacy Controls

1. Go to Settings screen
2. Toggle privacy switches:
   - Share Location
   - Share Activity
   - Share Music
   - Share Device Context
3. Turn all OFF
4. Partner should not receive signals

**Verify:**
```sql
SELECT * FROM privacy_settings WHERE user_id = 1
```

---

### Capsules (Daily Summary)

#### Test 8: Capsule Generation

**Trigger capsule (manual):**

```bash
cd /home/user/Bubbles-/backend
node -e "
const { generateCapsule } = require('./src/services/capsule');
generateCapsule(1, '2025-12-12').then(console.log);
"
```

**Or via UI:**
1. Navigate to Capsule screen (💊 icon)
2. Should show "No capsule yet" or generated capsule

**Expected:**
- Summary of shared moments
- Stats (locations, activities, etc.)
- Highlights

---

## 🌐 Cross-Platform Testing

### Web-Specific Tests

**Open:** `http://localhost:19006`

#### ✅ Check Console for Errors
Open DevTools (F12) → Console

**Should NOT see:**
- ❌ "Vibration is not defined"
- ❌ "expo-haptics not found"
- ❌ "useNativeDriver is not supported"

**Should see:**
- ✅ Clean console or only expected warnings
- ✅ All animations render smoothly

#### ✅ Test Buttons Without Crashes
Click every button:
- Login
- Register
- Share Location
- Send Miss You
- Settings toggles

**Expected:** No crashes, smooth operation

#### ✅ Test Animations
- Love bomb overlay (if triggered)
- Blob animations in background
- Smooth transitions

---

### Mobile-Specific Tests

**iOS/Android:**

```bash
cd /home/user/Bubbles-/mobile
npm run ios     # or
npm run android
```

#### ✅ Haptic Feedback
- Tap any button → Feel vibration
- "Miss You" received → Heartbeat pattern vibration

#### ✅ Location Services
- Request permission → System prompt appears
- Share location → Accurate GPS coordinates
- Background tracking (if enabled)

#### ✅ Push Notifications
- Register device for notifications
- Receive notification when partner sends signal

---

## 🔒 Security Testing

### Test 9: Authentication Bypass Attempts

**Try accessing protected endpoints without auth:**

```bash
# Should fail with 401
curl http://localhost:3000/api/partners/current

# Should fail with 401
curl http://localhost:3000/api/signals/partner/all
```

**Expected:** `{"error":"No token provided"}` or `401 Unauthorized`

### Test 10: SQL Injection Prevention

**Try malicious table name:**

```bash
# Note: Uses default credentials for local testing
# Set BUBBLES_TEST_ADMIN_USER and BUBBLES_TEST_ADMIN_PASSWORD for custom credentials
curl -u admin:admin123 \
  "http://localhost:3000/api/admin/table/users;DROP%20TABLE%20users"
```

**Expected:** `{"error":"Invalid table name format"}`

**⚠️ Security Note:** The credentials shown here are default test credentials.
Always use strong, unique credentials in production environments!

### Test 11: CORS Protection

**From unauthorized origin:**

```bash
curl -H "Origin: https://evil.com" \
  http://localhost:3000/api/auth/me
```

**Expected:** CORS error or blocked (in production with `FRONTEND_URL` set)

---

## 🐛 Error Handling Tests

### Test 12: Network Error Handling

**Simulate offline:**
1. Stop backend server
2. In app, try to share location
3. Click "Retry" button

**Expected:**
- ✅ Error banner appears
- ✅ Clear error message
- ✅ Retry button functional
- ✅ App doesn't crash

### Test 13: Invalid JSON Handling

**Manually corrupt data in SQLite:**

```bash
cd /home/user/Bubbles-/backend
sqlite3 bubbles.db
```

```sql
-- Create capsule with invalid JSON
INSERT INTO capsules (partnership_id, date, content)
VALUES (1, '2025-12-12', 'INVALID{JSON}');
```

**Then in app:** Navigate to Capsule screen

**Expected:**
- ✅ No crash
- ✅ Graceful handling (content shows as null)

---

## 📊 Performance Tests

### Test 14: Cache Performance

**Generate 150 capsules to test cache cleanup:**

```bash
cd /home/user/Bubbles-/backend
node -e "
const { generateCapsule } = require('./src/services/capsule');
async function test() {
  for (let i = 0; i < 150; i++) {
    await generateCapsule(1, '2025-12-' + (i % 30 + 1));
  }
}
test();
"
```

**Expected:**
- ✅ Cache cleans up automatically
- ✅ No memory leak
- ✅ Server remains responsive

---

## 🎨 UI/UX Tests

### Test 15: Animation Smoothness

1. Navigate through all screens
2. Trigger animations:
   - Blob backgrounds (auto-animate)
   - Love bomb overlay
   - Button press feedback
   - Touch overlay

**Expected:**
- ✅ Smooth 60fps animations
- ✅ No jank or stuttering
- ✅ Transitions feel natural

### Test 16: Responsive Design

**Test different screen sizes:**
- Mobile: 375px width
- Tablet: 768px width
- Desktop: 1920px width

**Expected:**
- ✅ UI adapts gracefully
- ✅ All elements visible
- ✅ No overlapping content

---

## ✅ Final Verification Checklist

### Backend
- [ ] Server starts without errors
- [ ] Database connects (SQLite or PostgreSQL)
- [ ] Firebase initializes (or gracefully skips)
- [ ] All API endpoints respond
- [ ] Admin panel accessible
- [ ] No password logging in console

### Web
- [ ] App loads without crashes
- [ ] No Vibration/Haptics errors
- [ ] Animations work smoothly
- [ ] All forms functional
- [ ] Can register and login

### Mobile (if testing)
- [ ] App installs successfully
- [ ] Haptic feedback works
- [ ] Location permission flow
- [ ] Push notifications register
- [ ] All real-time features work

### Features
- [ ] User registration/login
- [ ] Partner linking
- [ ] Location sharing
- [ ] "Miss You" feature
- [ ] Digital touch
- [ ] Privacy settings
- [ ] Capsule generation
- [ ] Error states with retry

### Security
- [ ] Protected routes require auth
- [ ] SQL injection prevented
- [ ] CORS configured correctly
- [ ] Admin password not logged
- [ ] No sensitive data exposed

---

## 🚨 Common Issues & Fixes

### Issue: "Firebase config missing"
**Fix:** Add fallback values already in code, or set `EXPO_PUBLIC_FIREBASE_*` env vars

### Issue: "Cannot find module 'expo-haptics'"
**Fix:** Already fixed with Platform guards + dynamic require

### Issue: "useNativeDriver is not supported"
**Fix:** Already fixed with `Platform.OS !== 'web'` checks

### Issue: Database connection error
**Fix:** Check `DATABASE_URL` env var, or delete `bubbles.db` and restart

### Issue: CORS errors
**Fix:** Set `FRONTEND_URL=http://localhost:19006` in backend .env

---

## 🎯 Quick Smoke Test (5 minutes)

Run this minimal test to verify everything works:

```bash
# Terminal 1: Start backend
cd /home/user/Bubbles-/backend && npm start

# Terminal 2: Start web app
cd /home/user/Bubbles-/mobile && npm run web
```

**Then:**
1. ✅ Backend console shows no errors
2. ✅ Web opens without console errors
3. ✅ Register a test user
4. ✅ Login works
5. ✅ Click buttons (no crashes)
6. ✅ Open admin panel at `/admin.html`

**If all ✅ → You're ready to go!** 🎉

---

## 📝 Test Results Template

Use this to track your testing:

```
## Test Session: 2025-12-12

### Environment
- Platform: Web / iOS / Android
- Node: v22.21.1
- Database: SQLite / PostgreSQL

### Results
- [ ] Backend starts: PASS / FAIL
- [ ] Web loads: PASS / FAIL
- [ ] Registration: PASS / FAIL
- [ ] Login: PASS / FAIL
- [ ] Partner linking: PASS / FAIL
- [ ] Location sharing: PASS / FAIL
- [ ] Love bomb: PASS / FAIL
- [ ] Admin panel: PASS / FAIL

### Issues Found
1. [Description]
2. [Description]

### Notes
[Any observations]
```

---

**Ready to test?** Start with the Quick Smoke Test, then dive into specific features! 🚀
