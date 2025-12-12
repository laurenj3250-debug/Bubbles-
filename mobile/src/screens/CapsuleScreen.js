import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    SafeAreaView,
    StatusBar,
    TouchableOpacity,
    ActivityIndicator
} from 'react-native';
import api from '../config/api';
import theme from '../theme';
import { BlobCard, WavePattern, PatternBackground, GentleButton } from '../components';

export default function CapsuleScreen({ navigation }) {
    const [capsule, setCapsule] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchCapsule();
    }, []);

    const fetchCapsule = async () => {
        try {
            const response = await api.get('/capsules/current');
            // The API returns { capsule: { ... } } or { capsule: null }
            // Backend might return SQLite text fields, so we need to parse them if they are strings
            let cap = response.data.capsule;

            if (cap) {
                // Parse JSON fields if they are strings (SQLite compat)
                try {
                    if (typeof cap.content === 'string') cap.content = JSON.parse(cap.content);
                } catch (e) {
                    console.warn('Failed to parse capsule content:', e);
                    cap.content = null;
                }
                try {
                    if (typeof cap.stats === 'string') cap.stats = JSON.parse(cap.stats);
                } catch (e) {
                    console.warn('Failed to parse capsule stats:', e);
                    cap.stats = null;
                }
            }

            setCapsule(cap);
        } catch (error) {
            console.error('Fetch capsule error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                    <Text style={[theme.textStyles.body, { marginTop: 16 }]}>Loading your day...</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (!capsule) {
        return (
            <SafeAreaView style={styles.container}>
                <StatusBar barStyle="dark-content" />
                <WavePattern color={theme.colors.sageGreen} opacity={0.1} />
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Text style={theme.textStyles.body}>‹ Back</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.center}>
                    <Text style={{ fontSize: 40, marginBottom: 16 }}>🌱</Text>
                    <Text style={[theme.textStyles.h2, { textAlign: 'center', marginBottom: 8 }]}>
                        No Capsule Yet
                    </Text>
                    <Text style={[theme.textStyles.body, { textAlign: 'center', paddingHorizontal: 32, color: theme.colors.mediumGray }]}>
                        Your daily summary will appear here at 9:00 PM. Go make some memories!
                    </Text>
                </View>
            </SafeAreaView>
        );
    }

    const { content, stats, date } = capsule;

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />

            {/* Backgrounds */}
            <WavePattern color={theme.colors.mutedPurple} opacity={0.05} />
            <PatternBackground pattern="dots" color={theme.colors.teal} opacity={0.05} size="small" />

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Text style={theme.textStyles.body}>‹ Back</Text>
                    </TouchableOpacity>
                    <Text style={theme.textStyles.caption}>DAILY CAPSULE</Text>
                    <Text style={theme.textStyles.h2}>
                        {new Date(date).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                    </Text>
                </View>

                {/* Message Card */}
                <BlobCard style={styles.messageCard}>
                    <Text style={styles.emojiIcon}>✨</Text>
                    <Text style={[theme.textStyles.h3, styles.messageText]}>
                        {content.message || "A beautiful day together."}
                    </Text>
                </BlobCard>

                {/* Highlights */}
                {content.highlights && content.highlights.length > 0 && (
                    <View style={styles.section}>
                        <Text style={[theme.textStyles.h3, styles.sectionTitle]}>Highlights</Text>
                        {content.highlights.map((item, index) => (
                            <View key={index} style={styles.highlightItem}>
                                <Text style={{ marginRight: 8 }}>•</Text>
                                <Text style={theme.textStyles.body}>{item}</Text>
                            </View>
                        ))}
                    </View>
                )}

                {/* Shared Places */}
                {content.shared_places && content.shared_places.length > 0 && (
                    <BlobCard style={styles.placesCard}>
                        <Text style={[theme.textStyles.h3, { marginBottom: 16 }]}>📍 Shared Moments</Text>
                        {content.shared_places.map((place, idx) => (
                            <Text key={idx} style={[theme.textStyles.body, { marginBottom: 4 }]}>
                                You both visited <Text style={{ fontWeight: 'bold' }}>{place}</Text>
                            </Text>
                        ))}
                    </BlobCard>
                )}

                {/* Stats */}
                {stats && (
                    <View style={styles.statsRow}>
                        <View style={[styles.statBox, { backgroundColor: theme.colors.offWhite }]}>
                            <Text style={styles.statEmoji}>⏱️</Text>
                            <Text style={theme.textStyles.caption}>Together</Text>
                            <Text style={theme.textStyles.h3}>{stats.together_minutes || 0}m</Text>
                        </View>
                        <View style={[styles.statBox, { backgroundColor: theme.colors.offWhite }]}>
                            <Text style={styles.statEmoji}>🎵</Text>
                            <Text style={theme.textStyles.caption}>Vibe Match</Text>
                            <Text style={theme.textStyles.h3}>{stats.music_overlap || 0}%</Text>
                        </View>
                    </View>
                )}

                <View style={{ height: 40 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.cream,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollContent: {
        padding: theme.spacing.xl,
    },
    header: {
        marginBottom: theme.spacing['2xl'],
    },
    backButton: {
        marginBottom: theme.spacing.md,
    },
    messageCard: {
        marginBottom: theme.spacing.xl,
        alignItems: 'center',
        padding: theme.spacing.xl,
    },
    emojiIcon: {
        fontSize: 48,
        marginBottom: theme.spacing.md,
    },
    messageText: {
        textAlign: 'center',
        lineHeight: 28,
        color: theme.colors.deepNavy,
    },
    section: {
        marginBottom: theme.spacing.xl,
        paddingHorizontal: theme.spacing.sm,
    },
    sectionTitle: {
        color: theme.colors.deepNavy,
        marginBottom: theme.spacing.md,
    },
    highlightItem: {
        flexDirection: 'row',
        marginBottom: theme.spacing.sm,
        paddingLeft: theme.spacing.sm,
    },
    placesCard: {
        marginBottom: theme.spacing.xl,
        backgroundColor: theme.colors.primaryLight + '40', // transparent
    },
    statsRow: {
        flexDirection: 'row',
        gap: theme.spacing.md,
    },
    statBox: {
        flex: 1,
        borderRadius: theme.borderRadius.medium,
        padding: theme.spacing.lg,
        alignItems: 'center',
        ...theme.shadows.level1,
    },
    statEmoji: {
        fontSize: 24,
        marginBottom: theme.spacing.xs,
    },
});
