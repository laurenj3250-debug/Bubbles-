import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
  SafeAreaView,
  StatusBar,
  PanResponder,
} from 'react-native';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../config/api';
import { database } from '../config/firebase';
import { ref, onValue, off, set } from 'firebase/database';
import { GentleButton, WavePattern, AnimatedBlob, PatternBackground, StatusCard, QuickActions } from '../components';
import { LoveBombOverlay } from '../components/LoveBombOverlay';
import { TouchOverlay } from '../components/TouchOverlay';
import theme from '../theme';

export default function HomeScreen({ navigation }) {
  const [user, setUser] = useState(null);
  const [partner, setPartner] = useState(null);
  const [signals, setSignals] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSharing, setIsSharing] = useState(false);
  const [lastSeen, setLastSeen] = useState(null);
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
      }

      await Promise.all([fetchPartner(), fetchSignals()]);
    } catch (error) {
      console.error('Load data error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Firebase real-time listener for partner status
  useEffect(() => {
    if (!partner) return;

    // Subscribe to partner's real-time status
    const statusRef = ref(database, `users/${partner.id}/status`);

    const unsubscribe = onValue(statusRef, (snapshot) => {
      const realtimeStatus = snapshot.val();

      if (realtimeStatus) {
        // Update signals with real-time data
        setSignals(prevSignals => ({
          ...prevSignals,
          location: realtimeStatus.location || prevSignals?.location,
          activity: realtimeStatus.activity || prevSignals?.activity,
          music: realtimeStatus.music || prevSignals?.music,
          device: realtimeStatus.device || prevSignals?.device,
        }));

        // Determine last seen and online status
        const mostRecentTimestamp = Math.max(
          realtimeStatus.location?.timestamp || 0,
          realtimeStatus.activity?.timestamp || 0,
          realtimeStatus.music?.timestamp || 0,
          realtimeStatus.device?.timestamp || 0
        );

        if (mostRecentTimestamp) {
          setLastSeen(mostRecentTimestamp);
          // Consider online if activity within last 5 minutes
          const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
          setIsOnline(mostRecentTimestamp > fiveMinutesAgo);
        }
      }
    });

    // Cleanup listener on unmount
    return () => off(statusRef);
  }, [partner]);

  // Firebase listener for Love Bombs (Miss You)
  const [showLoveBomb, setShowLoveBomb] = useState(false);
  const lastBombTime = React.useRef(0);

  useEffect(() => {
    if (!partner) return;
    const inboxRef = ref(database, `users/${user.id}/inbox/miss_you`);

    const unsubscribe = onValue(inboxRef, (snapshot) => {
      const data = snapshot.val();
      if (data && data.timestamp > lastBombTime.current) {
        // Only show if it's a new signal (timestamp > last seen)
        // And prevent showing it immediately on load if it's old (e.g. > 1 min ago)
        const isRecent = Date.now() - data.timestamp < 60000;

        if (isRecent) {
          setShowLoveBomb(true);
        }
        lastBombTime.current = data.timestamp;
      }
    });

    return () => off(inboxRef);
  }, [user, partner]);

  // Digital Touch Logic
  const [isTouchMode, setIsTouchMode] = useState(false);
  const [myTouchPos, setMyTouchPos] = useState(null);
  const touchThrottle = React.useRef(0);

  const updateMyTouch = (x, y) => {
    setMyTouchPos(x ? { x, y } : null);

    // Push to Firebase (Throttle 100ms)
    const now = Date.now();
    if (now - touchThrottle.current > 100 || !x) {
      const refPath = `users/${user.id}/status/touch`;
      if (x) {
        set(ref(database, refPath), { x, y, timestamp: now });
      } else {
        set(ref(database, refPath), null);
      }
      touchThrottle.current = now;
    }
  };

  const panResponder = React.useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => updateMyTouch(evt.nativeEvent.pageX, evt.nativeEvent.pageY),
      onPanResponderMove: (evt) => updateMyTouch(evt.nativeEvent.pageX, evt.nativeEvent.pageY),
      onPanResponderRelease: () => updateMyTouch(null, null),
      onPanResponderTerminate: () => updateMyTouch(null, null),
    })
  ).current;

  useEffect(() => {
    // If we turn off touch mode, clear our status
    if (!isTouchMode) {
      const refPath = `users/${user.id}/status/touch`;
      set(ref(database, refPath), null);
    }
  }, [isTouchMode]);

  const fetchPartner = async () => {
    try {
      const response = await api.get('/partners/current');
      setPartner(response.data.partner);
    } catch (error) {
      console.error('Fetch partner error:', error);
    }
  };

  const fetchSignals = async () => {
    try {
      const response = await api.get('/signals/partner/all');
      setSignals(response.data.signals);
    } catch (error) {
      console.error('Fetch signals error:', error);
      if (error.response?.status === 404) {
        // No partner yet
        setSignals(null);
      }
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchPartner(), fetchSignals()]);
    setRefreshing(false);
  };

  const shareLocation = async () => {
    try {
      setIsSharing(true);

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Permission to access location was denied');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});

      // Get readable address
      let placeName = '';
      try {
        const address = await Location.reverseGeocodeAsync({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude
        });

        if (address.length > 0) {
          const addr = address[0];
          placeName = addr.name || addr.street || addr.city;
        }
      } catch (e) {
        console.log('Geocoding failed', e);
      }

      await api.post('/signals/location', {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy,
        placeName: placeName || 'Unknown Location',
        placeType: 'current'
      });

      Alert.alert(
        '📍 Location Shared',
        `Your partner can now see you${placeName ? ` at ${placeName}` : ''}!`,
        [{ text: 'OK' }]
      );

    } catch (error) {
      console.error('Share location error:', error);
      const errorMessage = error.response?.data?.error || 'Could not share location. Please check your connection and try again.';
      Alert.alert('Unable to Share Location', errorMessage, [
        { text: 'OK', style: 'cancel' }
      ]);
    } finally {
      setIsSharing(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <WavePattern color={theme.colors.dustyRose} opacity={0.08} />
        <View style={styles.loadingContainer}>
          <Text style={[theme.textStyles.h3, styles.loadingText]}>Loading Sugarbum...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!partner) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <WavePattern color={theme.colors.dustyRose} opacity={0.08} />
        <ScrollView
          contentContainerStyle={styles.emptyContainer}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          <Text style={styles.emptyIcon}>💑</Text>
          <Text style={[theme.textStyles.h2, styles.emptyTitle]}>No Partner Yet</Text>
          <Text style={[theme.textStyles.body, styles.emptyText]}>
            Connect with your sugarbum to start sharing your daily moments
          </Text>
          <GentleButton
            title="Find Your Partner"
            onPress={() => navigation.navigate('Partner')}
            variant="primary"
            size="large"
          />
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Layered decorative backgrounds - multiple patterns */}
      <WavePattern color={theme.colors.sageGreen} opacity={0.06} />
      <PatternBackground pattern="dots" color={theme.colors.teal} opacity={0.05} size="small" />
      <PatternBackground pattern="diagonal-lines" color={theme.colors.lavender} opacity={0.04} size="large" />
      <PatternBackground pattern="cross-dots" color={theme.colors.slate} opacity={0.03} size="medium" />

      {/* Floating animated blobs */}
      <AnimatedBlob color={theme.colors.teal} size={220} opacity={0.18} shape="shape1" duration={25000} style={{ top: '-5%', right: '-15%' }} />
      <AnimatedBlob color={theme.colors.lavender} size={180} opacity={0.2} shape="shape2" duration={30000} style={{ top: '15%', left: '-10%' }} />
      <AnimatedBlob color={theme.colors.sageGreen} size={160} opacity={0.15} shape="shape3" duration={22000} style={{ top: '35%', right: '-8%' }} />
      <AnimatedBlob color={theme.colors.slate} size={200} opacity={0.12} shape="shape4" duration={28000} style={{ top: '55%', left: '-12%' }} />
      <AnimatedBlob color={theme.colors.mutedPurple} size={140} opacity={0.16} shape="shape5" duration={24000} style={{ bottom: '25%', right: '-5%' }} />
      <AnimatedBlob color={theme.colors.peach} size={170} opacity={0.14} shape="shape2" duration={26000} style={{ bottom: '10%', left: '-8%' }} />
      <AnimatedBlob color={theme.colors.mossGreen} size={130} opacity={0.18} shape="shape3" duration={23000} style={{ bottom: '40%', right: '80%' }} />
      <AnimatedBlob color={theme.colors.deepTeal} size={150} opacity={0.13} shape="shape1" duration={27000} style={{ top: '70%', right: '-6%' }} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View>
              <Text style={[theme.textStyles.h2, styles.headerTitle]}>
                {partner.display_name || partner.name}'s Now
              </Text>
              <Text style={[theme.textStyles.bodySmall, styles.headerSubtitle]}>
                See what they're up to
              </Text>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('Capsule')} style={{ padding: 8 }}>
              <Text style={{ fontSize: 28 }}>💊</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setIsTouchMode(!isTouchMode)}
              style={{ padding: 8, backgroundColor: isTouchMode ? theme.colors.primary + '20' : 'transparent', borderRadius: 20 }}
            >
              <Text style={{ fontSize: 28 }}>👆</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Digital Touch Surface (Only active when mode is on) */}
        {isTouchMode && (
          <View
            style={StyleSheet.absoluteFill}
            {...panResponder.panHandlers}
            zIndex={10} // Sit on top of scrollview
          >
            {/* Visual feedback that mode is on */}
            <View style={{ position: 'absolute', top: 10, alignSelf: 'center', backgroundColor: 'rgba(0,0,0,0.5)', padding: 8, borderRadius: 16 }}>
              <Text style={{ color: 'white', fontWeight: 'bold' }}>Touch Mode Active</Text>
            </View>
          </View>
        )}

        {/* Main Status Card */}
        <StatusCard
          partner={partner}
          signals={signals}
          isOnline={isOnline}
          lastSeen={lastSeen}
        />

        {/* Quick Actions */}
        <QuickActions
          partnerName={partner.display_name || partner.name}
          onShareLocation={shareLocation}
          isSharing={isSharing}
        />

        {/* Today's Moments Preview */}
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
                  i < 3 && styles.dotActive,
                ]}
              />
            ))}
          </View>

          <Text style={[theme.textStyles.bodySmall, styles.momentsText]}>
            3 moments shared today
          </Text>
        </View>
      </ScrollView>
      {/* Digital Touch Visuals (Always render so we can see partner) */}
      <TouchOverlay userId={user.id} partnerId={partner?.id} myPosition={myTouchPos} />

      <LoveBombOverlay
        isVisible={showLoveBomb}
        onDismiss={() => setShowLoveBomb(false)}
      />
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
    marginBottom: theme.spacing.xs,
  },
  headerSubtitle: {
    color: theme.colors.mediumGray,
  },
  sectionTitle: {
    color: theme.colors.deepNavy,
    marginBottom: theme.spacing.lg,
  },
  momentsSection: {
    marginBottom: theme.spacing.xl,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: theme.colors.mediumGray,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: theme.colors.deepNavy,
  },
  emptyText: {
    fontSize: 16,
    color: theme.colors.mediumGray,
    textAlign: 'center',
    marginBottom: 24,
  },
});
