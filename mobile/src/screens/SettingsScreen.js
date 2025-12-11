import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from '../context/AuthContext';
import api from '../config/api';
import { BlobCard, WavePattern, AnimatedBlob, PatternBackground } from '../components';
import theme from '../theme';

export default function SettingsScreen({ navigation }) {
  const [user, setUser] = useState(null);
  const { signOut } = React.useContext(AuthContext);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error('Load user error:', error);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await signOut();
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Multi-layered backgrounds */}
      <WavePattern color={theme.colors.slate} opacity={0.07} />
      <PatternBackground pattern="zigzag" color={theme.colors.deepTeal} opacity={0.05} size="medium" />
      <PatternBackground pattern="dots" color={theme.colors.warmYellow} opacity={0.04} size="small" />

      {/* Floating blobs */}
      <AnimatedBlob color={theme.colors.slate} size={230} opacity={0.14} shape="shape1" duration={26000} style={{ top: '-10%', left: '-15%' }} />
      <AnimatedBlob color={theme.colors.deepTeal} size={195} opacity={0.16} shape="shape3" duration={30000} style={{ top: '20%', right: '-12%' }} />
      <AnimatedBlob color={theme.colors.warmYellow} size={170} opacity={0.13} shape="shape5" duration={28000} style={{ bottom: '25%', left: '-9%' }} />
      <AnimatedBlob color={theme.colors.mutedPurple} size={155} opacity={0.15} shape="shape2" duration={24000} style={{ bottom: '5%', right: '83%' }} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[theme.textStyles.h2, styles.headerTitle]}>Settings</Text>
        </View>

        {/* User Info */}
        <View style={styles.section}>
          <Text style={[theme.textStyles.h3, styles.sectionTitle]}>Account</Text>
          {user && (
            <BlobCard style={styles.userCard}>
              <Text style={[theme.textStyles.h2, styles.userName]}>{user.name}</Text>
              <Text style={[theme.textStyles.body, styles.userEmail]}>{user.email}</Text>
            </BlobCard>
          )}
        </View>

        {/* Settings Options */}
        <View style={styles.section}>
          <Text style={[theme.textStyles.h3, styles.sectionTitle]}>Preferences</Text>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => navigation.navigate('Privacy')}
          >
            <Text style={styles.settingIcon}>🔒</Text>
            <View style={styles.settingInfo}>
              <Text style={[theme.textStyles.body, styles.settingTitle]}>
                Privacy Controls
              </Text>
              <Text style={[theme.textStyles.bodySmall, styles.settingDescription]}>
                Manage what you share with your partner
              </Text>
            </View>
            <Text style={styles.settingChevron}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => Alert.alert('Coming Soon', 'Notification settings will be available soon')}
          >
            <Text style={styles.settingIcon}>🔔</Text>
            <View style={styles.settingInfo}>
              <Text style={[theme.textStyles.body, styles.settingTitle]}>
                Notifications
              </Text>
              <Text style={[theme.textStyles.bodySmall, styles.settingDescription]}>
                Configure push notification preferences
              </Text>
            </View>
            <Text style={styles.settingChevron}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => Alert.alert('Coming Soon', 'Connected services coming soon')}
          >
            <Text style={styles.settingIcon}>🎵</Text>
            <View style={styles.settingInfo}>
              <Text style={[theme.textStyles.body, styles.settingTitle]}>
                Connected Services
              </Text>
              <Text style={[theme.textStyles.bodySmall, styles.settingDescription]}>
                Manage Spotify and other integrations
              </Text>
            </View>
            <Text style={styles.settingChevron}>›</Text>
          </TouchableOpacity>
        </View>

        {/* About */}
        <View style={styles.section}>
          <Text style={[theme.textStyles.h3, styles.sectionTitle]}>About</Text>

          <BlobCard style={styles.aboutCard}>
            <Text style={styles.aboutTitle}>💕 Sugarbum</Text>
            <Text style={[theme.textStyles.bodySmall, styles.aboutVersion]}>
              Version 1.0.0
            </Text>
            <Text style={[theme.textStyles.body, styles.aboutDescription]}>
              Stay connected with your person through automatic life signals
            </Text>
          </BlobCard>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={[theme.textStyles.body, styles.logoutButtonText]}>Logout</Text>
        </TouchableOpacity>
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
  headerTitle: {
    color: theme.colors.deepNavy,
  },
  section: {
    marginBottom: theme.spacing['2xl'],
  },
  sectionTitle: {
    color: theme.colors.deepNavy,
    marginBottom: theme.spacing.lg,
  },
  userCard: {
    alignItems: 'center',
  },
  userName: {
    color: theme.colors.deepNavy,
    textAlign: 'center',
    marginBottom: theme.spacing.xs,
  },
  userEmail: {
    color: theme.colors.mediumGray,
    textAlign: 'center',
  },
  settingItem: {
    backgroundColor: theme.colors.offWhite,
    borderRadius: theme.borderRadius.medium,
    padding: theme.spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    borderWidth: 2,
    borderColor: theme.colors.lightGray,
    ...theme.shadows.level1,
  },
  settingIcon: {
    fontSize: 28,
    marginRight: theme.spacing.md,
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    color: theme.colors.deepNavy,
    fontWeight: theme.typography.fontWeight.semibold,
    marginBottom: theme.spacing.xs,
  },
  settingDescription: {
    color: theme.colors.mediumGray,
  },
  settingChevron: {
    fontSize: 24,
    color: theme.colors.mediumGray,
  },
  aboutCard: {
    alignItems: 'center',
  },
  aboutTitle: {
    fontSize: 40,
    marginBottom: theme.spacing.md,
  },
  aboutVersion: {
    color: theme.colors.mediumGray,
    marginBottom: theme.spacing.lg,
  },
  aboutDescription: {
    color: theme.colors.charcoal,
    textAlign: 'center',
  },
  logoutButton: {
    backgroundColor: theme.colors.offWhite,
    borderRadius: theme.borderRadius.medium,
    padding: theme.spacing.lg,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.colors.dustyRose,
    marginBottom: theme.spacing['2xl'],
  },
  logoutButtonText: {
    color: theme.colors.dustyRose,
    fontWeight: theme.typography.fontWeight.semibold,
  },
});
