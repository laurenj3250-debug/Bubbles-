import { Platform } from 'react-native';
// import * as Device from 'expo-device'; // Dynamic require
// import * as Notifications from 'expo-notifications'; // Dynamic require
import Constants from 'expo-constants';
import api from '../config/api';

// Configure how notifications behave when app is foregrounded
if (Platform.OS !== 'web') {
    const Notifications = require('expo-notifications');
    Notifications.setNotificationHandler({
        handleNotification: async () => ({
            shouldShowAlert: true,
            shouldPlaySound: true,
            shouldSetBadge: false,
        }),
    });
}

export async function registerForPushNotificationsAsync() {
    if (Platform.OS === 'web') return null;

    const Notifications = require('expo-notifications');
    const Device = require('expo-device');

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
        // ...
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
