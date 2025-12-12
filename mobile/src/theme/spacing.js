// Sugarbum Design System - Spacing
// Based on 4px grid

import { Platform } from 'react-native';

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  '2xl': 32,
  '3xl': 48,
  '4xl': 64,
};

export const borderRadius = {
  small: 12,    // buttons, chips
  medium: 20,   // cards, modules
  large: 28,    // full screen cards
  round: 9999,  // circular elements
};

export const shadows = {
  level1: Platform.select({
    web: { boxShadow: '0px 2px 8px rgba(61, 59, 94, 0.08)' },
    default: {
      shadowColor: '#3D3B5E',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 2,
    },
  }),
  level2: Platform.select({
    web: { boxShadow: '0px 4px 16px rgba(61, 59, 94, 0.12)' },
    default: {
      shadowColor: '#3D3B5E',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 16,
      elevation: 4,
    },
  }),
  level3: Platform.select({
    web: { boxShadow: '0px 8px 32px rgba(61, 59, 94, 0.16)' },
    default: {
      shadowColor: '#3D3B5E',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.16,
      shadowRadius: 32,
      elevation: 8,
    },
  }),
};
