import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Alert } from 'react-native';
import * as Haptics from 'expo-haptics';
import api from '../config/api';
import theme from '../theme';

// Using RN Animated for simplicity without reanimated dependency complexity if not installed
// (Can upgrade to Reanimated if preferred, but Animated is fine here)
export const MissYouButton = ({ partnerName }) => {
    const [scaleAnim] = useState(new Animated.Value(1));
    const [isCharging, setIsCharging] = useState(false);

    const handlePressIn = () => {
        setIsCharging(true);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

        // Charge up animation
        Animated.sequence([
            Animated.timing(scaleAnim, {
                toValue: 0.9, // Press in
                duration: 100,
                useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
                toValue: 1.1, // Pulse out
                duration: 1000,
                useNativeDriver: true,
            })
        ]).start();

        // Charge up haptics simulation
        // In a real loop we might increase intensity, here we just do one start impact
    };

    const handlePressOut = () => {
        setIsCharging(false);
        // Reset scale
        Animated.spring(scaleAnim, {
            toValue: 1,
            friction: 3,
            useNativeDriver: true,
        }).start();

        sendMissYou();
    };

    const sendMissYou = async () => {
        try {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            await api.post('/signals/miss-you');
            Alert.alert('Sent!', `Love sent to ${partnerName} ❤️`);
        } catch (error) {
            console.error('Miss you error:', error);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        }
    };

    return (
        <TouchableOpacity
            activeOpacity={1}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            style={styles.container}
        >
            <Animated.View style={[
                styles.button,
                { transform: [{ scale: scaleAnim }] },
                isCharging && styles.charging
            ]}>
                <Text style={styles.icon}>💌</Text>
                <Text style={styles.text}>Miss You</Text>
            </Animated.View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
    },
    button: {
        backgroundColor: theme.colors.softCoral,
        paddingVertical: theme.spacing.lg,
        paddingHorizontal: theme.spacing.xl,
        borderRadius: theme.borderRadius.round,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        ...theme.shadows.level1,
    },
    charging: {
        backgroundColor: theme.colors.peach,
        ...theme.shadows.level2,
    },
    icon: {
        fontSize: 24,
        marginRight: theme.spacing.sm,
    },
    text: {
        color: theme.colors.deepNavy,
        fontWeight: theme.typography.fontWeight.bold,
        fontSize: 16,
    },
});
