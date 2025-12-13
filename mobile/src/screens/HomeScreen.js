import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
  SafeAreaView,
  StatusBar,
  PanResponder,
  Text,
  Platform,
} from 'react-native';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../config/api';
import { StatusCard, QuickActions } from '../components';
import { LoveBombOverlay } from '../components/LoveBombOverlay';
import { TouchOverlay } from '../components/TouchOverlay';
import {
  HomeHeader,
  TodaysMoments,
  ErrorBanner,
  HomeBackgrounds,
  LoadingState,
  EmptyPartnerState,
} from '../components/home';
import { usePartnerStatus, useLoveBombListener, useDigitalTouch } from '../hooks';
import theme from '../theme';

export default function HomeScreen({ navigation }) {
  // Core state
  const [user, setUser] = useState(null);
  const [partner, setPartner] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSharing, setIsSharing] = useState(false);
  const [error, setError] = useState(null);

  // Custom hooks for Firebase real-time features
  const { signals, setSignals, lastSeen, isOnline } = usePartnerStatus(partner?.id);
  const { showLoveBomb, setShowLoveBomb } = useLoveBombListener(user?.id, partner?.id);
  const { isTouchMode, setIsTouchMode, myTouchPos, updateMyTouch } = useDigitalTouch(user?.id);

  // Pan responder for digital touch
  const panResponder = React.useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => updateMyTouch(evt.nativeEvent.pageX, evt.nativeEvent.pageY),
      onPanResponderMove: (evt) => updateMyTouch(evt.nativeEvent.pageX, evt.nativeEvent.pageY),
      onPanResponderRelease: () => updateMyTouch(null, null),
      onPanResponderTerminate: () => updateMyTouch(null, null),
    })
  ).current;

  // Initial data load
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        try {
          setUser(JSON.parse(userData));
        } catch (parseError) {
          console.error('Invalid user data in storage, clearing...', parseError);
          await AsyncStorage.removeItem('user');
        }
      }

      await Promise.all([fetchPartner(), fetchSignals()]);
      setError(null);
    } catch (error) {
      console.error('Load data error:', error);
      setError('Unable to load data. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

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
        setSignals(null);
      }
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchPartner(), fetchSignals()]);
    setRefreshing(false);
  };

  const sendLocationSignal = async () => {
    try {
      if (Platform.OS === 'web') {
        if (!navigator.geolocation) {
          console.warn('Geolocation not supported on this browser');
          return;
        }

        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude, accuracy } = position.coords;
            await api.post('/signals/location', {
              latitude,
              longitude,
              accuracy: accuracy || 0
            });
            console.log('Location signal sent (web)');
          },
          (error) => {
            console.warn('Location permission denied:', error.message);
          },
          { enableHighAccuracy: false, timeout: 5000, maximumAge: 60000 }
        );
      } else {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          console.warn('Location permission denied');
          return;
        }

        const location = await Location.getCurrentPositionAsync({});
        await api.post('/signals/location', {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          accuracy: location.coords.accuracy
        });
        console.log('Location signal sent (native)');
      }
    } catch (error) {
      console.error('Location signal error:', error);
    }
  };

  const shareLocation = async () => {
    try {
      setIsSharing(true);

      if (Platform.OS !== 'web') {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Denied', 'Permission to access location was denied');
          return;
        }
      }

      let location;
      if (Platform.OS === 'web') {
        location = await new Promise((resolve, reject) => {
          if (!navigator.geolocation) {
            reject(new Error('Geolocation not supported'));
            return;
          }
          navigator.geolocation.getCurrentPosition(
            (pos) => resolve({ coords: pos.coords }),
            (err) => reject(err),
            { enableHighAccuracy: false, timeout: 5000, maximumAge: 60000 }
          );
        });
      } else {
        location = await Location.getCurrentPositionAsync({});
      }

      await sendLocationSignal();

      let placeName = '';
      if (Platform.OS !== 'web' && location?.coords) {
        try {
          const [address] = await Location.reverseGeocodeAsync({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          });
          if (address) {
            placeName = address.city || address.region || address.name || '';
          }
        } catch (geoError) {
          console.log('Geocoding failed, skipping place name');
        }
      }

      Alert.alert(
        'Location Shared!',
        `Your partner can now see you${placeName ? ` at ${placeName}` : ''}!`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Share location error:', error);
      Alert.alert('Unable to Share Location',
        error.response?.data?.error || 'Could not share location. Please try again.',
        [{ text: 'OK', style: 'cancel' }]
      );
    } finally {
      setIsSharing(false);
    }
  };

  // Render states
  if (isLoading) {
    return <LoadingState />;
  }

  if (!partner) {
    return (
      <EmptyPartnerState
        refreshing={refreshing}
        onRefresh={onRefresh}
        onFindPartner={() => navigation.navigate('Partner')}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <HomeBackgrounds />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        <HomeHeader
          partner={partner}
          isTouchMode={isTouchMode}
          setIsTouchMode={setIsTouchMode}
          onCapsulePress={() => navigation.navigate('Capsule')}
        />

        <ErrorBanner error={error} onRetry={loadData} />

        {/* Digital Touch Surface */}
        {isTouchMode && (
          <View
            style={StyleSheet.absoluteFill}
            {...panResponder.panHandlers}
            zIndex={10}
          >
            <View style={styles.touchModeIndicator}>
              <Text style={styles.touchModeText}>Touch Mode Active</Text>
            </View>
          </View>
        )}

        <StatusCard
          partner={partner}
          signals={signals}
          isOnline={isOnline}
          lastSeen={lastSeen}
        />

        <QuickActions
          partnerName={partner.display_name || partner.name}
          onShareLocation={shareLocation}
          isSharing={isSharing}
        />

        <TodaysMoments momentCount={3} />
      </ScrollView>

      <TouchOverlay userId={user?.id} partnerId={partner?.id} myPosition={myTouchPos} />

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
  touchModeIndicator: {
    position: 'absolute',
    top: 10,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 8,
    borderRadius: 16,
  },
  touchModeText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
