import { Platform } from 'react-native';

/**
 * Platform Guards - Utility for checking feature availability across platforms
 * Helps gracefully degrade native features when running on web
 */

export const PlatformFeatures = {
    LOCATION: 'location',
    CALENDAR: 'calendar',
    HEALTH: 'health',
    NOTIFICATIONS: 'notifications',
    CONTACTS: 'contacts',
    CAMERA: 'camera',
    MEDIA_LIBRARY: 'media_library',
    BACKGROUND_TASKS: 'background_tasks',
};

/**
 * Check if a specific feature is available on the current platform
 * @param {string} feature - Feature to check from PlatformFeatures
 * @returns {boolean} - True if feature is available
 */
export const isFeatureAvailable = (feature) => {
    // On web, only certain features are available
    if (Platform.OS === 'web') {
        switch (feature) {
            case PlatformFeatures.LOCATION:
                return typeof navigator !== 'undefined' && !!navigator.geolocation;
            case PlatformFeatures.CAMERA:
            case PlatformFeatures.MEDIA_LIBRARY:
                // File input available on web
                return true;
            case PlatformFeatures.CALENDAR:
            case PlatformFeatures.HEALTH:
            case PlatformFeatures.NOTIFICATIONS:
            case PlatformFeatures.CONTACTS:
            case PlatformFeatures.BACKGROUND_TASKS:
                // These require native APIs
                return false;
            default:
                return false;
        }
    }

    // On native platforms (iOS/Android), all features are available
    return true;
};

/**
 * Get a user-friendly message for unavailable features
 * @param {string} feature - Feature that's unavailable
 * @returns {string} - User-friendly message
 */
export const getFeatureUnavailableMessage = (feature) => {
    const featureNames = {
        [PlatformFeatures.LOCATION]: 'Location sharing',
        [PlatformFeatures.CALENDAR]: 'Calendar integration',
        [PlatformFeatures.HEALTH]: 'Health & activity tracking',
        [PlatformFeatures.NOTIFICATIONS]: 'Push notifications',
        [PlatformFeatures.CONTACTS]: 'Contact access',
        [PlatformFeatures.CAMERA]: 'Camera access',
        [PlatformFeatures.MEDIA_LIBRARY]: 'Photo library access',
        [PlatformFeatures.BACKGROUND_TASKS]: 'Background updates',
    };

    const name = featureNames[feature] || 'This feature';
    return `${name} is only available on the mobile app. Please use the iOS or Android app for the full Sugarbum experience.`;
};

/**
 * Show an alert (web-compatible) for unavailable features
 * @param {string} feature - Feature that's unavailable
 * @param {string} title - Optional custom title
 */
export const showFeatureUnavailableAlert = (feature, title = 'Feature Unavailable') => {
    const message = getFeatureUnavailableMessage(feature);

    if (Platform.OS === 'web') {
        window.alert(`${title}\n\n${message}`);
    } else {
        // On native, this shouldn't be called, but just in case
        const Alert = require('react-native').Alert;
        Alert.alert(title, message);
    }
};

/**
 * Check if running on web platform
 * @returns {boolean}
 */
export const isWeb = () => Platform.OS === 'web';

/**
 * Check if running on native platform (iOS or Android)
 * @returns {boolean}
 */
export const isNative = () => Platform.OS === 'ios' || Platform.OS === 'android';
