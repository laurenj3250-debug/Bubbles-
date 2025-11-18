import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import theme from '../theme';

/**
 * StatusAvatar - Partner avatar with activity ring
 * Like meditation app's circular illustrated person
 */
export const StatusAvatar = ({
  imageUrl,
  status = 'active',
  size = 120,
}) => {
  const statusColors = {
    active: [theme.colors.sageGreen, theme.colors.teal],
    away: [theme.colors.warmYellow, theme.colors.coralPink],
    busy: [theme.colors.dustyRose, theme.colors.coralPink],
    sleeping: [theme.colors.lightLavender, theme.colors.dustyRose],
  };

  const gradientColors = statusColors[status] || statusColors.active;
  const ringSize = size + 16;

  return (
    <View style={[styles.container, { width: ringSize, height: ringSize }]}>
      {/* Status ring */}
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.ring, { width: ringSize, height: ringSize, borderRadius: ringSize / 2 }]}
      />

      {/* Avatar */}
      <View style={[styles.avatarContainer, { width: size, height: size, borderRadius: size / 2 }]}>
        {imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]}
          />
        ) : (
          <LinearGradient
            colors={[theme.colors.dustyRose, theme.colors.warmYellow]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
  },
  avatarContainer: {
    backgroundColor: theme.colors.offWhite,
    overflow: 'hidden',
    ...theme.shadows.level2,
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
});

export default StatusAvatar;
