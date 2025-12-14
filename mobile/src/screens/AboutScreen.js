import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  SafeAreaView,
} from 'react-native';
import Constants from 'expo-constants';
import { SugarbumLogo } from '../components';
import theme from '../theme';

const APP_VERSION = Constants.expoConfig?.version || '1.0.0';
const BUILD_NUMBER = Constants.expoConfig?.ios?.buildNumber || '1';

export default function AboutScreen({ navigation }) {
  const handleLinkPress = (url) => {
    Linking.openURL(url).catch((err) =>
      console.error('Failed to open URL:', err)
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Logo and Tagline */}
        <View style={styles.header}>
          <SugarbumLogo size={160} showSignals={true} />
          <Text style={styles.appName}>Sugarbum</Text>
          <Text style={styles.tagline}>Be together, apart</Text>
          <Text style={styles.version}>
            Version {APP_VERSION} ({BUILD_NUMBER})
          </Text>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.description}>
            Sugarbum helps couples stay connected no matter the distance. Share
            your location, send "miss you" moments, and create daily capsules
            of your relationship journey.
          </Text>
        </View>

        {/* Features */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Features</Text>
          <FeatureItem
            icon="📍"
            title="Location Sharing"
            description="See where your partner is with weather info"
          />
          <FeatureItem
            icon="💜"
            title="Miss You Button"
            description="Send instant love notifications"
          />
          <FeatureItem
            icon="📦"
            title="Daily Capsules"
            description="AI-generated relationship highlights"
          />
          <FeatureItem
            icon="🔒"
            title="Privacy Controls"
            description="You control what you share"
          />
        </View>

        {/* Credits */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Built With</Text>
          <Text style={styles.creditText}>React Native & Expo</Text>
          <Text style={styles.creditText}>Node.js & PostgreSQL</Text>
          <Text style={styles.creditText}>Deployed on Railway</Text>
        </View>

        {/* Links */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.linkButton}
            onPress={() => handleLinkPress('https://github.com/laurenj3250-debug/Bubbles-')}
          >
            <Text style={styles.linkText}>View on GitHub</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Made with 💜 for long-distance couples
          </Text>
          <Text style={styles.copyright}>
            © {new Date().getFullYear()} Sugarbum
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const FeatureItem = ({ icon, title, description }) => (
  <View style={styles.featureItem}>
    <Text style={styles.featureIcon}>{icon}</Text>
    <View style={styles.featureContent}>
      <Text style={styles.featureTitle}>{title}</Text>
      <Text style={styles.featureDescription}>{description}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.cream,
  },
  content: {
    padding: theme.spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing['2xl'],
  },
  appName: {
    fontSize: 32,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.navyText,
    marginTop: theme.spacing.lg,
  },
  tagline: {
    fontSize: 18,
    color: theme.colors.mediumGray,
    marginTop: theme.spacing.xs,
    fontStyle: 'italic',
  },
  version: {
    fontSize: 14,
    color: theme.colors.mediumGray,
    marginTop: theme.spacing.md,
  },
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.navyText,
    marginBottom: theme.spacing.md,
  },
  description: {
    fontSize: 16,
    color: theme.colors.mediumGray,
    lineHeight: 24,
    textAlign: 'center',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.medium,
    ...theme.shadows.level1,
  },
  featureIcon: {
    fontSize: 24,
    marginRight: theme.spacing.md,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.navyText,
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: theme.colors.mediumGray,
  },
  creditText: {
    fontSize: 14,
    color: theme.colors.mediumGray,
    marginBottom: 4,
  },
  linkButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.borderRadius.medium,
    alignItems: 'center',
  },
  linkText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  footer: {
    alignItems: 'center',
    marginTop: theme.spacing.xl,
    paddingTop: theme.spacing.xl,
    borderTopWidth: 1,
    borderTopColor: theme.colors.lightGray,
  },
  footerText: {
    fontSize: 14,
    color: theme.colors.mediumGray,
    marginBottom: theme.spacing.sm,
  },
  copyright: {
    fontSize: 12,
    color: theme.colors.mediumGray,
  },
});
