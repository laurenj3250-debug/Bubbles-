import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import theme from '../../theme';

export function ErrorBanner({ error, onRetry }) {
  if (!error) return null;

  return (
    <View style={styles.errorBanner}>
      <Image
        source={require('../../../assets/icons/warning.png')}
        style={styles.errorIcon}
        resizeMode="contain"
      />
      <Text style={styles.errorText}>{error}</Text>
      <TouchableOpacity onPress={onRetry} style={styles.retryButton}>
        <Text style={styles.retryText}>Retry</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  errorBanner: {
    backgroundColor: '#FEE2E2',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.medium,
    marginBottom: theme.spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  errorIcon: {
    width: 20,
    height: 20,
    marginRight: 8,
    tintColor: '#991B1B',
  },
  errorText: {
    color: '#991B1B',
    fontSize: 14,
    flex: 1,
  },
  retryButton: {
    backgroundColor: '#DC2626',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.small,
  },
  retryText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
});
