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
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native';
import api from '../config/api';
import { BlobCard, GentleButton, WavePattern, AnimatedBlob, PatternBackground } from '../components';
import theme from '../theme';

// Web-compatible alert helper
const showAlert = (title, message, buttons) => {
  if (Platform.OS === 'web') {
    if (buttons && buttons.length > 1) {
      // Confirmation dialog
      if (window.confirm(`${title}\n\n${message}`)) {
        const confirmButton = buttons.find(b => b.style !== 'cancel');
        if (confirmButton?.onPress) confirmButton.onPress();
      }
    } else {
      window.alert(`${title}\n\n${message}`);
    }
  } else {
    Alert.alert(title, message, buttons);
  }
};

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
      showAlert('Error', 'Please enter your partner\'s email');
      return;
    }

    setIsSending(true);

    try {
      await api.post('/partners/request', {
        partnerEmail: partnerEmail.trim(),
      });

      showAlert('Success', 'Partner request sent!');
      setPartnerEmail('');
    } catch (error) {
      console.error('Send request error:', error);
      showAlert(
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
        showAlert('Success', 'You are now connected with your partner!');
      }

      // Refresh data
      await loadData();
    } catch (error) {
      console.error('Respond to request error:', error);
      showAlert('Error', 'Failed to respond to request');
    }
  };

  const removePartner = () => {
    showAlert(
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
              showAlert('Success', 'Partnership removed');
              setPartner(null);
            } catch (error) {
              console.error('Remove partner error:', error);
              showAlert('Error', 'Failed to remove partner');
            }
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <WavePattern color={theme.colors.dustyRose} opacity={0.08} />
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
      <WavePattern color={theme.colors.mossGreen} opacity={0.06} />
      <PatternBackground pattern="cross-dots" color={theme.colors.lavender} opacity={0.05} size="small" />
      <PatternBackground pattern="diagonal-lines" color={theme.colors.slate} opacity={0.04} size="large" />

      {/* Floating blobs for depth */}
      <AnimatedBlob color={theme.colors.lavender} size={210} opacity={0.16} shape="shape3" duration={27000} style={{ top: '-8%', right: '-12%' }} />
      <AnimatedBlob color={theme.colors.mossGreen} size={175} opacity={0.14} shape="shape5" duration={29000} style={{ top: '30%', left: '-10%' }} />
      <AnimatedBlob color={theme.colors.peach} size={190} opacity={0.12} shape="shape2" duration={25000} style={{ bottom: '20%', right: '-8%' }} />
      <AnimatedBlob color={theme.colors.teal} size={160} opacity={0.15} shape="shape4" duration={31000} style={{ bottom: '50%', left: '85%' }} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[theme.textStyles.h2, styles.headerTitle]}>
            {partner ? 'Your Connection' : 'Find Your Sugarbum'}
          </Text>
          <Text style={[theme.textStyles.bodySmall, styles.headerSubtitle]}>
            {partner ? 'Your special person' : 'Connect with someone special'}
          </Text>
        </View>

        {partner ? (
          <View style={styles.section}>
            <BlobCard style={styles.partnerCard}>
              <Text style={styles.partnerIcon}>💑</Text>
              <Text style={[theme.textStyles.h2, styles.partnerName]}>{partner.name}</Text>
              <Text style={[theme.textStyles.body, styles.partnerEmail]}>{partner.email}</Text>
            </BlobCard>

            <TouchableOpacity style={styles.removeButton} onPress={removePartner}>
              <Text style={[theme.textStyles.body, styles.removeButtonText]}>
                Disconnect
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.section}>
            <BlobCard style={styles.connectCard}>
              <Text style={styles.connectEmoji}>💕</Text>
              <Text style={[theme.textStyles.h3, styles.connectTitle]}>
                Connect with Your Sugarbum
              </Text>
              <Text style={[theme.textStyles.bodySmall, styles.connectDescription]}>
                Enter their email to send a connection request
              </Text>

              <TextInput
                style={[theme.textStyles.body, styles.input]}
                placeholder="Partner's email"
                placeholderTextColor={theme.colors.mediumGray}
                value={partnerEmail}
                onChangeText={setPartnerEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />

              <GentleButton
                title={isSending ? '...' : 'Send Request'}
                onPress={sendPartnerRequest}
                variant="primary"
                size="large"
                style={styles.sendButton}
              />
            </BlobCard>
          </View>
        )}

        {requests.length > 0 && (
          <View style={styles.section}>
            <Text style={[theme.textStyles.h3, styles.sectionTitle]}>Pending Requests</Text>
            {requests.map((request) => (
              <BlobCard key={request.id} style={styles.requestCard}>
                <View style={styles.requestInfo}>
                  <Text style={[theme.textStyles.h3, styles.requestName]}>
                    {request.partner_name}
                  </Text>
                  <Text style={[theme.textStyles.bodySmall, styles.requestEmail]}>
                    {request.partner_email}
                  </Text>
                </View>
                <View style={styles.requestActions}>
                  <View style={styles.actionButton}>
                    <GentleButton
                      title="Accept"
                      onPress={() => respondToRequest(request.id, true)}
                      variant="soft"
                      size="medium"
                    />
                  </View>
                  <TouchableOpacity
                    style={styles.rejectButton}
                    onPress={() => respondToRequest(request.id, false)}
                  >
                    <Text style={[theme.textStyles.bodySmall, styles.rejectButtonText]}>
                      Decline
                    </Text>
                  </TouchableOpacity>
                </View>
              </BlobCard>
            ))}
          </View>
        )}
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
    marginBottom: theme.spacing.xs,
  },
  headerSubtitle: {
    color: theme.colors.mediumGray,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: theme.colors.mediumGray,
  },
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    color: theme.colors.deepNavy,
    marginBottom: theme.spacing.lg,
  },
  partnerCard: {
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  partnerIcon: {
    fontSize: 64,
    marginBottom: theme.spacing.lg,
  },
  partnerName: {
    color: theme.colors.deepNavy,
    textAlign: 'center',
    marginBottom: theme.spacing.xs,
  },
  partnerEmail: {
    color: theme.colors.mediumGray,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  removeButton: {
    backgroundColor: theme.colors.offWhite,
    borderRadius: theme.borderRadius.medium,
    padding: theme.spacing.lg,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.colors.dustyRose,
  },
  removeButtonText: {
    color: theme.colors.dustyRose,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  connectCard: {
    alignItems: 'center',
  },
  connectEmoji: {
    fontSize: 64,
    marginBottom: theme.spacing.lg,
  },
  connectTitle: {
    color: theme.colors.deepNavy,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  connectDescription: {
    color: theme.colors.mediumGray,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
  },
  input: {
    backgroundColor: theme.colors.offWhite,
    borderRadius: theme.borderRadius.medium,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    borderWidth: 2,
    borderColor: theme.colors.lightGray,
    color: theme.colors.charcoal,
    width: '100%',
    ...theme.shadows.level1,
  },
  sendButton: {
    width: '100%',
  },
  requestCard: {
    marginBottom: theme.spacing.md,
  },
  requestInfo: {
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  requestName: {
    color: theme.colors.deepNavy,
    marginBottom: theme.spacing.xs,
  },
  requestEmail: {
    color: theme.colors.mediumGray,
  },
  requestActions: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    width: '100%',
  },
  actionButton: {
    flex: 1,
  },
  rejectButton: {
    flex: 1,
    backgroundColor: theme.colors.offWhite,
    borderRadius: theme.borderRadius.medium,
    padding: theme.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: theme.colors.lightGray,
  },
  rejectButtonText: {
    color: theme.colors.mediumGray,
    fontWeight: theme.typography.fontWeight.semibold,
  },
});
