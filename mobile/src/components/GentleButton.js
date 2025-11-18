import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Vibration } from 'react-native';
import theme from '../theme';

/**
 * GentleButton - Rounded button with haptic feedback
 * Soft, organic style matching meditation app aesthetic
 */
export const GentleButton = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  style,
  textStyle,
}) => {
  const handlePress = () => {
    Vibration.vibrate(10); // Gentle haptic
    onPress?.();
  };

  const buttonStyles = {
    primary: {
      backgroundColor: theme.colors.deepNavy,
      color: theme.colors.offWhite,
    },
    secondary: {
      backgroundColor: 'transparent',
      color: theme.colors.deepNavy,
      borderColor: theme.colors.dustyRose,
      borderWidth: 2,
    },
    soft: {
      backgroundColor: theme.colors.dustyRose,
      color: theme.colors.offWhite,
    },
  };

  const sizeStyles = {
    small: {
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.lg,
    },
    medium: {
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.xl,
    },
    large: {
      paddingVertical: theme.spacing.lg,
      paddingHorizontal: theme.spacing['2xl'],
    },
  };

  const currentStyle = buttonStyles[variant];
  const currentSize = sizeStyles[size];

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.7}
      style={[
        styles.button,
        currentSize,
        { backgroundColor: currentStyle.backgroundColor },
        currentStyle.borderWidth && {
          borderWidth: currentStyle.borderWidth,
          borderColor: currentStyle.borderColor,
        },
        style,
      ]}
    >
      <Text
        style={[
          styles.text,
          theme.textStyles.body,
          { color: currentStyle.color },
          textStyle,
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: theme.borderRadius.medium,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.level1,
  },
  text: {
    fontWeight: theme.typography.fontWeight.semibold,
  },
});

export default GentleButton;
