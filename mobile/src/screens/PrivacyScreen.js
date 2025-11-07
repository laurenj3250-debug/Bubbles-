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
} from 'react-native';
import api from '../config/api';

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
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadSettings();
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
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>‹ Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Privacy Controls</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8B5CF6" />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy Controls</Text>
      </View>

      <ScrollView style={styles.content}>
        {isPaused && (
          <View style={styles.pausedBanner}>
            <Text style={styles.pausedIcon}>⏸️</Text>
            <View style={styles.pausedInfo}>
              <Text style={styles.pausedTitle}>Sharing Paused</Text>
              <Text style={styles.pausedText}>
                Until {new Date(settings.paused_until).toLocaleString()}
              </Text>
            </View>
            <TouchableOpacity onPress={resumeSharing}>
              <Text style={styles.pausedButton}>Resume</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What to Share</Text>
          <Text style={styles.sectionDescription}>
            Control what information you share with your partner
          </Text>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingIcon}>📍</Text>
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>Location</Text>
                <Text style={styles.settingDescription}>
                  Share your location and weather
                </Text>
              </View>
            </View>
            <Switch
              value={settings.share_location}
              onValueChange={(value) => updateSetting('share_location', value)}
              trackColor={{ false: '#D1D5DB', true: '#C4B5FD' }}
              thumbColor={settings.share_location ? '#8B5CF6' : '#F3F4F6'}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingIcon}>🏃</Text>
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>Activity & Fitness</Text>
                <Text style={styles.settingDescription}>
                  Share steps, workouts, and health data
                </Text>
              </View>
            </View>
            <Switch
              value={settings.share_activity}
              onValueChange={(value) => updateSetting('share_activity', value)}
              trackColor={{ false: '#D1D5DB', true: '#C4B5FD' }}
              thumbColor={settings.share_activity ? '#8B5CF6' : '#F3F4F6'}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingIcon}>🎵</Text>
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>Music</Text>
                <Text style={styles.settingDescription}>
                  Share what you're listening to on Spotify
                </Text>
              </View>
            </View>
            <Switch
              value={settings.share_music}
              onValueChange={(value) => updateSetting('share_music', value)}
              trackColor={{ false: '#D1D5DB', true: '#C4B5FD' }}
              thumbColor={settings.share_music ? '#8B5CF6' : '#F3F4F6'}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingIcon}>📅</Text>
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>Calendar</Text>
                <Text style={styles.settingDescription}>
                  Share your calendar status and events
                </Text>
              </View>
            </View>
            <Switch
              value={settings.share_calendar}
              onValueChange={(value) => updateSetting('share_calendar', value)}
              trackColor={{ false: '#D1D5DB', true: '#C4B5FD' }}
              thumbColor={settings.share_calendar ? '#8B5CF6' : '#F3F4F6'}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingIcon}>📱</Text>
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>Device Context</Text>
                <Text style={styles.settingDescription}>
                  Share battery level and charging status
                </Text>
              </View>
            </View>
            <Switch
              value={settings.share_device_context}
              onValueChange={(value) => updateSetting('share_device_context', value)}
              trackColor={{ false: '#D1D5DB', true: '#C4B5FD' }}
              thumbColor={settings.share_device_context ? '#8B5CF6' : '#F3F4F6'}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
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
          <Text style={styles.infoTitle}>🔒 Your Privacy Matters</Text>
          <Text style={styles.infoText}>
            Bubbles is designed with privacy in mind. You have full control over what you
            share, and you can pause sharing anytime. Your data is never shared with
            anyone except your partner.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    backgroundColor: '#fff',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    fontSize: 18,
    color: '#8B5CF6',
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
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
  pausedBanner: {
    backgroundColor: '#FEF3C7',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
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
    color: '#92400E',
    marginBottom: 2,
  },
  pausedText: {
    fontSize: 13,
    color: '#92400E',
  },
  pausedButton: {
    color: '#8B5CF6',
    fontWeight: '600',
    fontSize: 14,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  settingRow: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  settingInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  settingIcon: {
    fontSize: 28,
    marginRight: 12,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 13,
    color: '#6B7280',
  },
  pauseButton: {
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#F59E0B',
  },
  pauseButtonText: {
    color: '#92400E',
    fontSize: 16,
    fontWeight: '600',
  },
  resumeButton: {
    backgroundColor: '#D1FAE5',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#10B981',
  },
  resumeButtonText: {
    color: '#065F46',
    fontSize: 16,
    fontWeight: '600',
  },
  infoBox: {
    backgroundColor: '#EDE9FE',
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#5B21B6',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#5B21B6',
    lineHeight: 20,
  },
});
