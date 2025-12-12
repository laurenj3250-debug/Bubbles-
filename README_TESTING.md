# 🧪 Testing Bubbles - Quick Start Guide

**Everything you need to test the Bubbles application.**

---

## 🚀 Super Quick Start (2 minutes)

### Option 1: Automated Testing

```bash
# From project root
./test-all.sh
```

This will:
- ✅ Start the backend automatically
- ✅ Run all API tests
- ✅ Show you next steps
- ✅ Clean up when done

### Option 2: Manual Testing

```bash
# Terminal 1: Start backend
cd backend && npm start

# Terminal 2: Start web app
cd mobile && npm run web

# Terminal 3: Check status
./check-status.sh
```

---

## 📋 Testing Scripts

| Script | Purpose | Usage |
|--------|---------|-------|
| `./test-all.sh` | Complete automated test suite | Recommended first test |
| `./test-api.sh` | API endpoint tests only | Quick backend verification |
| `./check-status.sh` | System health check | See what's running |

---

## 🎯 What to Test

### 1. Backend API ✅
**Start:** `cd backend && npm start`

**Quick Test:**
```bash
curl http://localhost:3000/health
```

**Expected:** `{"status":"healthy","database":"connected",...}`

### 2. Web Application 🌐
**Start:** `cd mobile && npm run web`

**URL:** `http://localhost:19006`

**Test:**
- ✅ No console errors
- ✅ Register a user
- ✅ Login
- ✅ Click all buttons (no crashes)

### 3. Admin Panel 🔐
**URL:** `http://localhost:3000/admin.html`

**Credentials:**
- Username: `admin`
- Password: `admin123`

**Test:**
- ✅ View database tables
- ✅ Run SQL queries
- ✅ Check statistics

---

## ✅ Feature Testing Checklist

Copy this checklist and mark off as you test:

```
[ ] Backend starts successfully
[ ] Web app loads without errors
[ ] User registration works
[ ] User login works
[ ] Partner request can be sent
[ ] Partner request can be accepted
[ ] Location sharing works
[ ] "Miss You" button works
[ ] Privacy settings toggle
[ ] Capsule screen loads
[ ] Admin panel accessible
[ ] No security vulnerabilities found
```

---

## 🔍 Detailed Testing

See **[TESTING_GUIDE.md](./TESTING_GUIDE.md)** for:
- Complete feature tests
- Security testing
- Performance testing
- Cross-platform testing
- Troubleshooting guide

---

## 🐛 Common Issues

### "Cannot connect to server"
**Fix:** Make sure backend is running on port 3000
```bash
cd backend && npm start
```

### "Module not found" errors
**Fix:** Install dependencies
```bash
cd backend && npm install
cd mobile && npm install
```

### "Firebase config missing" warning
**Fix:** This is expected for local dev. Real-time features use fallback config.

### "Admin password incorrect"
**Fix:** Default is `admin123`. Set `ADMIN_PASSWORD` in `.env` if changed.

---

## 📊 Test Results

After running tests, check:

1. **Console Output** - All tests should show `✓ PASS`
2. **Browser Console** - No errors related to Vibration, Haptics, or useNativeDriver
3. **Network Tab** - API calls returning 200/201 (except auth failures which should be 401)

---

## 🎨 Visual Testing

The app should look like this:

**Web Version:**
- Smooth blob animations in background
- Clean, minimal interface
- Responsive buttons with hover effects
- No layout issues

**Mobile Version:**
- Haptic feedback on button press
- Smooth animations
- Native look and feel

---

## 🌐 Platform Support

| Platform | Status | Notes |
|----------|--------|-------|
| **Web** | ✅ Fully Working | All features except haptics |
| **iOS** | ✅ Ready to Test | Requires Xcode |
| **Android** | ✅ Ready to Test | Requires Android Studio |

---

## 🔒 Security Checklist

Test these to verify security:

```bash
# 1. Try to access protected route without auth (should fail)
curl http://localhost:3000/api/partners/current
# Expected: {"error":"No token provided"}

# 2. Try SQL injection (should be blocked)
curl -u admin:admin123 "http://localhost:3000/api/admin/table/users;DROP"
# Expected: {"error":"Invalid table name format"}

# 3. Check CORS (should only allow configured origins in production)
curl -H "Origin: https://evil.com" http://localhost:3000/api/auth/me
# Expected: CORS error
```

---

## 📝 Reporting Issues

If you find bugs:

1. **Check status first:**
   ```bash
   ./check-status.sh
   ```

2. **Check logs:**
   ```bash
   # Backend logs
   tail -f /tmp/bubbles-backend.log

   # Or in backend terminal output
   ```

3. **Note:**
   - What you were doing
   - What happened
   - What you expected
   - Browser/Platform
   - Console errors

---

## 🎉 Success Criteria

**Your app is working if:**

✅ Backend starts without errors
✅ Web loads without crashes
✅ You can register & login
✅ Partner linking works
✅ Location can be shared
✅ Admin panel is accessible
✅ No console errors on web
✅ All animations are smooth

---

## 🚀 Next Steps

Once testing is complete:

1. **Deploy Backend** - Railway, Heroku, etc.
2. **Deploy Web** - Netlify, Vercel, etc.
3. **Build Mobile** - Expo EAS Build
4. **Configure Firebase** - For production real-time features
5. **Set Environment Variables** - Production secrets

---

## 📚 Additional Resources

- **Full Testing Guide:** [TESTING_GUIDE.md](./TESTING_GUIDE.md)
- **Admin Panel:** http://localhost:3000/admin.html
- **API Docs:** See backend/src/routes/ for all endpoints
- **Mobile README:** mobile/README.md

---

## 💡 Pro Tips

1. **Use check-status.sh** - Run it anytime to see what's working
2. **Test incrementally** - Don't try to test everything at once
3. **Check browser console** - F12 in browser shows errors
4. **Use admin panel** - Great for debugging database issues
5. **Read the logs** - Backend logs show what's happening server-side

---

**Happy Testing! 🎉**

Questions? Check the detailed [TESTING_GUIDE.md](./TESTING_GUIDE.md) or review the code in `backend/src/` and `mobile/src/`.
