import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import { WavePattern } from '../';
import theme from '../../theme';

export function LoadingState() {
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.cream,
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
});
