// Sugarbum Design System - Colors
// "Sophisticated Organic Modern" aesthetic - balanced, not overly feminine
// Logo: "Be together, apart" - Two bums connected with heart and wifi signals

export const colors = {
  // Primary Colors
  primary: '#8B5CF6',        // Main brand purple (Vibrant)
  primaryLight: '#C4B5FD',   // Light purple for backgrounds/toggles
  dustyRose: '#D4A5A5',      // Muted rose, more sophisticated (Logo left bum)
  deepNavy: '#191938',       // Deep navy background (Logo background)
  navyText: '#3D3B5E',       // Text, important CTAs, grounding
  sageGreen: '#8FAF8F',      // Sage green (Logo right bum)
  cream: '#FAF8F5',          // Warm neutral background
  background: '#F9FAFB',     // App background (Light Gray)
  surface: '#FFFFFF',        // Cards (White)

  // Logo-specific colors
  logoPink: '#D4A5A5',       // Left bum pink
  logoGreen: '#8FAF8F',      // Right bum green
  logoHeart: '#E55050',      // Heart red
  logoNavy: '#191938',       // Background navy

  // Accent Colors - More variety
  teal: '#4A9B8E',           // Location, movement
  lavender: '#B5A9D8',       // Rest states, evening modes
  warmYellow: '#E5C185',     // Sunshine, weather, energy
  peach: '#E9B89A',          // Warm accent
  slate: '#7B8B9E',          // Cool neutral

  // Rich Secondary Colors
  deepTeal: '#3A7A6D',       // Deeper accent
  mutedPurple: '#9B8FB5',    // Sophisticated purple
  softCoral: '#E89B88',      // Warm coral
  mossGreen: '#6B8E7A',      // Natural green

  // Neutrals
  charcoal: '#2D2D2D',       // Primary text
  mediumGray: '#6B6B6B',     // Secondary text
  lightGray: '#E5E5E5',      // Borders, dividers
  offWhite: '#FEFEFE',       // Cards, elevated surfaces

  // Status Colors
  active: '#5C8D7E',         // Online/active
  away: '#E5C185',           // Away
  busy: '#D4A5A5',           // Busy/work
  sleeping: '#B5A9D8',       // Sleeping

  // Semantic Colors
  success: '#5C8D7E',
  warning: '#E5C185',
  error: '#E89B88',
  info: '#4A9B8E',
};

// Color with opacity helpers
export const withOpacity = (color, opacity) => {
  return `${color}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`;
};
