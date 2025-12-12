import React, { useRef, useState, useEffect } from 'react';
import { View, StyleSheet, PanResponder, Animated, Dimensions, Platform } from 'react-native';
import { ref, set, onValue, off } from 'firebase/database';
import { database } from '../config/firebase';
import theme from '../theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const THROTTLE_MS = 100;

export const TouchOverlay = ({ userId, partnerId, myPosition }) => {
    // Local State
    const [partnerPos, setPartnerPos] = useState(null);
    const [isTouching, setIsTouching] = useState(false);

    // Animations
    const partnerAnim = useRef(new Animated.ValueXY({ x: -100, y: -100 })).current;
    const sparkScale = useRef(new Animated.Value(0)).current;

    // Derived myPos from prop for compatibility with existing logic
    const myPos = myPosition;

    // 3. Listen to Partner
    useEffect(() => {
        if (!partnerId) return;
        const refPath = `users/${partnerId}/status/touch`;

        const unsubscribe = onValue(ref(database, refPath), (snapshot) => {
            const data = snapshot.val();
            if (data && data.x && data.y) {
                // Check staleness (if > 5 seconds old, ignore)
                if (Date.now() - data.timestamp > 5000) {
                    setPartnerPos(null);
                    return;
                }

                setPartnerPos({ x: data.x, y: data.y });

                // Smooth animation to new pos
                Animated.spring(partnerAnim, {
                    toValue: { x: data.x - 30, y: data.y - 30 }, // Center blob (-30 for radius)
                    friction: 7,
                    useNativeDriver: Platform.OS !== 'web' // translateXY
                }).start();

            } else {
                setPartnerPos(null);
            }
        });

        return () => off(ref(database, refPath));
    }, [partnerId]);

    // 4. Collision Detection (The Spark)
    useEffect(() => {
        if (myPos && partnerPos) {
            const dx = myPos.x - partnerPos.x;
            const dy = myPos.y - partnerPos.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            // Collision threshold: 60px radius
            if (distance < 60) {
                if (!isTouching) {
                    setIsTouching(true);
                    triggerSpark();
                }
            } else {
                setIsTouching(false);
            }
        } else {
            setIsTouching(false);
        }
    }, [myPos, partnerPos]);

    const triggerSpark = () => {
        if (Platform.OS !== 'web') {
            const Haptics = require('expo-haptics');
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        }

        // Spark Animation
        sparkScale.setValue(0);
        Animated.sequence([
            Animated.spring(sparkScale, { toValue: 1.5, friction: 3, useNativeDriver: Platform.OS !== 'web' }),
            Animated.timing(sparkScale, { toValue: 0, duration: 200, useNativeDriver: Platform.OS !== 'web' })
        ]).start();
    };


    return (
        <View style={[StyleSheet.absoluteFill, { pointerEvents: 'box-none' }]}>
            {/* 
                We cannot attach PanResponder here if we want button clicks to pass through.
                Strategy: We will separate Input handling from Visualization.
                To track touches properly without blocking UI, usage is typically:
                - "Touch Mode" (Modal) -> Best for "Game" feel.
                - OR wrap the App root. 
                
                For this MVP "Savant" implementation, we will render a "Touch Surface" 
                that is visible ONLY when partner is touching? 
                No, let's make it a dedicated transparent View that sits ON TOP 
                but we use `pointerEvents="box-none"` on the container 
                and attach the responder to a sibling or parent?
                
                Actually, to feel "Always on", we need to wrap the screen content.
                But for now, I will return just the VISUALS here.
                The PanResponder needs to be attached to the Container in HomeScreen.
            */}

            {/* Visuals */}

            {/* Partner's Finger (Ghost) */}
            {partnerPos && (
                <Animated.View style={[
                    styles.ghostFinger,
                    { transform: partnerAnim.getTranslateTransform() }
                ]}>
                    <View style={styles.ghostCore} />
                    <View style={styles.ghostRing} />
                </Animated.View>
            )}

            {/* Spark Effect (At my position) */}
            {isTouching && myPos && (
                <Animated.View style={[
                    styles.spark,
                    {
                        left: myPos.x - 50,
                        top: myPos.y - 50,
                        transform: [{ scale: sparkScale }]
                    }
                ]} />
            )}

        </View>
    );
};

// Exporting the responder logic helper to attach to HomeScreen
export const useTouchResponder = ({ userId, onUpdate }) => {
    const lastUpdate = useRef(0);

    return useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            // Important: Allow touches to pass through to buttons? 
            // If we return true here, we steal the touch.
            // If we return false, we don't track move.
            // The "Savant" way for "Pass-through tracking" is View-specific (JESTure Handler).
            // But with base RN, we can't easily track AND pass-through without capturing.
            // 
            // DECISION: We will only activate tracking if the user PRESSES & HOLDS 
            // OR we accept that "Digital Touch" mode might block scrolling momentarily?
            // BETTER DECISION for UX: 
            // We'll update the component to be a "wrapper" that you wrap content in.

            onPanResponderGrant: (evt) => onUpdate(evt.nativeEvent.pageX, evt.nativeEvent.pageY),
            onPanResponderMove: (evt) => onUpdate(evt.nativeEvent.pageX, evt.nativeEvent.pageY),
            onPanResponderRelease: () => onUpdate(null, null),
            onPanResponderTerminate: () => onUpdate(null, null),
        })
    ).current;
};

const styles = StyleSheet.create({
    ghostFinger: {
        position: 'absolute',
        width: 60,
        height: 60,
        justifyContent: 'center',
        alignItems: 'center',
    },
    ghostCore: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: theme.colors.primary,
        opacity: 0.8,
        ...theme.shadows.level2, // Glow
    },
    ghostRing: {
        position: 'absolute',
        width: 60,
        height: 60,
        borderRadius: 30,
        borderWidth: 2,
        borderColor: theme.colors.primary,
        opacity: 0.3,
    },
    spark: {
        position: 'absolute',
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#FFD700', // Gold
        opacity: 0.8,
        zIndex: 999,
    }
});
