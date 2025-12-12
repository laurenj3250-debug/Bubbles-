import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle, Line, Rect, Path, Polygon } from 'react-native-svg';
import theme from '../theme';

/**
 * PatternBackground - Decorative pattern backgrounds
 * Inspired by pattern.css - React Native implementation
 */
export const PatternBackground = ({ pattern = 'dots', color = theme.colors.dustyRose, opacity = 0.1, size = 'medium' }) => {
  const sizes = {
    small: 20,
    medium: 40,
    large: 60,
  };

  const gridSize = sizes[size];
  const strokeWidth = size === 'small' ? 1 : size === 'medium' ? 1.5 : 2;

  const renderPattern = () => {
    switch (pattern) {
      case 'dots':
        return (
          <Svg width="100%" height="100%" style={StyleSheet.absoluteFill}>
            <Circle cx={gridSize / 2} cy={gridSize / 2} r={gridSize / 8} fill={color} opacity={opacity} />
          </Svg>
        );

      case 'grid':
        return (
          <Svg width="100%" height="100%" style={StyleSheet.absoluteFill}>
            <Line x1="0" y1={gridSize / 2} x2={gridSize} y2={gridSize / 2} stroke={color} strokeWidth={strokeWidth} opacity={opacity} />
            <Line x1={gridSize / 2} y1="0" x2={gridSize / 2} y2={gridSize} stroke={color} strokeWidth={strokeWidth} opacity={opacity} />
          </Svg>
        );

      case 'diagonal-lines':
        return (
          <Svg width="100%" height="100%" style={StyleSheet.absoluteFill}>
            <Line x1="0" y1="0" x2={gridSize} y2={gridSize} stroke={color} strokeWidth={strokeWidth} opacity={opacity} />
          </Svg>
        );

      case 'cross-dots':
        return (
          <Svg width="100%" height="100%" style={StyleSheet.absoluteFill}>
            <Line x1={gridSize / 2 - 4} y1={gridSize / 2} x2={gridSize / 2 + 4} y2={gridSize / 2} stroke={color} strokeWidth={strokeWidth} opacity={opacity} />
            <Line x1={gridSize / 2} y1={gridSize / 2 - 4} x2={gridSize / 2} y2={gridSize / 2 + 4} stroke={color} strokeWidth={strokeWidth} opacity={opacity} />
          </Svg>
        );

      case 'triangles':
        return (
          <Svg width="100%" height="100%" style={StyleSheet.absoluteFill}>
            <Polygon
              points={`${gridSize / 2},${gridSize / 4} ${gridSize * 0.75},${gridSize * 0.75} ${gridSize * 0.25},${gridSize * 0.75}`}
              fill={color}
              opacity={opacity}
            />
          </Svg>
        );

      case 'zigzag':
        return (
          <Svg width="100%" height="100%" style={StyleSheet.absoluteFill}>
            <Path
              d={`M 0,${gridSize / 2} L ${gridSize / 4},${gridSize / 4} L ${gridSize / 2},${gridSize / 2} L ${gridSize * 0.75},${gridSize / 4} L ${gridSize},${gridSize / 2}`}
              stroke={color}
              strokeWidth={strokeWidth}
              fill="none"
              opacity={opacity}
            />
          </Svg>
        );

      default:
        return null;
    }
  };

  return (
    <View style={[StyleSheet.absoluteFill, { pointerEvents: 'none' }]}>
      {renderPattern()}
    </View>
  );
};

export default PatternBackground;
