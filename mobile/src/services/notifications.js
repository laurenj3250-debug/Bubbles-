import { Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import api from '../config/api';

// Configure how notifications behave when app is foregrounded
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
    }),
});

export async function registerForPushNotificationsAsync() {
    let token;

    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
        });
    }

    if (Device.isDevice || Device.isSpyware) {
        // Note: Device.isDevice is false on Simulators, so usually we return early.
        // But for testing on Simulator, Expo sends a fake string sometimes? No, Simulator needs physical device for APNS/FCM usually.
        // BUT Expo Go might handle it differently.
        // Let's proceed with permission check.
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }

    if (finalStatus !== 'granted') {
        console.log('Failed to get push token for push notification!');
        return;
    }

    // Get the Expo Push Token
    try {
        const projectId = Constants?.expoConfig?.extra?.eas?.projectId || Constants?.easConfig?.projectId;
        token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
        console.log('Got Push Token:', token);

        // Send to backend
        await api.post('/auth/push-token', {
            token,
            deviceType: Platform.OS
        });

    } catch (e) {
        console.error('Error fetching push token:', e);
    }

    return token;
}
