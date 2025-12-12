import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Switch,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import api from '../config/api';
import { BlobCard, WavePattern, AnimatedBlob, PatternBackground } from '../components';
import theme from '../theme';

import {
  startBackgroundLocation,
  stopBackgroundLocation,
  checkTrackingStatus
} from '../services/LocationService';

export default function PrivacyScreen({ navigation }) {
  const [settings, setSettings] = useState({
    share_location: true,
    share_activity: true,
    share_music: true,
    share_calendar: true,
    share_device_context: true,
    paused_until: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [backgroundLocationEnabled, setBackgroundLocationEnabled] = useState(false);

  useEffect(() => {
    loadSettings();
    checkTrackingStatus().then(setBackgroundLocationEnabled);
  }, []);

  const loadSettings = async () => {
    try {
      const response = await api.get('/privacy');
      setSettings(response.data);
    } catch (error) {
      console.error('Load settings error:', error);
      Alert.alert('Error', 'Failed to load privacy settings');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleBackgroundLocation = async (value) => {
    if (value) {
      const success = await startBackgroundLocation();
      setBackgroundLocationEnabled(success);
    } else {
      await stopBackgroundLocation();
      setBackgroundLocationEnabled(false);
    }
  };

  const updateSetting = async (key, value) => {
    try {
      // Convert snake_case to camelCase for API
      const camelKey = key.replace(/_([a-z])/g, (g) => g[1].toUpperCase());

      await api.put('/privacy', { [camelKey]: value });

      setSettings((prev) => ({ ...prev, [key]: value }));
    } catch (error) {
      console.error('Update setting error:', error);
      Alert.alert('Error', 'Failed to update setting');
    }
  };

  const pauseSharing = () => {
    Alert.alert(
      'Pause Sharing',
      'How long would you like to pause all sharing?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: '1 hour', onPress: () => confirmPause(1) },
        { text: '4 hours', onPress: () => confirmPause(4) },
        { text: '8 hours', onPress: () => confirmPause(8) },
        { text: '24 hours', onPress: () => confirmPause(24) },
      ]
    );
  };

  const confirmPause = async (hours) => {
    try {
      const response = await api.post('/privacy/pause', { hours });
      setSettings((prev) => ({ ...prev, paused_until: response.data.pausedUntil }));
      Alert.alert('Success', `Sharing paused for ${hours} hour${hours > 1 ? 's' : ''}`);
    } catch (error) {
      console.error('Pause sharing error:', error);
      Alert.alert('Error', 'Failed to pause sharing');
    }
  };

  const resumeSharing = async () => {
    try {
      await api.post('/privacy/resume');
      setSettings((prev) => ({ ...prev, paused_until: null }));
      Alert.alert('Success', 'Sharing resumed');
    } catch (error) {
      console.error('Resume sharing error:', error);
      Alert.alert('Error', 'Failed to resume sharing');
    }
  };

  const isPaused = settings.paused_until && new Date(settings.paused_until) > new Date();

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <WavePattern color={theme.colors.sageGreen} opacity={0.08} />
        <View style={styles.loadingContainer}>
          <Text style={[theme.textStyles.h3, styles.loadingText]}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Multi-layered backgrounds */}
      <WavePattern color={theme.colors.mutedPurple} opacity={0.07} />
      <PatternBackground pattern="triangles" color={theme.colors.softCoral} opacity={0.05} size="large" />
      <PatternBackground pattern="grid" color={theme.colors.teal} opacity={0.04} size="medium" />

      {/* Floating blobs */}
      <AnimatedBlob color={theme.colors.mutedPurple} size={220} opacity={0.15} shape="shape4" duration={29000} style={{ top: '-9%', right: '-14%' }} />
      <AnimatedBlob color={theme.colors.softCoral} size={185} opacity={0.17} shape="shape1" duration={27000} style={{ top: '25%', left: '-11%' }} />
      <AnimatedBlob color={theme.colors.teal} size={165} opacity={0.14} shape="shape3" duration={31000} style={{ bottom: '18%', right: '-7%' }} />
      <AnimatedBlob color={theme.colors.mossGreen} size={145} opacity={0.16} shape="shape5" duration={25000} style={{ bottom: '45%', left: '84%' }} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={[theme.textStyles.body, styles.backButton]}>‹ Back</Text>
          </TouchableOpacity>
          <Text style={[theme.textStyles.h2, styles.headerTitle]}>Privacy Controls</Text>
          <Text style={[theme.textStyles.bodySmall, styles.headerSubtitle]}>
            Control what you share
          </Text>
        </View>

        {isPaused && (
          <BlobCard style={styles.pausedBanner}>
            <View style={styles.pausedContent}>
              <Text style={styles.pausedIcon}>⏸️</Text>
              <View style={styles.pausedInfo}>
                <Text style={[theme.textStyles.body, styles.pausedTitle]}>Sharing Paused</Text>
                <Text style={[theme.textStyles.bodySmall, styles.pausedText]}>
                  Until {new Date(settings.paused_until).toLocaleString()}
                </Text>
              </View>
              <TouchableOpacity onPress={resumeSharing}>
                <Text style={[theme.textStyles.bodySmall, styles.pausedButton]}>Resume</Text>
              </TouchableOpacity>
            </View>
          </BlobCard>
        )}

        <View style={styles.section}>
          <Text style={[theme.textStyles.h3, styles.sectionTitle]}>What to Share</Text>
          <Text style={[theme.textStyles.bodySmall, styles.sectionDescription]}>
            Control what information you share with your partner
          </Text>

          {/* Background Location Toggle */}
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingIcon}>🛰️</Text>
              <View style={styles.settingText}>
                <Text style={[theme.textStyles.body, styles.settingTitle]}>Background Updates</Text>
                <Text style={[theme.textStyles.bodySmall, styles.settingDescription]}>
                  Update location even when app is closed ('Always' permission required)
                </Text>
              </View>
            </View>
            <Switch
              value={backgroundLocationEnabled}
              onValueChange={toggleBackgroundLocation}
              trackColor={{ false: theme.colors.lightGray, true: theme.colors.sageGreen }}
              thumbColor={backgroundLocationEnabled ? theme.colors.deepNavy : theme.colors.offWhite}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingIcon}>📍</Text>
              <View style={styles.settingText}>
                <Text style={[theme.textStyles.body, styles.settingTitle]}>Live Location</Text>
                <Text style={[theme.textStyles.bodySmall, styles.settingDescription]}>
                  Share your location and weather
                </Text>
              </View>
            </View>
            <Switch
              value={settings.share_location}
              onValueChange={(value) => updateSetting('share_location', value)}
              trackColor={{ false: theme.colors.lightGray, true: theme.colors.sageGreen }}
              thumbColor={settings.share_location ? theme.colors.deepNavy : theme.colors.offWhite}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingIcon}>🏃</Text>
              <View style={styles.settingText}>
                <Text style={[theme.textStyles.body, styles.settingTitle]}>Activity & Fitness</Text>
                <Text style={[theme.textStyles.bodySmall, styles.settingDescription]}>
                  Share steps, workouts, and health data
                </Text>
              </View>
            </View>
            <Switch
              value={settings.share_activity}
              onValueChange={(value) => updateSetting('share_activity', value)}
              trackColor={{ false: theme.colors.lightGray, true: theme.colors.primaryLight }}
              thumbColor={settings.share_activity ? theme.colors.primary : theme.colors.offWhite}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingIcon}>🎵</Text>
              <View style={styles.settingText}>
                <Text style={[theme.textStyles.body, styles.settingTitle]}>Music</Text>
                <Text style={[theme.textStyles.bodySmall, styles.settingDescription]}>
                  Share what you're listening to on Spotify
                </Text>
              </View>
            </View>
            <Switch
              value={settings.share_music}
              onValueChange={(value) => updateSetting('share_music', value)}
              trackColor={{ false: theme.colors.lightGray, true: theme.colors.primaryLight }}
              thumbColor={settings.share_music ? theme.colors.primary : theme.colors.offWhite}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingIcon}>📅</Text>
              <View style={styles.settingText}>
                <Text style={[theme.textStyles.body, styles.settingTitle]}>Calendar</Text>
                <Text style={[theme.textStyles.bodySmall, styles.settingDescription]}>
                  Share your calendar status and events
                </Text>
              </View>
            </View>
            <Switch
              value={settings.share_calendar}
              onValueChange={(value) => updateSetting('share_calendar', value)}
              trackColor={{ false: theme.colors.lightGray, true: theme.colors.primaryLight }}
              thumbColor={settings.share_calendar ? theme.colors.primary : theme.colors.offWhite}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingIcon}>📱</Text>
              <View style={styles.settingText}>
                <Text style={[theme.textStyles.body, styles.settingTitle]}>Device Context</Text>
                <Text style={[theme.textStyles.bodySmall, styles.settingDescription]}>
                  Share battery level and charging status
                </Text>
              </View>
            </View>
            <Switch
              value={settings.share_device_context}
              onValueChange={(value) => updateSetting('share_device_context', value)}
              trackColor={{ false: theme.colors.lightGray, true: theme.colors.primaryLight }}
              thumbColor={settings.share_device_context ? theme.colors.primary : theme.colors.offWhite}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[theme.textStyles.h3, styles.sectionTitle]}>Quick Actions</Text>
          {!isPaused ? (
            <TouchableOpacity style={styles.pauseButton} onPress={pauseSharing}>
              <Text style={styles.pauseButtonText}>⏸️ Pause All Sharing</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.resumeButton} onPress={resumeSharing}>
              <Text style={styles.resumeButtonText}>▶️ Resume Sharing</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.infoBox}>
          <Text style={[theme.textStyles.body, styles.infoTitle]}>🔒 Your Privacy Matters</Text>
          <Text style={[theme.textStyles.bodySmall, styles.infoText]}>
            Sugarbum is designed with privacy in mind. You have full control over what you
            share, and you can pause sharing anytime. Your data is never shared with
            anyone except your partner.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.cream,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing['2xl'],
    paddingBottom: theme.spacing['4xl'],
  },
  header: {
    marginBottom: theme.spacing.xl,
  },
  backButton: {
    fontSize: 18,
    color: theme.colors.primary,
    marginBottom: theme.spacing.sm,
  },
  headerTitle: {
    color: theme.colors.deepNavy,
    marginBottom: theme.spacing.xs,
  },
  headerSubtitle: {
    color: theme.colors.mediumGray,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: theme.colors.mediumGray,
  },
  pausedBanner: {
    marginBottom: theme.spacing.xl,
  },
  pausedContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pausedIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  pausedInfo: {
    flex: 1,
  },
  pausedTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.deepNavy,
    marginBottom: 2,
  },
  pausedText: {
    fontSize: 13,
    color: theme.colors.deepNavy,
  },
  pausedButton: {
    color: theme.colors.primary,
    fontWeight: '600',
    fontSize: 14,
  },
  section: {
    marginBottom: theme.spacing['2xl'],
  },
  sectionTitle: {
    color: theme.colors.deepNavy,
    marginBottom: theme.spacing.sm,
  },
  sectionDescription: {
    color: theme.colors.mediumGray,
    marginBottom: theme.spacing.lg,
  },
  settingRow: {
    backgroundColor: theme.colors.offWhite,
    borderRadius: theme.borderRadius.medium,
    padding: theme.spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    borderWidth: 2,
    borderColor: theme.colors.lightGray,
    ...theme.shadows.level1,
  },
  settingInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: theme.spacing.lg,
  },
  settingIcon: {
    fontSize: 28,
    marginRight: theme.spacing.md,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    color: theme.colors.deepNavy,
    fontWeight: theme.typography.fontWeight.semibold,
    marginBottom: 2,
  },
  settingDescription: {
    color: theme.colors.mediumGray,
  },
  pauseButton: {
    backgroundColor: theme.colors.offWhite,
    borderRadius: theme.borderRadius.medium,
    padding: theme.spacing.lg,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.colors.warning,
  },
  pauseButtonText: {
    color: theme.colors.deepNavy,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  resumeButton: {
    backgroundColor: theme.colors.offWhite,
    borderRadius: theme.borderRadius.medium,
    padding: theme.spacing.lg,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.colors.success,
  },
  resumeButtonText: {
    color: theme.colors.success,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  infoBox: {
    backgroundColor: theme.colors.offWhite,
    borderRadius: theme.borderRadius.medium,
    padding: theme.spacing.xl,
    marginBottom: theme.spacing['2xl'],
    borderWidth: 2,
    borderColor: theme.colors.primaryLight,
    ...theme.shadows.level1,
  },
  infoTitle: {
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeight.semibold,
    marginBottom: theme.spacing.sm,
  },
  infoText: {
    color: theme.colors.deepNavy,
    lineHeight: 20,
  },
});
