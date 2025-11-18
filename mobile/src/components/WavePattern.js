import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import theme from '../theme';

/**
 * WavePattern - Subtle organic background pattern
 * Like the wavy lines in meditation app headers
 */
export const WavePattern = ({ color = theme.colors.dustyRose, opacity = 0.1 }) => {
  return (
    <View style={StyleSheet.absoluteFill}>
      <Svg
        width="100%"
        height="100%"
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
        style={StyleSheet.absoluteFill}
      >
        {/* Multiple wave layers */}
        <Path
          d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,112C672,96,768,96,864,112C960,128,1056,160,1152,160C1248,160,1344,128,1392,112L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          fill={color}
          opacity={opacity}
        />
        <Path
          d="M0,192L48,197.3C96,203,192,213,288,229.3C384,245,480,267,576,250.7C672,235,768,181,864,181.3C960,181,1056,235,1152,234.7C1248,235,1344,181,1392,154.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          fill={color}
          opacity={opacity * 0.5}
        />
      </Svg>
    </View>
  );
};

export default WavePattern;
