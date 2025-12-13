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

export function EmptyPartnerState({ refreshing, onRefresh, onFindPartner }) {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <WavePattern color={theme.colors.dustyRose} opacity={0.08} />
      <ScrollView
        contentContainerStyle={styles.emptyContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
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
});
