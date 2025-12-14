import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import theme from '../theme';
import { HeartIcon } from './TabBarIcons';

// Calculate time remaining until target date
const calculateTimeLeft = (targetDate) => {
  const difference = new Date(targetDate) - new Date();

  if (difference <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isComplete: true };
  }

  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / (1000 * 60)) % 60),
    seconds: Math.floor((difference / 1000) % 60),
    isComplete: false,
  };
};

// Main countdown timer component
export const CountdownTimer = ({
  targetDate,
  title = "Until we meet",
  onComplete,
  showSeconds = true,
  compact = false,
}) => {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(targetDate));

  useEffect(() => {
    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft(targetDate);
      setTimeLeft(newTimeLeft);

      if (newTimeLeft.isComplete && onComplete) {
        onComplete();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate, onComplete]);

  if (timeLeft.isComplete) {
    return (
      <View style={[styles.container, compact && styles.containerCompact]}>
        <HeartIcon size={32} color={theme.colors.logoHeart} />
        <Text style={styles.completeText}>Together at last!</Text>
      </View>
    );
  }

  if (compact) {
    return (
      <View style={styles.containerCompact}>
        <Text style={styles.compactTitle}>{title}</Text>
        <Text style={styles.compactTime}>
          {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.timerRow}>
        <TimeUnit value={timeLeft.days} label="Days" />
        <Text style={styles.separator}>:</Text>
        <TimeUnit value={timeLeft.hours} label="Hours" />
        <Text style={styles.separator}>:</Text>
        <TimeUnit value={timeLeft.minutes} label="Mins" />
        {showSeconds && (
          <>
            <Text style={styles.separator}>:</Text>
            <TimeUnit value={timeLeft.seconds} label="Secs" />
          </>
        )}
      </View>
      <HeartIcon size={24} color={theme.colors.logoHeart} />
    </View>
  );
};

// Individual time unit display
const TimeUnit = ({ value, label }) => (
  <View style={styles.timeUnit}>
    <Text style={styles.timeValue}>{String(value).padStart(2, '0')}</Text>
    <Text style={styles.timeLabel}>{label}</Text>
  </View>
);

// Card version for HomeScreen
export const CountdownCard = ({ targetDate, title, onPress, onEdit }) => {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(targetDate));

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(targetDate));
    }, 60000); // Update every minute for card view

    return () => clearInterval(timer);
  }, [targetDate]);

  if (!targetDate) {
    return (
      <TouchableOpacity style={styles.card} onPress={onEdit}>
        <View style={styles.cardContent}>
          <HeartIcon size={32} color={theme.colors.dustyRose} />
          <Text style={styles.cardTitle}>Set a countdown</Text>
          <Text style={styles.cardSubtitle}>
            When will you see your partner next?
          </Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{title || "Until we meet"}</Text>
        {timeLeft.isComplete ? (
          <View style={styles.cardComplete}>
            <HeartIcon size={32} color={theme.colors.logoHeart} />
            <Text style={styles.cardCompleteText}>Today's the day!</Text>
          </View>
        ) : (
          <View style={styles.cardTimer}>
            <Text style={styles.cardDays}>{timeLeft.days}</Text>
            <Text style={styles.cardDaysLabel}>days</Text>
            <Text style={styles.cardHours}>
              {timeLeft.hours}h {timeLeft.minutes}m
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.large,
    padding: theme.spacing.xl,
    alignItems: 'center',
    ...theme.shadows.level2,
  },
  containerCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.medium,
    padding: theme.spacing.md,
  },
  title: {
    fontSize: 16,
    color: theme.colors.mediumGray,
    marginBottom: theme.spacing.md,
    fontWeight: theme.typography.fontWeight.medium,
  },
  timerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  timeUnit: {
    alignItems: 'center',
    minWidth: 50,
  },
  timeValue: {
    fontSize: 32,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.navyText,
  },
  timeLabel: {
    fontSize: 12,
    color: theme.colors.mediumGray,
    marginTop: 4,
  },
  separator: {
    fontSize: 28,
    color: theme.colors.dustyRose,
    marginHorizontal: 4,
  },
  completeText: {
    fontSize: 20,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.logoHeart,
    marginTop: theme.spacing.md,
  },
  compactTitle: {
    fontSize: 14,
    color: theme.colors.mediumGray,
  },
  compactTime: {
    fontSize: 16,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.navyText,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.large,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    ...theme.shadows.level1,
  },
  cardContent: {
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 14,
    color: theme.colors.mediumGray,
    marginBottom: theme.spacing.sm,
  },
  cardSubtitle: {
    fontSize: 12,
    color: theme.colors.mediumGray,
    marginTop: theme.spacing.xs,
  },
  cardTimer: {
    alignItems: 'center',
  },
  cardDays: {
    fontSize: 48,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primary,
  },
  cardDaysLabel: {
    fontSize: 16,
    color: theme.colors.mediumGray,
    marginTop: -4,
  },
  cardHours: {
    fontSize: 14,
    color: theme.colors.mediumGray,
    marginTop: theme.spacing.xs,
  },
  cardComplete: {
    alignItems: 'center',
  },
  cardCompleteText: {
    fontSize: 18,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.logoHeart,
    marginTop: theme.spacing.sm,
  },
});

export default CountdownTimer;
