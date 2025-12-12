import React, { memo } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { BlobCard } from './BlobCard';
import { StatusAvatar } from './StatusAvatar';
import theme from '../theme';
import { getTimeAgo } from '../utils/time';

export const StatusCard = memo(({ partner, signals, isOnline, lastSeen }) => {
    if (!partner) return null;

    return (
        <BlobCard style={styles.statusCard}>
            <View style={styles.avatarContainer}>
                <StatusAvatar
                    status="active"
                    size={140}
                    imageUrl={partner.avatar_url}
                />
            </View>

            <Text style={[theme.textStyles.h2, styles.partnerName]}>
                {partner.display_name || partner.name}
            </Text>

            {/* Online Status */}
            <View style={styles.onlineStatusContainer}>
                <View style={[
                    styles.onlineIndicator,
                    isOnline && styles.onlineIndicatorActive
                ]} />
                <Text style={[theme.textStyles.bodySmall, styles.onlineText]}>
                    {isOnline ? 'Online now' : `Last seen ${getTimeAgo(lastSeen)}`}
                </Text>
            </View>

            {/* Status Details */}
            <View style={styles.statusDetails}>
                {/* Location */}
                {signals?.location ? (
                    <View style={styles.statusItem}>
                        <Image source={require('../../assets/icons/pin.png')} style={styles.statusIcon} resizeMode="contain" />
                        <Text style={[theme.textStyles.body, styles.statusText]}>
                            {signals.location.place_name || 'Unknown location'}
                        </Text>
                    </View>
                ) : null}

                {/* Music */}
                {signals?.music?.track_name ? (
                    <View style={styles.statusItem}>
                        <Image source={require('../../assets/icons/music.png')} style={styles.statusIcon} resizeMode="contain" />
                        <Text style={[theme.textStyles.body, styles.statusText]}>
                            {signals.music.track_name}
                        </Text>
                    </View>
                ) : null}

                {/* Weather */}
                {signals?.location?.weather_temp ? (
                    <View style={styles.statusItem}>
                        <Image source={require('../../assets/icons/sun.png')} style={styles.statusIcon} resizeMode="contain" />
                        <Text style={[theme.textStyles.body, styles.statusText]}>
                            {Math.round(signals.location.weather_temp)}°C, {signals.location.weather_condition}
                        </Text>
                    </View>
                ) : null}

                {/* Activity */}
                {signals?.activity?.total_steps ? (
                    <View style={styles.statusItem}>
                        <Image source={require('../../assets/icons/run.png')} style={styles.statusIcon} resizeMode="contain" />
                        <Text style={[theme.textStyles.body, styles.statusText]}>
                            {signals.activity.total_steps.toLocaleString()} steps today
                        </Text>
                    </View>
                ) : null}
            </View>
        </BlobCard>
    );
});

const styles = StyleSheet.create({
    statusCard: {
        marginBottom: theme.spacing.xl,
    },
    avatarContainer: {
        alignItems: 'center',
        marginBottom: theme.spacing.lg,
    },
    partnerName: {
        color: theme.colors.deepNavy,
        textAlign: 'center',
        marginBottom: theme.spacing.sm,
    },
    onlineStatusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: theme.spacing.lg,
        gap: theme.spacing.xs,
    },
    onlineIndicator: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: theme.colors.mediumGray,
    },
    onlineIndicatorActive: {
        backgroundColor: theme.colors.sageGreen,
    },
    onlineText: {
        color: theme.colors.mediumGray,
    },
    statusDetails: {
        gap: theme.spacing.md,
    },
    statusItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.sm,
    },
    statusIcon: {
        width: 24,
        height: 24,
        tintColor: theme.colors.deepNavy,
    },
    statusText: {
        color: theme.colors.charcoal,
        flex: 1,
    },
    lastSeen: {
        color: theme.colors.mediumGray,
        textAlign: 'center',
        marginTop: theme.spacing.md,
    },
});
