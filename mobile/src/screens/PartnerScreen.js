import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import api from '../config/api';

export default function PartnerScreen({ navigation }) {
  const [partner, setPartner] = useState(null);
  const [requests, setRequests] = useState([]);
  const [partnerEmail, setPartnerEmail] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      await Promise.all([fetchPartner(), fetchRequests()]);
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

  const fetchRequests = async () => {
    try {
      const response = await api.get('/partners/requests');
      setRequests(response.data.requests);
    } catch (error) {
      console.error('Fetch requests error:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const sendPartnerRequest = async () => {
    if (!partnerEmail.trim()) {
      Alert.alert('Error', 'Please enter your partner\'s email');
      return;
    }

    setIsSending(true);

    try {
      await api.post('/partners/request', {
        partnerEmail: partnerEmail.trim(),
      });

      Alert.alert('Success', 'Partner request sent!');
      setPartnerEmail('');
    } catch (error) {
      console.error('Send request error:', error);
      Alert.alert(
        'Error',
        error.response?.data?.error || 'Failed to send partner request'
      );
    } finally {
      setIsSending(false);
    }
  };

  const respondToRequest = async (partnershipId, accept) => {
    try {
      await api.post(`/partners/${partnershipId}/respond`, { accept });

      if (accept) {
        Alert.alert('Success', 'You are now connected with your partner!');
      }

      // Refresh data
      await loadData();
    } catch (error) {
      console.error('Respond to request error:', error);
      Alert.alert('Error', 'Failed to respond to request');
    }
  };

  const removePartner = () => {
    Alert.alert(
      'Remove Partner',
      'Are you sure you want to disconnect from your partner?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete('/partners/current');
              Alert.alert('Success', 'Partnership removed');
              setPartner(null);
            } catch (error) {
              console.error('Remove partner error:', error);
              Alert.alert('Error', 'Failed to remove partner');
            }
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Partner</Text>
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
        <Text style={styles.headerTitle}>Partner</Text>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {partner ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Current Partner</Text>
            <View style={styles.partnerCard}>
              <Text style={styles.partnerIcon}>💑</Text>
              <View style={styles.partnerInfo}>
                <Text style={styles.partnerName}>{partner.name}</Text>
                <Text style={styles.partnerEmail}>{partner.email}</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.removeButton} onPress={removePartner}>
              <Text style={styles.removeButtonText}>Remove Partner</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Connect with Your Partner</Text>
            <Text style={styles.sectionDescription}>
              Enter your partner's email address to send them a connection request
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Partner's email"
              placeholderTextColor="#9CA3AF"
              value={partnerEmail}
              onChangeText={setPartnerEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            <TouchableOpacity
              style={styles.button}
              onPress={sendPartnerRequest}
              disabled={isSending}
            >
              {isSending ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Send Request</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {requests.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Pending Requests</Text>
            {requests.map((request) => (
              <View key={request.id} style={styles.requestCard}>
                <View style={styles.requestInfo}>
                  <Text style={styles.requestName}>{request.partner_name}</Text>
                  <Text style={styles.requestEmail}>{request.partner_email}</Text>
                </View>
                <View style={styles.requestActions}>
                  <TouchableOpacity
                    style={styles.acceptButton}
                    onPress={() => respondToRequest(request.id, true)}
                  >
                    <Text style={styles.acceptButtonText}>Accept</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.rejectButton}
                    onPress={() => respondToRequest(request.id, false)}
                  >
                    <Text style={styles.rejectButtonText}>Decline</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}
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
  content: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  button: {
    backgroundColor: '#8B5CF6',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  partnerCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  partnerIcon: {
    fontSize: 48,
    marginRight: 16,
  },
  partnerInfo: {
    flex: 1,
  },
  partnerName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  partnerEmail: {
    fontSize: 14,
    color: '#6B7280',
  },
  removeButton: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#EF4444',
  },
  removeButtonText: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: '600',
  },
  requestCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  requestInfo: {
    marginBottom: 16,
  },
  requestName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  requestEmail: {
    fontSize: 14,
    color: '#6B7280',
  },
  requestActions: {
    flexDirection: 'row',
    gap: 12,
  },
  acceptButton: {
    flex: 1,
    backgroundColor: '#10B981',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  acceptButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  rejectButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  rejectButtonText: {
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '600',
  },
});
