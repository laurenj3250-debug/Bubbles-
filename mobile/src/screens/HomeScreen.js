import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../config/api';

export default function HomeScreen({ navigation }) {
  const [user, setUser] = useState(null);
  const [partner, setPartner] = useState(null);
  const [signals, setSignals] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

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
      // This is a simple placeholder - full implementation would use expo-location
      Alert.alert('Location Sharing', 'Location sharing feature coming soon!');
    } catch (error) {
      console.error('Share location error:', error);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>🫧 Bubbles</Text>
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </View>
    );
  }

  if (!partner) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>🫧 Bubbles</Text>
        </View>
        <ScrollView
          contentContainerStyle={styles.emptyContainer}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          <Text style={styles.emptyIcon}>💑</Text>
          <Text style={styles.emptyTitle}>No Partner Yet</Text>
          <Text style={styles.emptyText}>
            Connect with your partner to start sharing your daily moments
          </Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('Partner')}
          >
            <Text style={styles.buttonText}>Find Your Partner</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🫧 Bubbles</Text>
        <Text style={styles.headerSubtitle}>Connected with {partner.name}</Text>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Location Card */}
        {signals?.location ? (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardIcon}>📍</Text>
              <Text style={styles.cardTitle}>Location</Text>
            </View>
            <Text style={styles.cardValue}>
              {signals.location.place_name || 'Unknown location'}
            </Text>
            {signals.location.weather_temp && (
              <Text style={styles.cardDetail}>
                {Math.round(signals.location.weather_temp)}°C •{' '}
                {signals.location.weather_condition}
              </Text>
            )}
          </View>
        ) : (
          <View style={styles.card}>
            <Text style={styles.cardEmptyText}>Location not shared</Text>
          </View>
        )}

        {/* Activity Card */}
        {signals?.activity?.total_steps ? (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardIcon}>🏃</Text>
              <Text style={styles.cardTitle}>Activity</Text>
            </View>
            <Text style={styles.cardValue}>
              {signals.activity.total_steps.toLocaleString()} steps
            </Text>
            {signals.activity.total_distance && (
              <Text style={styles.cardDetail}>
                {(signals.activity.total_distance / 1000).toFixed(1)} km
              </Text>
            )}
          </View>
        ) : null}

        {/* Music Card */}
        {signals?.music?.track_name ? (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardIcon}>🎵</Text>
              <Text style={styles.cardTitle}>
                {signals.music.is_playing ? 'Now Playing' : 'Last Played'}
              </Text>
            </View>
            <Text style={styles.cardValue}>{signals.music.track_name}</Text>
            <Text style={styles.cardDetail}>{signals.music.artist_name}</Text>
          </View>
        ) : null}

        {/* Device Context Card */}
        {signals?.device && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardIcon}>📱</Text>
              <Text style={styles.cardTitle}>Device</Text>
            </View>
            <Text style={styles.cardValue}>
              Battery: {signals.device.battery_level}%
              {signals.device.is_charging ? ' ⚡' : ''}
            </Text>
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.actionButton} onPress={shareLocation}>
            <Text style={styles.actionButtonText}>📍 Share Location</Text>
          </TouchableOpacity>
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
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
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
    color: '#6B7280',
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
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  button: {
    backgroundColor: '#8B5CF6',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  cardValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  cardDetail: {
    fontSize: 14,
    color: '#6B7280',
  },
  cardEmptyText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  actionsContainer: {
    marginTop: 8,
    marginBottom: 24,
  },
  actionButton: {
    backgroundColor: '#8B5CF6',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
