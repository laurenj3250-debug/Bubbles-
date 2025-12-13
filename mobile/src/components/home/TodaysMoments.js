import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import theme from '../../theme';

export function TodaysMoments({ momentCount = 3 }) {
  return (
    <View style={styles.momentsSection}>
      <Text style={[theme.textStyles.h3, styles.sectionTitle]}>
        Today's Moments
      </Text>

      <View style={styles.timelineDots}>
        {[...Array(5)].map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              i < momentCount && styles.dotActive,
            ]}
          />
        ))}
      </View>

      <Text style={[theme.textStyles.bodySmall, styles.momentsText]}>
        {momentCount} moment{momentCount !== 1 ? 's' : ''} shared today
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  momentsSection: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    color: theme.colors.deepNavy,
    marginBottom: theme.spacing.lg,
  },
  timelineDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: theme.colors.lightGray,
  },
  dotActive: {
    backgroundColor: theme.colors.sageGreen,
  },
  momentsText: {
    color: theme.colors.mediumGray,
    textAlign: 'center',
  },
});
