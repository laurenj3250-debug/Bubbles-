import React from 'react';
import { View } from 'react-native';
import Svg, { Path, Circle, G } from 'react-native-svg';

// Sugarbum Logo: Two "bums" connected with heart, wifi signals, and smiles
// Colors from the logo: Pink (#D4A5A5), Green (#8FAF8F), Red heart (#E55050), White signals

export const SugarbumLogo = ({
  size = 120,
  showSignals = true,
  style
}) => {
  const scale = size / 200; // Base design is 200x120

  return (
    <View style={[{ width: size, height: size * 0.6 }, style]}>
      <Svg
        width={size}
        height={size * 0.6}
        viewBox="0 0 200 120"
      >
        {/* Left WiFi signals */}
        {showSignals && (
          <G>
            <Path
              d="M15 35 Q5 45, 15 55"
              stroke="#FFFFFF"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
            />
            <Path
              d="M25 28 Q10 45, 25 62"
              stroke="#FFFFFF"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
            />
            <Path
              d="M35 21 Q15 45, 35 69"
              stroke="#FFFFFF"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
            />
            {/* Left dot */}
            <Circle cx="22" cy="72" r="4" fill="#FFFFFF" />
          </G>
        )}

        {/* Right WiFi signals */}
        {showSignals && (
          <G>
            <Path
              d="M185 35 Q195 45, 185 55"
              stroke="#FFFFFF"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
            />
            <Path
              d="M175 28 Q190 45, 175 62"
              stroke="#FFFFFF"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
            />
            <Path
              d="M165 21 Q185 45, 165 69"
              stroke="#FFFFFF"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
            />
            {/* Right dot */}
            <Circle cx="178" cy="72" r="4" fill="#FFFFFF" />
          </G>
        )}

        {/* Left bum (pink) */}
        <Path
          d="M45 50
             C45 25, 75 15, 90 35
             C95 42, 97 50, 97 55
             C97 80, 75 95, 55 95
             C35 95, 45 75, 45 50"
          fill="#D4A5A5"
        />

        {/* Right bum (green) */}
        <Path
          d="M155 50
             C155 25, 125 15, 110 35
             C105 42, 103 50, 103 55
             C103 80, 125 95, 145 95
             C165 95, 155 75, 155 50"
          fill="#8FAF8F"
        />

        {/* Heart at the top */}
        <Path
          d="M100 25
             C95 18, 85 18, 85 28
             C85 35, 100 45, 100 45
             C100 45, 115 35, 115 28
             C115 18, 105 18, 100 25"
          fill="#E55050"
        />

        {/* Left smile */}
        <Path
          d="M60 70 Q70 82, 85 75"
          stroke="#191938"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
        />

        {/* Right smile */}
        <Path
          d="M140 70 Q130 82, 115 75"
          stroke="#191938"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
        />
      </Svg>
    </View>
  );
};

// Compact icon version (just the bums with heart, no signals)
export const SugarbumIcon = ({ size = 48, style }) => {
  return (
    <View style={[{ width: size, height: size }, style]}>
      <Svg width={size} height={size} viewBox="0 0 100 100">
        {/* Left bum (pink) */}
        <Path
          d="M15 45
             C15 20, 40 10, 48 30
             C50 35, 50 40, 50 45
             C50 70, 35 85, 22 85
             C10 85, 15 65, 15 45"
          fill="#D4A5A5"
        />

        {/* Right bum (green) */}
        <Path
          d="M85 45
             C85 20, 60 10, 52 30
             C50 35, 50 40, 50 45
             C50 70, 65 85, 78 85
             C90 85, 85 65, 85 45"
          fill="#8FAF8F"
        />

        {/* Heart at the top */}
        <Path
          d="M50 20
             C46 13, 38 13, 38 22
             C38 28, 50 38, 50 38
             C50 38, 62 28, 62 22
             C62 13, 54 13, 50 20"
          fill="#E55050"
        />

        {/* Left smile */}
        <Path
          d="M28 60 Q36 70, 45 65"
          stroke="#191938"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
        />

        {/* Right smile */}
        <Path
          d="M72 60 Q64 70, 55 65"
          stroke="#191938"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
        />
      </Svg>
    </View>
  );
};

export default SugarbumLogo;
