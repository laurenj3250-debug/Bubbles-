import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MissYouButton } from './MissYouButton';
import { GentleButton } from './GentleButton';
import theme from '../theme';

export const QuickActions = memo(({ partnerName, onShareLocation, isSharing }) => {
    return (
        <View style={styles.quickActions}>
            <Text style={[theme.textStyles.h3, styles.sectionTitle]}>
                Quick Actions
            </Text>

            <View style={styles.actionButtons}>
                <View style={styles.actionButton}>
                    <MissYouButton partnerName={partnerName} />
                </View>

                <View style={styles.actionButton}>
                    <GentleButton
                        title={isSharing ? "Sending..." : "Share Location"}
                        icon={isSharing ? null : require('../../assets/icons/pin.png')}
                        onPress={onShareLocation}
                        variant="secondary"
                        size="medium"
                        disabled={isSharing}
                    />
                </View>
            </View>
        </View>
    );
});

const styles = StyleSheet.create({
    quickActions: {
        marginBottom: theme.spacing.xl,
    },
    sectionTitle: {
        color: theme.colors.deepNavy,
        marginBottom: theme.spacing.lg,
        marginLeft: theme.spacing.xs,
    },
    actionButtons: {
        flexDirection: 'row',
        gap: theme.spacing.md,
    },
    actionButton: {
    },
});
