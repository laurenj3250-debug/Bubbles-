import { Platform, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BACKGROUND_LOCATION_TASK } from './LocationTask';

// Key for storing preference
const LOCATION_TRACKING_KEY = 'is_location_tracking_enabled';

export const startBackgroundLocation = async () => {
    // Web doesn't support background location
    if (Platform.OS === 'web') {
        console.warn('Background location is not supported on web');
        return false;
    }

    try {
        const Location = require('expo-location');

        // 1. Request Foreground Permission first
        const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
        if (foregroundStatus !== 'granted') {
            Alert.alert('Permission Denied', 'Allow location access to share with your partner.');
            return false;
        }

        // 2. Request Background Permission
        const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
        if (backgroundStatus !== 'granted') {
            Alert.alert(
                'Background Permission Required',
                'Please select "Allow All the Time" or "Always" in settings to enable background sharing.'
            );
            return false;
        }

        // 3. Start Task
        await Location.startLocationUpdatesAsync(BACKGROUND_LOCATION_TASK, {
            accuracy: Location.Accuracy.Balanced, // Saves battery vs High
            distanceInterval: 100, // Update every 100 meters
            deferredUpdatesInterval: 5 * 60 * 1000, // 5 minutes (Android only optimization)
            showsBackgroundLocationIndicator: true, // iOS requirement
            foregroundService: {
                notificationTitle: "Sugarbum",
                notificationBody: "Sharing location with partner",
                notificationColor: "#FF69B4"
            }
        });

        await AsyncStorage.setItem(LOCATION_TRACKING_KEY, 'true');
        return true;

    } catch (error) {
        console.error('Start background location error:', error);
        return false;
    }
};

export const stopBackgroundLocation = async () => {
    // Web doesn't support background location
    if (Platform.OS === 'web') {
        return false;
    }

    try {
        const Location = require('expo-location');

        const isRegistered = await Location.hasStartedLocationUpdatesAsync(BACKGROUND_LOCATION_TASK);
        if (isRegistered) {
            await Location.stopLocationUpdatesAsync(BACKGROUND_LOCATION_TASK);
        }
        await AsyncStorage.setItem(LOCATION_TRACKING_KEY, 'false');
        return true;
    } catch (error) {
        console.error('Stop background location error:', error);
        return false;
    }
};

export const checkTrackingStatus = async () => {
    // Web doesn't support background location
    if (Platform.OS === 'web') {
        return false;
    }

    try {
        const Location = require('expo-location');
        return await Location.hasStartedLocationUpdatesAsync(BACKGROUND_LOCATION_TASK);
    } catch (error) {
        return false;
    }
};
