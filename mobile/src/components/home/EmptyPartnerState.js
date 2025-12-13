import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  RefreshControl,
  Image,
} from 'react-native';
import { WavePattern, GentleButton } from '../';
import theme from '../../theme';

export function EmptyPartnerState({ refreshing, onRefresh, onFindPartner, pendingRequest, onCancelRequest }) {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <WavePattern color={theme.colors.dustyRose} opacity={0.08} />
      <ScrollView
        contentContainerStyle={styles.emptyContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {pendingRequest ? (
          <>
            <View style={styles.pendingCard}>
              {pendingRequest.avatar_url ? (
                <Image
                  source={{ uri: pendingRequest.avatar_url }}
                  style={styles.pendingAvatar}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.pendingAvatarPlaceholder}>
                  <Text style={styles.pendingAvatarText}>
                    {pendingRequest.partner_name?.charAt(0).toUpperCase() || '?'}
                  </Text>
                </View>
              )}
              <Text style={[theme.textStyles.h3, styles.pendingName]}>
                {pendingRequest.partner_name}
              </Text>
              <Text style={[theme.textStyles.bodySmall, styles.pendingEmail]}>
                {pendingRequest.partner_email}
              </Text>
              <View style={styles.pendingBadge}>
                <Text style={[theme.textStyles.bodySmall, styles.pendingBadgeText]}>
                  📤 Invite Pending
                </Text>
              </View>
            </View>
            <GentleButton
              title="Cancel Invite"
              onPress={onCancelRequest}
              variant="secondary"
              size="medium"
              style={styles.cancelButton}
            />
            <Text style={[theme.textStyles.bodySmall, styles.pendingHint]}>
              You can cancel and send a new invite
            </Text>
          </>
        ) : (
          <>
            <Image
              source={require('../../../assets/icons/couple.png')}
              style={styles.emptyIcon}
              resizeMode="contain"
            />
            <Text style={[theme.textStyles.h2, styles.emptyTitle]}>No Partner Yet</Text>
            <Text style={[theme.textStyles.body, styles.emptyText]}>
              Connect with your sugarbum to start sharing your daily moments
            </Text>
            <GentleButton
              title="Find Your Partner"
              onPress={onFindPartner}
              variant="primary"
              size="large"
            />
          </>
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyIcon: {
    width: 100,
    height: 100,
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
  pendingCard: {
    backgroundColor: theme.colors.offWhite,
    borderRadius: theme.borderRadius.large,
    padding: theme.spacing['2xl'],
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
    ...theme.shadows.level2,
  },
  pendingAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: theme.spacing.md,
    backgroundColor: theme.colors.lightGray,
  },
  pendingAvatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.dustyRose,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  pendingAvatarText: {
    fontSize: 32,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.offWhite,
  },
  pendingName: {
    color: theme.colors.deepNavy,
    marginBottom: theme.spacing.xs,
  },
  pendingEmail: {
    color: theme.colors.mediumGray,
    marginBottom: theme.spacing.md,
  },
  pendingBadge: {
    backgroundColor: theme.colors.cream,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.medium,
  },
  pendingBadgeText: {
    color: theme.colors.deepNavy,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  cancelButton: {
    marginBottom: theme.spacing.md,
  },
  pendingHint: {
    color: theme.colors.mediumGray,
    textAlign: 'center',
  },
});
