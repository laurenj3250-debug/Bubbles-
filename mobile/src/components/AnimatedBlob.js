import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import theme from '../theme';

// Blob shape variations for visual diversity
const BLOB_SHAPES = {
  shape1: "M47.3,-76.9C59.9,-68.7,67.8,-53.2,74.2,-37.5C80.6,-21.8,85.5,-5.9,84.1,9.3C82.7,24.5,75.1,38.9,64.8,49.8C54.5,60.7,41.5,68.1,27.6,72.8C13.7,77.5,-1.2,79.5,-15.8,76.8C-30.4,74.1,-44.7,66.7,-56.2,55.4C-67.7,44.1,-76.4,29,-80.4,12.4C-84.4,-4.2,-83.7,-22.3,-76.9,-37.2C-70.1,-52.1,-57.2,-63.8,-42.8,-71.3C-28.4,-78.8,-12.6,-82.1,2.8,-86.7C18.2,-91.3,34.7,-85.1,47.3,-76.9Z",
  shape2: "M43.8,-74.7C56.9,-66.3,67.7,-53.4,73.9,-38.5C80.1,-23.6,81.7,-6.7,79.8,9.5C77.9,25.7,72.5,41.2,63.2,53.8C53.9,66.4,40.7,76.1,25.8,80.4C10.9,84.7,-5.7,83.6,-21.4,79.1C-37.1,74.6,-51.9,66.7,-63.3,54.8C-74.7,42.9,-82.7,27,-85.2,10.1C-87.7,-6.8,-84.7,-24.7,-77.3,-40.2C-69.9,-55.7,-58.1,-68.8,-43.6,-76.5C-29.1,-84.2,-12.3,-86.5,3.1,-91.9C18.5,-97.3,30.7,-83.1,43.8,-74.7Z",
  shape3: "M39.2,-67.3C50.8,-59.2,60.2,-47.8,66.8,-34.7C73.4,-21.6,77.2,-6.8,76.3,7.5C75.4,21.8,69.8,35.6,61.1,47.3C52.4,59,40.6,68.6,27.2,74.1C13.8,79.6,-1.2,81,-15.4,77.8C-29.6,74.6,-43,66.8,-54.3,55.8C-65.6,44.8,-74.8,30.6,-78.6,14.9C-82.4,-0.8,-80.8,-17.9,-74.6,-33.4C-68.4,-48.9,-57.6,-62.8,-44.2,-70.1C-30.8,-77.4,-15.4,-78.1,-0.6,-77.1C14.2,-76.1,27.6,-75.4,39.2,-67.3Z",
  shape4: "M51.2,-86.7C65.3,-77.8,75.5,-61.3,81.2,-43.9C86.9,-26.5,88.1,-8.2,85.3,8.9C82.5,26,75.7,41.9,65.4,54.8C55.1,67.7,41.3,77.6,25.8,82.1C10.3,86.6,-6.9,85.7,-23.1,81.2C-39.3,76.7,-54.5,68.6,-66.2,56.3C-77.9,44,-86.1,27.5,-87.8,10.2C-89.5,-7.1,-84.7,-25.2,-76.3,-41.2C-67.9,-57.2,-55.9,-71.1,-40.9,-79.5C-25.9,-87.9,-9,-90.8,6.8,-100.7C22.6,-110.6,37.1,-95.6,51.2,-86.7Z",
  shape5: "M36.5,-63.2C46.8,-54.3,54.3,-42.8,60.3,-30.2C66.3,-17.6,70.8,-3.9,70.6,9.7C70.4,23.3,65.5,36.8,57.3,48.1C49.1,59.4,37.6,68.5,24.3,74.1C11,79.7,-4.1,81.8,-18.7,78.8C-33.3,75.8,-47.4,67.7,-58.7,56.1C-70,44.5,-78.5,29.4,-81.2,13.2C-83.9,-3,-80.8,-20.3,-73.4,-35.8C-66,-51.3,-54.3,-65,-40.8,-73.3C-27.3,-81.6,-12.2,-84.5,1.3,-86.6C14.8,-88.7,26.2,-72.1,36.5,-63.2Z",
};

/**
 * AnimatedBlob - Floating, morphing blob shapes
 * Uses Reanimated 2 for smooth, performant animations
 * Inspired by blobity and organic motion design
 */
export const AnimatedBlob = ({
  color = theme.colors.dustyRose,
  size = 200,
  opacity = 0.3,
  style,
  shape = 'shape1',
  duration = 20000
}) => {
  const scale = useSharedValue(1);
  const rotate = useSharedValue(0);

  useEffect(() => {
    // Gentle organic pulsing with easing
    scale.value = withRepeat(
      withSequence(
        withTiming(1.15, { duration: 4000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.92, { duration: 3500, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 3000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );

    // Slow continuous rotation
    rotate.value = withRepeat(
      withTiming(360, { duration, easing: Easing.linear }),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotate: `${rotate.value}deg` },
    ],
  }));

  const blobPath = BLOB_SHAPES[shape] || BLOB_SHAPES.shape1;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          width: size,
          height: size,
        },
        animatedStyle,
        style,
      ]}
      pointerEvents="none"
    >
      <Svg width={size} height={size} viewBox="0 0 200 200">
        <Path d={blobPath} fill={color} opacity={opacity} />
      </Svg>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
  },
});

export default AnimatedBlob;
