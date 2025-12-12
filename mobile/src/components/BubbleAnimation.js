import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Platform } from 'react-native';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export const BubbleAnimation = ({
    color = '#667eea',
    size = 150,
    opacity = 0.3,
    duration = 15000,
    style = {},
    shimmer = true
}) => {
    const translateX = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(0)).current;
    const scale = useRef(new Animated.Value(1)).current;
    const shimmerOpacity = useRef(new Animated.Value(0.3)).current;

    useEffect(() => {
        // Floating animation
        const floatAnimation = Animated.loop(
            Animated.sequence([
                Animated.parallel([
                    Animated.timing(translateX, {
                        toValue: Math.random() * 40 - 20,
                        duration: duration,
                        useNativeDriver: Platform.OS !== 'web',
                    }),
                    Animated.timing(translateY, {
                        toValue: Math.random() * 40 - 20,
                        duration: duration,
                        useNativeDriver: Platform.OS !== 'web',
                    }),
                ]),
                Animated.parallel([
                    Animated.timing(translateX, {
                        toValue: 0,
                        duration: duration,
                        useNativeDriver: Platform.OS !== 'web',
                    }),
                    Animated.timing(translateY, {
                        toValue: 0,
                        duration: duration,
                        useNativeDriver: Platform.OS !== 'web',
                    }),
                ]),
            ])
        );

        // Subtle breathing scale
        const breathAnimation = Animated.loop(
            Animated.sequence([
                Animated.timing(scale, {
                    toValue: 1.1,
                    duration: duration / 2,
                    useNativeDriver: Platform.OS !== 'web',
                }),
                Animated.timing(scale, {
                    toValue: 1,
                    duration: duration / 2,
                    useNativeDriver: Platform.OS !== 'web',
                }),
            ])
        );

        // Shimmer effect
        let shimmerAnimation;
        if (shimmer) {
            shimmerAnimation = Animated.loop(
                Animated.sequence([
                    Animated.timing(shimmerOpacity, {
                        toValue: 0.5,
                        duration: 2000,
                        useNativeDriver: Platform.OS !== 'web',
                    }),
                    Animated.timing(shimmerOpacity, {
                        toValue: 0.3,
                        duration: 2000,
                        useNativeDriver: Platform.OS !== 'web',
                    }),
                ])
            );
        }

        floatAnimation.start();
        breathAnimation.start();
        if (shimmerAnimation) shimmerAnimation.start();

        return () => {
            floatAnimation.stop();
            breathAnimation.stop();
            if (shimmerAnimation) shimmerAnimation.stop();
        };
    }, [duration, shimmer]);

    const gradientId = `bubble-gradient-${Math.random().toString(36).substr(2, 9)}`;

    return (
        <Animated.View
            style={[
                styles.bubbleContainer,
                {
                    width: size,
                    height: size,
                    opacity,
                    transform: [
                        { translateX },
                        { translateY },
                        { scale },
                    ],
                },
                style,
            ]}
        >
            <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                <Defs>
                    <RadialGradient id={gradientId} cx="30%" cy="30%">
                        <Stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
                        <Stop offset="50%" stopColor={color} stopOpacity="0.5" />
                        <Stop offset="100%" stopColor={color} stopOpacity="0.2" />
                    </RadialGradient>
                </Defs>

                {/* Main bubble */}
                <AnimatedCircle
                    cx={size / 2}
                    cy={size / 2}
                    r={size / 2}
                    fill={`url(#${gradientId})`}
                />

                {/* Shimmer highlight */}
                {shimmer && (
                    <AnimatedCircle
                        cx={size / 2 - size / 6}
                        cy={size / 2 - size / 6}
                        r={size / 4}
                        fill="#ffffff"
                        opacity={shimmerOpacity}
                    />
                )}
            </Svg>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    bubbleContainer: {
        position: 'absolute',
        ...Platform.select({
            web: { pointerEvents: 'none' },
            default: {},
        }),
    },
});
