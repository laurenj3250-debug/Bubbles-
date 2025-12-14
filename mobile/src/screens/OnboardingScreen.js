import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SugarbumLogo, SugarbumIcon } from '../components';
import { HeartIcon, HomeIcon, PartnerIcon } from '../components';
import theme from '../theme';
import haptics from '../utils/haptics';

const { width, height } = Dimensions.get('window');

const ONBOARDING_SLIDES = [
  {
    id: '1',
    title: 'Welcome to Sugarbum',
    subtitle: 'Be together, apart',
    description: 'Stay connected with your partner no matter the distance. Share moments, locations, and love throughout your day.',
    icon: 'logo',
  },
  {
    id: '2',
    title: 'Share Your World',
    subtitle: 'Location & Weather',
    description: 'Let your partner know where you are and what the weather is like. Perfect for long-distance relationships.',
    icon: 'home',
  },
  {
    id: '3',
    title: 'Send Love Instantly',
    subtitle: 'Miss You Button',
    description: 'Feeling lonely? Tap the Miss You button to send your partner an instant notification and let them know you\'re thinking of them.',
    icon: 'heart',
  },
  {
    id: '4',
    title: 'Daily Memories',
    subtitle: 'Capsules',
    description: 'Every day, we create a beautiful capsule of your shared moments. Look back on your journey together anytime.',
    icon: 'partner',
  },
];

const OnboardingSlide = ({ item }) => {
  const renderIcon = () => {
    switch (item.icon) {
      case 'logo':
        return <SugarbumLogo size={160} showSignals={true} />;
      case 'home':
        return (
          <View style={styles.iconCircle}>
            <HomeIcon size={64} color={theme.colors.primary} focused />
          </View>
        );
      case 'heart':
        return (
          <View style={[styles.iconCircle, { backgroundColor: `${theme.colors.logoHeart}20` }]}>
            <HeartIcon size={64} color={theme.colors.logoHeart} />
          </View>
        );
      case 'partner':
        return (
          <View style={styles.iconCircle}>
            <PartnerIcon size={64} color={theme.colors.primary} focused />
          </View>
        );
      default:
        return <SugarbumIcon size={80} />;
    }
  };

  return (
    <View style={styles.slide}>
      <View style={styles.iconContainer}>{renderIcon()}</View>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.subtitle}>{item.subtitle}</Text>
      <Text style={styles.description}>{item.description}</Text>
    </View>
  );
};

export default function OnboardingScreen({ onComplete }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);

  const handleNext = () => {
    haptics.light();
    if (currentIndex < ONBOARDING_SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    } else {
      handleComplete();
    }
  };

  const handleSkip = () => {
    haptics.light();
    handleComplete();
  };

  const handleComplete = async () => {
    haptics.success();
    try {
      await AsyncStorage.setItem('hasOnboarded', 'true');
    } catch (error) {
      console.error('Error saving onboarding state:', error);
    }
    onComplete?.();
  };

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index || 0);
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const isLastSlide = currentIndex === ONBOARDING_SLIDES.length - 1;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        {!isLastSlide && (
          <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        ref={flatListRef}
        data={ONBOARDING_SLIDES}
        renderItem={({ item }) => <OnboardingSlide item={item} />}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        bounces={false}
      />

      {/* Pagination dots */}
      <View style={styles.pagination}>
        {ONBOARDING_SLIDES.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              currentIndex === index && styles.dotActive,
            ]}
          />
        ))}
      </View>

      {/* Navigation button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.button, isLastSlide && styles.buttonPrimary]}
          onPress={handleNext}
        >
          <Text style={[styles.buttonText, isLastSlide && styles.buttonTextPrimary]}>
            {isLastSlide ? 'Get Started' : 'Next'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.cream,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: theme.spacing.lg,
  },
  skipButton: {
    padding: theme.spacing.sm,
  },
  skipText: {
    color: theme.colors.mediumGray,
    fontSize: 16,
  },
  slide: {
    width,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing['2xl'],
  },
  iconContainer: {
    marginBottom: theme.spacing['2xl'],
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: `${theme.colors.primary}20`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.navyText,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    fontSize: 18,
    color: theme.colors.primary,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
    fontWeight: theme.typography.fontWeight.medium,
  },
  description: {
    fontSize: 16,
    color: theme.colors.mediumGray,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: theme.spacing.lg,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.lightGray,
    marginHorizontal: 4,
  },
  dotActive: {
    backgroundColor: theme.colors.primary,
    width: 24,
  },
  footer: {
    paddingHorizontal: theme.spacing['2xl'],
    paddingBottom: theme.spacing['2xl'],
  },
  button: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.large,
    paddingVertical: theme.spacing.lg,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  buttonPrimary: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  buttonText: {
    color: theme.colors.primary,
    fontSize: 18,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  buttonTextPrimary: {
    color: '#FFFFFF',
  },
});
