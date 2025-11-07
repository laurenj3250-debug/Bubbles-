# 🫧 Bubbles Mobile App

React Native mobile app for Bubbles couples context-sharing platform.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start Expo development server
npm start

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android
```

## 📱 App Structure

```
mobile/
├── App.js                 # Root component with navigation
├── app.json              # Expo configuration
├── src/
│   ├── screens/         # UI screens
│   │   ├── LoginScreen.js
│   │   ├── RegisterScreen.js
│   │   ├── HomeScreen.js
│   │   ├── PartnerScreen.js
│   │   ├── SettingsScreen.js
│   │   └── PrivacyScreen.js
│   ├── context/
│   │   └── AuthContext.js  # Auth state management
│   └── config/
│       └── api.js          # API client configuration
└── package.json
```

## 🔧 Configuration

### API URL

Update the backend API URL in `src/config/api.js`:

```javascript
const API_URL = __DEV__
  ? 'http://localhost:3000/api'           // Development
  : 'https://your-app.railway.app/api';   // Production
```

For development on physical device, use your computer's local IP:

```javascript
const API_URL = 'http://192.168.1.x:3000/api';
```

### Permissions

The app requires several permissions configured in `app.json`:

**iOS:**
- Location (Always & When In Use)
- Motion & Fitness
- HealthKit
- Calendar
- Background Location

**Android:**
- ACCESS_FINE_LOCATION
- ACCESS_BACKGROUND_LOCATION
- ACTIVITY_RECOGNITION
- READ_CALENDAR

## 📦 Dependencies

### Core
- `expo` - React Native framework
- `react-navigation` - Navigation library
- `axios` - HTTP client
- `@react-native-async-storage/async-storage` - Local storage

### Expo Modules
- `expo-location` - Location services
- `expo-notifications` - Push notifications
- `expo-task-manager` - Background tasks
- `expo-calendar` - Calendar access
- `expo-battery` - Battery info
- `expo-auth-session` - OAuth flows
- `expo-secure-store` - Secure token storage

## 🎨 Screens

### Authentication
- **LoginScreen**: Email/password login
- **RegisterScreen**: Create new account

### Main App (Tab Navigation)
- **HomeScreen**: View partner's signals (location, activity, music, device)
- **PartnerScreen**: Send/accept partner requests, manage connection
- **SettingsScreen**: Account settings, connected services, about

### Modal Screens
- **PrivacyScreen**: Manage sharing preferences, pause/resume sharing

## 🔐 Authentication Flow

1. User logs in or registers
2. Backend returns JWT token
3. Token stored in AsyncStorage
4. Token added to all API requests via Axios interceptor
5. On 401 error, user logged out automatically

## 📡 API Integration

All API calls go through the `api` client in `src/config/api.js`:

```javascript
import api from '../config/api';

// Example: Get partner's signals
const response = await api.get('/signals/partner/all');
```

The API client automatically:
- Adds JWT token to requests
- Handles token expiration
- Provides error handling

## 🎨 Theming

Colors:
- Primary: `#8B5CF6` (Purple)
- Background: `#F9FAFB` (Light Gray)
- Card: `#FFFFFF` (White)
- Text: `#111827` (Dark Gray)
- Secondary Text: `#6B7280` (Gray)

## 🚧 Future Features

### Phase 2: Location & Weather
- [ ] Request location permissions
- [ ] Manual location share button
- [ ] Fetch weather from OpenWeatherMap
- [ ] Display location + weather card

### Phase 3: Background Services
- [ ] Background location tracking
- [ ] Geofencing setup
- [ ] Push notification handling
- [ ] Periodic signal updates

### Phase 4: Integrations
- [ ] Spotify OAuth flow
- [ ] HealthKit data fetching (iOS)
- [ ] Google Fit integration (Android)
- [ ] Calendar event reading

### Phase 5: Advanced Features
- [ ] Apple Watch complications
- [ ] Android home screen widgets
- [ ] Photo sharing
- [ ] Voice notes
- [ ] Customizable check-in times

## 🧪 Testing

### Test on Physical Device

1. Install Expo Go app from App Store / Play Store
2. Run `npm start`
3. Scan QR code with Expo Go

### Test on Simulator/Emulator

```bash
# iOS (requires Xcode)
npm run ios

# Android (requires Android Studio)
npm run android
```

## 📱 Building for Production

### Prerequisites
- Expo account: https://expo.dev/
- Install EAS CLI: `npm install -g eas-cli`

### Build Commands

```bash
# Login to Expo
eas login

# Configure project
eas build:configure

# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android

# Build for both
eas build --platform all
```

### Submit to App Stores

```bash
# Submit to App Store
eas submit --platform ios

# Submit to Play Store
eas submit --platform android
```

See [Expo EAS Build docs](https://docs.expo.dev/build/introduction/) for more details.

## 🐛 Troubleshooting

### "Network request failed"
- Check that backend is running
- Verify API_URL in `src/config/api.js`
- For physical device, use local IP instead of `localhost`

### "Cannot connect to Metro"
- Run `expo start --clear` to clear cache
- Check that port 19000-19001 are not in use

### Location permissions not working
- Ensure `expo-location` is installed
- Check permissions in `app.json`
- Request permissions at runtime

### App crashes on startup
- Run `npm install` to ensure dependencies are installed
- Clear cache: `expo start --clear`
- Check for any missing imports

## 📚 Resources

- [React Native Docs](https://reactnative.dev/)
- [Expo Docs](https://docs.expo.dev/)
- [React Navigation](https://reactnavigation.org/)
- [Expo Location](https://docs.expo.dev/versions/latest/sdk/location/)
- [Expo Notifications](https://docs.expo.dev/versions/latest/sdk/notifications/)

## 📝 License

MIT
