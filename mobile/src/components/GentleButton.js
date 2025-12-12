import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Platform, Image, View } from 'react-native';
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
  icon,
}) => {
  const handlePress = () => {
    // Gentle haptic feedback (mobile only)
    if (Platform.OS !== 'web') {
      try {
        const { Vibration } = require('react-native');
        Vibration.vibrate(10);
      } catch (e) {
        // Vibration not available, silently ignore
      }
    }
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
      <View style={styles.contentContainer}>
        {icon && (
          <Image
            source={icon}
            style={[
              styles.icon,
              title ? styles.iconWithText : null,
              { tintColor: variant === 'secondary' ? theme.colors.deepNavy : theme.colors.offWhite }
            ]}
            resizeMode="contain"
          />
        )}
        {title && (
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
        )}
      </View>
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
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: theme.typography.fontWeight.semibold,
  },
  icon: {
    width: 20,
    height: 20,
  },
  iconWithText: {
    marginRight: 8,
  },
});

export default GentleButton;
