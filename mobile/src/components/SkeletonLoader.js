import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import theme from '../theme';

// Animated shimmer effect for loading states
const ShimmerEffect = ({ style }) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [animatedValue]);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        styles.shimmer,
        style,
        { opacity },
      ]}
    />
  );
};

// Skeleton for status cards on HomeScreen
export const StatusCardSkeleton = () => (
  <View style={styles.statusCard}>
    <View style={styles.statusHeader}>
      <ShimmerEffect style={styles.avatarSkeleton} />
      <View style={styles.statusInfo}>
        <ShimmerEffect style={styles.nameSkeleton} />
        <ShimmerEffect style={styles.timeSkeleton} />
      </View>
    </View>
    <ShimmerEffect style={styles.contentSkeleton} />
    <ShimmerEffect style={styles.contentSkeletonShort} />
  </View>
);

// Skeleton for partner card
export const PartnerCardSkeleton = () => (
  <View style={styles.partnerCard}>
    <ShimmerEffect style={styles.partnerAvatar} />
    <ShimmerEffect style={styles.partnerName} />
    <ShimmerEffect style={styles.partnerStatus} />
  </View>
);

// Skeleton for list items
export const ListItemSkeleton = ({ count = 3 }) => (
  <View>
    {Array.from({ length: count }).map((_, index) => (
      <View key={index} style={styles.listItem}>
        <ShimmerEffect style={styles.listIcon} />
        <View style={styles.listContent}>
          <ShimmerEffect style={styles.listTitle} />
          <ShimmerEffect style={styles.listSubtitle} />
        </View>
      </View>
    ))}
  </View>
);

// Full screen loading skeleton
export const FullScreenSkeleton = () => (
  <View style={styles.fullScreen}>
    <ShimmerEffect style={styles.headerSkeleton} />
    <StatusCardSkeleton />
    <StatusCardSkeleton />
    <ListItemSkeleton count={2} />
  </View>
);

// Generic skeleton box
export const SkeletonBox = ({ width, height, borderRadius = 8, style }) => (
  <ShimmerEffect
    style={[
      {
        width,
        height,
        borderRadius,
      },
      style,
    ]}
  />
);

const styles = StyleSheet.create({
  shimmer: {
    backgroundColor: theme.colors.lightGray,
    borderRadius: 8,
  },
  statusCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.large,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    ...theme.shadows.level1,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  avatarSkeleton: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  statusInfo: {
    marginLeft: theme.spacing.md,
    flex: 1,
  },
  nameSkeleton: {
    width: '60%',
    height: 16,
    marginBottom: 8,
  },
  timeSkeleton: {
    width: '40%',
    height: 12,
  },
  contentSkeleton: {
    width: '100%',
    height: 14,
    marginBottom: 8,
  },
  contentSkeletonShort: {
    width: '70%',
    height: 14,
  },
  partnerCard: {
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  partnerAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: theme.spacing.md,
  },
  partnerName: {
    width: 120,
    height: 20,
    marginBottom: theme.spacing.sm,
  },
  partnerStatus: {
    width: 80,
    height: 14,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
  },
  listIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  listContent: {
    marginLeft: theme.spacing.md,
    flex: 1,
  },
  listTitle: {
    width: '70%',
    height: 16,
    marginBottom: 6,
  },
  listSubtitle: {
    width: '50%',
    height: 12,
  },
  fullScreen: {
    flex: 1,
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.background,
  },
  headerSkeleton: {
    width: '50%',
    height: 28,
    marginBottom: theme.spacing.xl,
    alignSelf: 'center',
  },
});

export default {
  StatusCardSkeleton,
  PartnerCardSkeleton,
  ListItemSkeleton,
  FullScreenSkeleton,
  SkeletonBox,
};
