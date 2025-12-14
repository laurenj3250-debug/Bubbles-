import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

// Haptic feedback utility for Sugarbum
// Provides consistent haptic patterns across the app

const isHapticsAvailable = Platform.OS !== 'web';

export const haptics = {
  // Light tap - for selections, toggles
  light: () => {
    if (isHapticsAvailable) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  },

  // Medium tap - for button presses
  medium: () => {
    if (isHapticsAvailable) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  },

  // Heavy tap - for important actions
  heavy: () => {
    if (isHapticsAvailable) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }
  },

  // Success - for completed actions
  success: () => {
    if (isHapticsAvailable) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  },

  // Warning - for warnings
  warning: () => {
    if (isHapticsAvailable) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
  },

  // Error - for errors
  error: () => {
    if (isHapticsAvailable) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  },

  // Selection changed - for pickers, sliders
  selection: () => {
    if (isHapticsAvailable) {
      Haptics.selectionAsync();
    }
  },

  // Special pattern for "Miss You" button - triple pulse
  missYou: async () => {
    if (isHapticsAvailable) {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      await new Promise((resolve) => setTimeout(resolve, 100));
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await new Promise((resolve) => setTimeout(resolve, 100));
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  },

  // Heartbeat pattern - for love-related features
  heartbeat: async () => {
    if (isHapticsAvailable) {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      await new Promise((resolve) => setTimeout(resolve, 150));
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await new Promise((resolve) => setTimeout(resolve, 400));
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      await new Promise((resolve) => setTimeout(resolve, 150));
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  },
};

export default haptics;
