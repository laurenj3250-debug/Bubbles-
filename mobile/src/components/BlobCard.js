import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import theme from '../theme';

/**
 * BlobCard - Organic shaped card with gradient background
 * Inspired by meditation app aesthetic with multi-layered depth
 */
export const BlobCard = ({ children, colors: gradientColors, style, useGradient = true }) => {
  const defaultGradient = [theme.colors.teal, theme.colors.sageGreen];

  return (
    <View style={[styles.container, style]}>
      {/* Multi-layered blob backgrounds for depth */}
      <View style={StyleSheet.absoluteFill}>
        <Svg viewBox="0 0 200 200" style={StyleSheet.absoluteFill}>
          {/* Background blob layer */}
          <Path
            d="M44.7,-76.4C58.8,-69.2,71.8,-59.1,79.6,-45.8C87.4,-32.6,90,-16.3,88.5,-0.9C87,14.6,81.4,29.2,73.1,42.8C64.8,56.4,53.8,69,39.8,76.8C25.8,84.6,8.8,87.6,-7.2,87.4C-23.2,87.2,-38.4,83.8,-51.8,75.8C-65.2,67.8,-76.8,55.2,-83.6,40.2C-90.4,25.2,-92.4,7.8,-89.8,-8.4C-87.2,-24.6,-80,-39.6,-69.4,-51.8C-58.8,-64,-44.8,-73.4,-29.6,-79.8C-14.4,-86.2,1.8,-89.6,17.2,-87.4C32.6,-85.2,47.2,-77.4,44.7,-76.4Z"
            fill={gradientColors?.[1] || defaultGradient[1]}
            opacity={0.12}
            transform="translate(20, -10)"
          />
          {/* Mid blob layer */}
          <Path
            d="M39.2,-67.3C50.8,-59.2,60.2,-47.8,66.8,-34.7C73.4,-21.6,77.2,-6.8,76.3,7.5C75.4,21.8,69.8,35.6,61.1,47.3C52.4,59,40.6,68.6,27.2,74.1C13.8,79.6,-1.2,81,-15.4,77.8C-29.6,74.6,-43,66.8,-54.3,55.8C-65.6,44.8,-74.8,30.6,-78.6,14.9C-82.4,-0.8,-80.8,-17.9,-74.6,-33.4C-68.4,-48.9,-57.6,-62.8,-44.2,-70.1C-30.8,-77.4,-15.4,-78.1,-0.6,-77.1C14.2,-76.1,27.6,-75.4,39.2,-67.3Z"
            fill={gradientColors?.[0] || defaultGradient[0]}
            opacity={0.18}
            transform="translate(-15, 5)"
          />
          {/* Foreground accent blob */}
          <Path
            d="M36.5,-63.2C46.8,-54.3,54.3,-42.8,60.3,-30.2C66.3,-17.6,70.8,-3.9,70.6,9.7C70.4,23.3,65.5,36.8,57.3,48.1C49.1,59.4,37.6,68.5,24.3,74.1C11,79.7,-4.1,81.8,-18.7,78.8C-33.3,75.8,-47.4,67.7,-58.7,56.1C-70,44.5,-78.5,29.4,-81.2,13.2C-83.9,-3,-80.8,-20.3,-73.4,-35.8C-66,-51.3,-54.3,-65,-40.8,-73.3C-27.3,-81.6,-12.2,-84.5,1.3,-86.6C14.8,-88.7,26.2,-72.1,36.5,-63.2Z"
            fill={theme.colors.lavender}
            opacity={0.08}
            transform="translate(10, 15)"
          />
        </Svg>
      </View>

      {/* Subtle gradient overlay for depth */}
      {useGradient && (
        <LinearGradient
          colors={['rgba(255,255,255,0.4)', 'rgba(255,255,255,0.1)']}
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      )}

      {/* Card content */}
      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.offWhite,
    borderRadius: theme.borderRadius.medium,
    overflow: 'hidden',
    ...theme.shadows.level1,
  },
  content: {
    padding: theme.spacing.xl,
  },
});

export default BlobCard;
