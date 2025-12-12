import React, { useState, useEffect } from 'react';
import * as ImagePicker from 'expo-image-picker';
import * as WebBrowser from 'expo-web-browser';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  SafeAreaView,
  StatusBar,
  Modal,
  TextInput,
  ActivityIndicator,
  Image
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from '../context/AuthContext';
import api from '../config/api';
import { BlobCard, WavePattern, AnimatedBlob, PatternBackground, GentleButton } from '../components';
import theme from '../theme';

export default function SettingsScreen({ navigation }) {
  const [user, setUser] = useState(null);
  const [nicknameModalVisible, setNicknameModalVisible] = useState(false);
  const [newNickname, setNewNickname] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [spotifyConnected, setSpotifyConnected] = useState(false);

  const { signOut } = React.useContext(AuthContext);

  useEffect(() => {
    loadUser();
    checkSpotifyStatus();
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

  const checkSpotifyStatus = async () => {
    try {
      const response = await api.get('/spotify/status');
      setSpotifyConnected(response.data.connected);
    } catch (error) {
      console.log('Spotify status check failed', error);
    }
  };

  const handlePickAvatar = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
        base64: true,
      });

      if (!result.canceled && result.assets[0].base64) {
        const base64Img = `data:image/jpeg;base64,${result.assets[0].base64}`;
        await updateAvatar(base64Img);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const updateAvatar = async (avatarUrl) => {
    setIsLoading(true);
    try {
      await api.put('/users/me', { avatar_url: avatarUrl });

      const updatedUser = { ...user, avatar_url: avatarUrl };
      setUser(updatedUser);
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));

      Alert.alert('Success', 'Profile picture updated!');
    } catch (error) {
      console.error('Avatar update error:', error);
      Alert.alert('Error', 'Failed to update profile picture');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateNickname = async () => {
    if (!newNickname.trim()) return;

    setIsLoading(true);
    try {
      await api.put('/partners/nickname', { nickname: newNickname });
      Alert.alert('Success', 'Partner nickname updated!');
      setNicknameModalVisible(false);
      setNewNickname('');
    } catch (error) {
      Alert.alert('Error', 'Failed to update nickname');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSpotifyPress = async () => {
    if (spotifyConnected) {
      Alert.alert(
        'Disconnect Spotify',
        'Are you sure you want to disconnect?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Disconnect',
            style: 'destructive',
            onPress: async () => {
              try {
                await api.delete('/spotify/disconnect');
                setSpotifyConnected(false);
                Alert.alert('Disconnected', 'Spotify disconnected');
              } catch (e) {
                Alert.alert('Error', 'Failed to disconnect');
              }
            }
          }
        ]
      );
    } else {
      try {
        const response = await api.get('/spotify/auth-url');
        if (response.data.url) {
          await WebBrowser.openBrowserAsync(response.data.url);
          // Check status after browser closes
          setTimeout(checkSpotifyStatus, 1000);
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to start Spotify connection');
      }
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
              <View style={styles.avatarPlaceholder}>
                {user.avatar_url ? (
                  <Image source={{ uri: user.avatar_url }} style={styles.avatarImage} />
                ) : (
                  <Text style={styles.avatarText}>{user.name.charAt(0)}</Text>
                )}
                <TouchableOpacity style={styles.editAvatarButton} onPress={handlePickAvatar}>
                  <Text style={styles.editAvatarIcon}>📷</Text>
                </TouchableOpacity>
              </View>
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
            onPress={() => setNicknameModalVisible(true)}
          >
            <Text style={styles.settingIcon}>🏷️</Text>
            <View style={styles.settingInfo}>
              <Text style={[theme.textStyles.body, styles.settingTitle]}>
                Partner Nickname
              </Text>
              <Text style={[theme.textStyles.bodySmall, styles.settingDescription]}>
                Give your partner a cute name
              </Text>
            </View>
            <Text style={styles.settingChevron}>›</Text>
          </TouchableOpacity>

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
            onPress={() => {
              Alert.alert(
                'Notifications',
                'Push notifications are enabled! You can manage notification settings in your device system settings.',
                [
                  { text: 'OK', style: 'default' }
                ]
              );
            }}
          >
            <Text style={styles.settingIcon}>🔔</Text>
            <View style={styles.settingInfo}>
              <Text style={[theme.textStyles.body, styles.settingTitle]}>
                Notifications
              </Text>
              <Text style={[theme.textStyles.bodySmall, styles.settingDescription]}>
                Push notifications are active
              </Text>
            </View>
            <Text style={styles.settingChevron}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={handleSpotifyPress}
          >
            <Text style={styles.settingIcon}>🎵</Text>
            <View style={styles.settingInfo}>
              <Text style={[theme.textStyles.body, styles.settingTitle]}>
                Spotify
              </Text>
              <Text style={[theme.textStyles.bodySmall, styles.settingDescription]}>
                {spotifyConnected ? 'Connected' : 'Connect to share music'}
              </Text>
            </View>
            <Text style={styles.settingChevron}>
              {spotifyConnected ? '✓' : '›'}
            </Text>
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

      {/* Nickname Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={nicknameModalVisible}
        onRequestClose={() => setNicknameModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={[theme.textStyles.h3, styles.modalTitle]}>Set Partner Nickname</Text>
            <Text style={[theme.textStyles.body, styles.modalSubtitle]}>
              What do you call them?
            </Text>

            <TextInput
              style={styles.textInput}
              placeholder="e.g. My Pookie <3"
              value={newNickname}
              onChangeText={setNewNickname}
              autoFocus
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setNicknameModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleUpdateNickname}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.saveButtonText}>Save</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: theme.colors.sageGreen,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
    position: 'relative',
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarText: {
    fontSize: 40,
    color: 'white',
    fontWeight: 'bold'
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: 'white',
    borderRadius: 18,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.lightGray,
    ...theme.shadows.level1
  },
  editAvatarIcon: {
    fontSize: 18
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    width: '100%',
    alignItems: 'center',
    ...theme.shadows.level2
  },
  modalTitle: {
    color: theme.colors.deepNavy,
    marginBottom: 5
  },
  modalSubtitle: {
    color: theme.colors.mediumGray,
    marginBottom: 20
  },
  textInput: {
    width: '100%',
    padding: 15,
    borderWidth: 1,
    borderColor: theme.colors.lightGray,
    borderRadius: 10,
    marginBottom: 20,
    fontSize: 16
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 10,
    width: '100%'
  },
  modalButton: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center'
  },
  cancelButton: {
    backgroundColor: theme.colors.lightGray
  },
  saveButton: {
    backgroundColor: theme.colors.deepTeal
  },
  cancelButtonText: {
    color: theme.colors.charcoal,
    fontWeight: 'bold'
  },
  saveButtonText: {
    color: 'white',
    fontWeight: 'bold'
  }
});
