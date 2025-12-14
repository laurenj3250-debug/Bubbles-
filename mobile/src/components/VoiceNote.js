import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Platform,
} from 'react-native';
import { Audio } from 'expo-av';
import theme from '../theme';
import haptics from '../utils/haptics';

// Voice note recording component for sending audio messages
export const VoiceNoteRecorder = ({ onRecordingComplete, maxDuration = 60 }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [recording, setRecording] = useState(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const timerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (recording) recording.stopAndUnloadAsync();
    };
  }, [recording]);

  useEffect(() => {
    if (isRecording) {
      // Pulse animation while recording
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isRecording, pulseAnim]);

  const startRecording = async () => {
    try {
      if (Platform.OS === 'web') {
        console.warn('Voice recording not supported on web');
        return;
      }

      haptics.medium();

      // Request permissions
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        console.warn('Audio permission denied');
        return;
      }

      // Configure audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      // Start recording
      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(newRecording);
      setIsRecording(true);
      setRecordingDuration(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingDuration((prev) => {
          if (prev >= maxDuration - 1) {
            stopRecording();
            return maxDuration;
          }
          return prev + 1;
        });
      }, 1000);

      haptics.success();
    } catch (error) {
      console.error('Failed to start recording:', error);
      haptics.error();
    }
  };

  const stopRecording = async () => {
    try {
      if (!recording) return;

      haptics.medium();

      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      setIsRecording(false);
      await recording.stopAndUnloadAsync();

      const uri = recording.getURI();
      const duration = recordingDuration;

      setRecording(null);
      setRecordingDuration(0);

      // Reset audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });

      onRecordingComplete?.({ uri, duration });
      haptics.success();
    } catch (error) {
      console.error('Failed to stop recording:', error);
      haptics.error();
    }
  };

  const cancelRecording = async () => {
    try {
      if (!recording) return;

      haptics.warning();

      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      setIsRecording(false);
      await recording.stopAndUnloadAsync();
      setRecording(null);
      setRecordingDuration(0);

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });
    } catch (error) {
      console.error('Failed to cancel recording:', error);
    }
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (Platform.OS === 'web') {
    return (
      <View style={styles.container}>
        <Text style={styles.webNotice}>Voice notes available on mobile</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {isRecording ? (
        <View style={styles.recordingContainer}>
          <Animated.View
            style={[
              styles.recordingIndicator,
              { transform: [{ scale: pulseAnim }] },
            ]}
          />
          <Text style={styles.duration}>{formatDuration(recordingDuration)}</Text>
          <Text style={styles.maxDuration}>/ {formatDuration(maxDuration)}</Text>

          <View style={styles.recordingActions}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={cancelRecording}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.stopButton}
              onPress={stopRecording}
            >
              <View style={styles.stopIcon} />
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.recordButton}
          onPress={startRecording}
          onLongPress={startRecording}
        >
          <View style={styles.micIcon}>
            <Text style={styles.micEmoji}>🎤</Text>
          </View>
          <Text style={styles.recordText}>Hold to record</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

// Voice note player component
export const VoiceNotePlayer = ({ uri, duration, onDelete }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackPosition, setPlaybackPosition] = useState(0);
  const [sound, setSound] = useState(null);
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    return () => {
      if (sound) sound.unloadAsync();
    };
  }, [sound]);

  const playSound = async () => {
    try {
      if (Platform.OS === 'web') return;

      haptics.light();

      if (sound) {
        if (isPlaying) {
          await sound.pauseAsync();
          setIsPlaying(false);
        } else {
          await sound.playAsync();
          setIsPlaying(true);
        }
      } else {
        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri },
          { shouldPlay: true },
          onPlaybackStatusUpdate
        );
        setSound(newSound);
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Failed to play sound:', error);
    }
  };

  const onPlaybackStatusUpdate = (status) => {
    if (status.isLoaded) {
      setPlaybackPosition(status.positionMillis / 1000);
      const progress = status.positionMillis / status.durationMillis;
      progressAnim.setValue(progress);

      if (status.didJustFinish) {
        setIsPlaying(false);
        setPlaybackPosition(0);
        progressAnim.setValue(0);
      }
    }
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.playerContainer}>
      <TouchableOpacity style={styles.playButton} onPress={playSound}>
        <Text style={styles.playIcon}>{isPlaying ? '⏸' : '▶️'}</Text>
      </TouchableOpacity>

      <View style={styles.progressContainer}>
        <View style={styles.progressBackground}>
          <Animated.View
            style={[
              styles.progressFill,
              {
                width: progressAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%'],
                }),
              },
            ]}
          />
        </View>
        <Text style={styles.playerDuration}>
          {formatDuration(playbackPosition)} / {formatDuration(duration)}
        </Text>
      </View>

      {onDelete && (
        <TouchableOpacity style={styles.deleteButton} onPress={onDelete}>
          <Text style={styles.deleteIcon}>🗑️</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.md,
  },
  webNotice: {
    color: theme.colors.mediumGray,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  recordButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.large,
    padding: theme.spacing.lg,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    borderStyle: 'dashed',
  },
  micIcon: {
    marginRight: theme.spacing.sm,
  },
  micEmoji: {
    fontSize: 24,
  },
  recordText: {
    color: theme.colors.primary,
    fontSize: 16,
    fontWeight: theme.typography.fontWeight.medium,
  },
  recordingContainer: {
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.large,
    padding: theme.spacing.xl,
    ...theme.shadows.level1,
  },
  recordingIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: theme.colors.logoHeart,
    marginBottom: theme.spacing.md,
  },
  duration: {
    fontSize: 32,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.navyText,
  },
  maxDuration: {
    fontSize: 14,
    color: theme.colors.mediumGray,
    marginBottom: theme.spacing.lg,
  },
  recordingActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xl,
  },
  cancelButton: {
    padding: theme.spacing.md,
  },
  cancelText: {
    color: theme.colors.mediumGray,
    fontSize: 16,
  },
  stopButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.logoHeart,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stopIcon: {
    width: 20,
    height: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
  },
  playerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.medium,
    padding: theme.spacing.md,
    ...theme.shadows.level1,
  },
  playButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  playIcon: {
    fontSize: 18,
  },
  progressContainer: {
    flex: 1,
  },
  progressBackground: {
    height: 4,
    backgroundColor: theme.colors.lightGray,
    borderRadius: 2,
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: 2,
  },
  playerDuration: {
    fontSize: 12,
    color: theme.colors.mediumGray,
  },
  deleteButton: {
    padding: theme.spacing.sm,
    marginLeft: theme.spacing.sm,
  },
  deleteIcon: {
    fontSize: 18,
  },
});

export default VoiceNoteRecorder;
