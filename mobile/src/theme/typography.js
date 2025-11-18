// Sugarbum Design System - Typography

export const typography = {
  // Font Families
  fontFamily: {
    heading: 'System',  // Will use -apple-system on iOS, Roboto on Android
    body: 'System',
    mono: 'Courier',    // For data/stats
  },

  // Font Sizes (mobile-optimized)
  fontSize: {
    h1: 32,
    h2: 24,
    h3: 20,
    bodyLarge: 18,
    body: 16,
    bodySmall: 14,
    caption: 12,
  },

  // Font Weights
  fontWeight: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },

  // Line Heights
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.8,
  },

  // Letter Spacing
  letterSpacing: {
    tight: -0.5,
    normal: 0,
    wide: 0.5,
  },
};

// Pre-built text styles
export const textStyles = {
  h1: {
    fontSize: typography.fontSize.h1,
    fontWeight: typography.fontWeight.semibold,
    letterSpacing: typography.letterSpacing.tight,
    lineHeight: typography.fontSize.h1 * typography.lineHeight.tight,
  },
  h2: {
    fontSize: typography.fontSize.h2,
    fontWeight: typography.fontWeight.semibold,
    letterSpacing: typography.letterSpacing.tight,
    lineHeight: typography.fontSize.h2 * typography.lineHeight.tight,
  },
  h3: {
    fontSize: typography.fontSize.h3,
    fontWeight: typography.fontWeight.semibold,
    lineHeight: typography.fontSize.h3 * typography.lineHeight.normal,
  },
  bodyLarge: {
    fontSize: typography.fontSize.bodyLarge,
    fontWeight: typography.fontWeight.regular,
    lineHeight: typography.fontSize.bodyLarge * typography.lineHeight.normal,
  },
  body: {
    fontSize: typography.fontSize.body,
    fontWeight: typography.fontWeight.regular,
    lineHeight: typography.fontSize.body * typography.lineHeight.normal,
  },
  bodySmall: {
    fontSize: typography.fontSize.bodySmall,
    fontWeight: typography.fontWeight.regular,
    lineHeight: typography.fontSize.bodySmall * typography.lineHeight.normal,
  },
  caption: {
    fontSize: typography.fontSize.caption,
    fontWeight: typography.fontWeight.medium,
    letterSpacing: typography.letterSpacing.wide,
    textTransform: 'uppercase',
    lineHeight: typography.fontSize.caption * typography.lineHeight.normal,
  },
};
