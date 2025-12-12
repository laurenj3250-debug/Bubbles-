import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Alert, Platform, Image } from 'react-native';
import api from '../config/api';
import theme from '../theme';

// Using RN Animated for simplicity without reanimated dependency complexity if not installed
// (Can upgrade to Reanimated if preferred, but Animated is fine here)
export const MissYouButton = ({ partnerName }) => {
    const [scaleAnim] = useState(new Animated.Value(1));
    const [isCharging, setIsCharging] = useState(false);

    const handlePress = async () => {
        // Animate button
        Animated.sequence([
            Animated.timing(scaleAnim, {
                toValue: 0.9,
                duration: 100,
                useNativeDriver: Platform.OS !== 'web',
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 3,
                useNativeDriver: Platform.OS !== 'web',
            }),
        ]).start();

        if (Platform.OS !== 'web') {
            try {
                const Haptics = require('expo-haptics');
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            } catch (e) {
                // Ignore if haptics fail
            }
        }

        try {
            await api.post('/signals/miss-you');
        } catch (error) {
            console.error('Error sending miss you:', error);
        }
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity
                onPress={handlePress}
                activeOpacity={0.9}
                style={styles.touchable}
            >
                <Animated.View style={[styles.button, { transform: [{ scale: scaleAnim }] }]}>
                    <View style={styles.iconContainer}>
                        <Image source={require('../../assets/icons/heart.png')} style={styles.icon} resizeMode="contain" />
                    </View>
                    <Text style={styles.label}>Love Bomb</Text>
                </Animated.View>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    touchable: {
        flex: 1,
    },
    button: {
        backgroundColor: theme.colors.primary,
        borderRadius: theme.borderRadius.medium,
        padding: theme.spacing.md,
        alignItems: 'center',
        justifyContent: 'center',
        ...theme.shadows.level1,
        height: '100%', // Match height of neighbor
    },
    iconContainer: {
        marginBottom: 4,
    },
    icon: {
        width: 24,
        height: 24,
        tintColor: theme.colors.offWhite,
    },
    label: {
        color: theme.colors.offWhite,
        fontSize: theme.typography.fontSize.xs,
        fontWeight: theme.typography.fontWeight.bold,
        textAlign: 'center',
    },
});
