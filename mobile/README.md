# Sugarbum Mobile App

> "Be together, apart" - A couples context-sharing app built with React Native (Expo)

## Quick Start

```bash
# Install dependencies
npm install

# Start Expo development server
npm start

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android

# Run on web
npm run web
```

## App Structure

```
mobile/
├── App.js                      # Root component with navigation
├── app.json                    # Expo configuration
├── assets/
│   ├── icon.png               # App icon
│   ├── splash.png             # Splash screen
│   ├── adaptive-icon.png      # Android adaptive icon
│   └── icons/                 # UI icons
├── src/
│   ├── components/
│   │   ├── SugarbumLogo.js    # SVG logo component
│   │   ├── TabBarIcons.js     # Themed tab bar icons
│   │   ├── BlobCard.js        # Animated card component
│   │   ├── GentleButton.js    # Themed button
│   │   ├── WavePattern.js     # Background pattern
│   │   ├── StatusAvatar.js    # Partner status avatar
│   │   └── index.js           # Component exports
│   ├── screens/
│   │   ├── LoginScreen.js     # Login with Sugarbum branding
│   │   ├── RegisterScreen.js  # Registration flow
│   │   ├── HomeScreen.js      # Main dashboard
│   │   ├── PartnerScreen.js   # Partner management
│   │   ├── SettingsScreen.js  # App settings
│   │   ├── PrivacyScreen.js   # Privacy controls
│   │   └── CapsuleScreen.js   # Daily capsules
│   ├── theme/
│   │   ├── colors.js          # Sugarbum color palette
│   │   ├── typography.js      # Font styles
│   │   ├── spacing.js         # Layout spacing
│   │   └── index.js           # Theme export
│   ├── context/
│   │   └── AuthContext.js     # Auth state management
│   ├── hooks/
│   │   └── usePartnerSignals.js
│   ├── services/
│   │   ├── notifications.js   # Push notifications
│   │   ├── LocationService.js # Location tracking
│   │   └── LocationTask.js    # Background location
│   └── config/
│       ├── api.js             # API client
│       └── firebase.js        # Firebase config
└── package.json
```

## Sugarbum Design System

### Brand Colors

```javascript
// Logo Colors
logoPink: '#D4A5A5'    // Left bum (dusty rose)
logoGreen: '#8FAF8F'   // Right bum (sage green)
logoHeart: '#E55050'   // Heart (red)
logoNavy: '#191938'    // Background (deep navy)

// Primary Colors
primary: '#8B5CF6'     // Main purple
dustyRose: '#D4A5A5'   // Muted rose
sageGreen: '#8FAF8F'   // Sage green
cream: '#FAF8F5'       // Background

// Accent Colors
teal: '#4A9B8E'        // Location/movement
lavender: '#B5A9D8'    // Rest states
warmYellow: '#E5C185'  // Weather/energy
```

### Logo Component

```javascript
import { SugarbumLogo, SugarbumIcon } from './src/components';

// Full logo with wifi signals
<SugarbumLogo size={180} showSignals={true} />

// Compact icon version
<SugarbumIcon size={48} />
```

### Tab Bar Icons

```javascript
import { HomeIcon, PartnerIcon, SettingsIcon } from './src/components';

// Usage in tab navigator
tabBarIcon: ({ color, focused }) => (
  <HomeIcon size={24} color={color} focused={focused} />
)
```

## Configuration

### API URL

The app connects to the Railway-hosted backend by default. Update `src/config/api.js` if needed:

```javascript
// Production (default)
return 'https://sugarbum-backend-production.up.railway.app/api';

// Local development
return 'http://localhost:3000/api';
```

### Permissions (app.json)

**iOS:**
- Location (Always & When In Use)
- Background Location
- Push Notifications

**Android:**
- ACCESS_FINE_LOCATION
- ACCESS_BACKGROUND_LOCATION
- FOREGROUND_SERVICE

## Key Features

### Authentication
- JWT-based login/registration
- Secure token storage with AsyncStorage
- Automatic token refresh

### Partner System
- Email-based partner invites
- Real-time connection status
- "Miss You" button with notifications

### Location Sharing
- Optional location sharing
- Weather integration at partner's location
- Privacy pause controls

### Daily Capsules
- AI-generated relationship summaries
- Photo highlights
- Sync moments detection

## Building for Production

### Prerequisites
- Expo account: https://expo.dev/
- EAS CLI: `npm install -g eas-cli`

### Build Commands

```bash
# Login to Expo
eas login

# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android

# Submit to stores
eas submit --platform ios
eas submit --platform android
```

## Troubleshooting

### "Network request failed"
- Check backend is running
- Verify API_URL in `src/config/api.js`
- For physical device, ensure same network

### "White screen after QR scan"
- Fixed in latest version (api.js syntax error)
- Run `npm start --clear` to clear cache

### Metro bundler issues
- Clear cache: `npx expo start --clear`
- Delete node_modules and reinstall

## Resources

- [Expo Docs](https://docs.expo.dev/)
- [React Navigation](https://reactnavigation.org/)
- [React Native SVG](https://github.com/software-mansion/react-native-svg)

---

**Sugarbum** - Be together, apart
