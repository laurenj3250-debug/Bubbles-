import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Modal, Animated, Easing } from 'react-native';
import * as Haptics from 'expo-haptics';
import theme from '../theme';

export const LoveBombOverlay = ({ isVisible, onDismiss }) => {
    const [visible, setVisible] = useState(false);

    // Animations
    const scaleAnim = useRef(new Animated.Value(0)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (isVisible) {
            startShow();
        }
    }, [isVisible]);

    const startShow = () => {
        setVisible(true);

        // Haptics: Heartbeat pattern
        // Heavy, pause, Light (Thump-thump)
        const triggerHaptics = async () => {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light), 200);

            setTimeout(async () => {
                await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light), 200);
            }, 800);
        };
        triggerHaptics();

        // 1. Enter
        Animated.parallel([
            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 5,
                useNativeDriver: true,
            }),
            Animated.timing(opacityAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            })
        ]).start();

        // 2. Pulse repeatedly
        const pulse = Animated.loop(
            Animated.sequence([
                Animated.timing(scaleAnim, {
                    toValue: 1.2,
                    duration: 500,
                    easing: Easing.ease,
                    useNativeDriver: true
                }),
                Animated.timing(scaleAnim, {
                    toValue: 1,
                    duration: 500,
                    easing: Easing.ease,
                    useNativeDriver: true
                })
            ])
        );
        pulse.start();

        // 3. Auto dismiss after 4 seconds
        setTimeout(() => {
            pulse.stop();
            Animated.timing(opacityAnim, {
                toValue: 0,
                duration: 500,
                useNativeDriver: true,
            }).start(() => {
                setVisible(false);
                scaleAnim.setValue(0); // Reset
                if (onDismiss) onDismiss();
            });
        }, 4000);
    };

    if (!visible) return null;

    return (
        <Modal transparent visible={visible} animationType="none">
            <View style={styles.overlay}>
                <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(255,105,180, 0.1)' }]} />

                {/* Center Heart */}
                <Animated.View style={[
                    styles.heartContainer,
                    {
                        opacity: opacityAnim,
                        transform: [{ scale: scaleAnim }]
                    }
                ]}>
                    <Text style={styles.heartEmoji}>💖</Text>
                    <Text style={[theme.textStyles.h2, styles.text]}>Miss You!</Text>
                </Animated.View>

                {/* Floating particles (Static for MVP simplicity, could animate these too) */}
                <Text style={[styles.floatingEmoji, { top: '20%', left: '10%' }]}>❤️</Text>
                <Text style={[styles.floatingEmoji, { top: '30%', right: '15%' }]}>💕</Text>
                <Text style={[styles.floatingEmoji, { bottom: '25%', left: '20%' }]}>💞</Text>
                <Text style={[styles.floatingEmoji, { bottom: '15%', right: '10%' }]}>💓</Text>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.2)', // Glass effect
    },
    heartContainer: {
        alignItems: 'center',
    },
    heartEmoji: {
        fontSize: 120,
        marginBottom: 20,
        // Add shadow for depth
        textShadow: '0px 4px 10px rgba(0, 0, 0, 0.2)',
    },
    text: {
        color: theme.colors.deepNavy,
        fontWeight: '900',
    },
    floatingEmoji: {
        position: 'absolute',
        fontSize: 40,
        opacity: 0.6,
    }
});
