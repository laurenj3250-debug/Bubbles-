import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import theme from '../../theme';

export function HomeHeader({ partner, isTouchMode, setIsTouchMode, onCapsulePress }) {
  return (
    <View style={styles.header}>
      <View style={styles.headerRow}>
        <View>
          <Text style={[theme.textStyles.h2, styles.headerTitle]}>
            {partner.display_name || partner.name}'s Now
          </Text>
          <Text style={[theme.textStyles.bodySmall, styles.headerSubtitle]}>
            See what they're up to
          </Text>
        </View>
        <TouchableOpacity onPress={onCapsulePress} style={styles.iconButton}>
          <Image
            source={require('../../../assets/icons/capsule.png')}
            style={styles.headerIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setIsTouchMode(!isTouchMode)}
          style={[
            styles.iconButton,
            isTouchMode && styles.iconButtonActive
          ]}
        >
          <Image
            source={require('../../../assets/icons/touch.png')}
            style={styles.headerIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: theme.spacing.xl,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    color: theme.colors.deepNavy,
    marginBottom: theme.spacing.xs,
  },
  headerSubtitle: {
    color: theme.colors.mediumGray,
  },
  iconButton: {
    padding: 8,
  },
  iconButtonActive: {
    backgroundColor: theme.colors.primary + '20',
    borderRadius: 20,
  },
  headerIcon: {
    width: 32,
    height: 32,
  },
});
