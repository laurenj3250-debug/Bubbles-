import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Modal,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import theme from '../theme';
import haptics from '../utils/haptics';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Photo capture/select component
export const PhotoCapture = ({ onPhotoSelected, style }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleTakePhoto = async () => {
    try {
      haptics.light();
      setIsLoading(true);

      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        console.warn('Camera permission denied');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        haptics.success();
        onPhotoSelected?.(result.assets[0]);
      }
    } catch (error) {
      console.error('Failed to take photo:', error);
      haptics.error();
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectPhoto = async () => {
    try {
      haptics.light();
      setIsLoading(true);

      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        console.warn('Media library permission denied');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        haptics.success();
        onPhotoSelected?.(result.assets[0]);
      }
    } catch (error) {
      console.error('Failed to select photo:', error);
      haptics.error();
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.captureContainer, style]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.captureContainer, style]}>
      <TouchableOpacity style={styles.captureButton} onPress={handleTakePhoto}>
        <Text style={styles.captureIcon}>📷</Text>
        <Text style={styles.captureText}>Take Photo</Text>
      </TouchableOpacity>

      <View style={styles.divider} />

      <TouchableOpacity style={styles.captureButton} onPress={handleSelectPhoto}>
        <Text style={styles.captureIcon}>🖼️</Text>
        <Text style={styles.captureText}>Choose from Library</Text>
      </TouchableOpacity>
    </View>
  );
};

// Photo preview with send/cancel options
export const PhotoPreview = ({ photo, onSend, onCancel, caption, onCaptionChange }) => {
  if (!photo) return null;

  return (
    <View style={styles.previewContainer}>
      <Image source={{ uri: photo.uri }} style={styles.previewImage} />

      <View style={styles.previewActions}>
        <TouchableOpacity style={styles.cancelPreviewButton} onPress={onCancel}>
          <Text style={styles.cancelPreviewText}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.sendButton} onPress={onSend}>
          <Text style={styles.sendButtonText}>Send to Partner</Text>
          <Text style={styles.sendIcon}>💜</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Photo display in chat/feed
export const PhotoMessage = ({ uri, timestamp, fromPartner, onPress }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  return (
    <>
      <TouchableOpacity
        style={[
          styles.photoMessage,
          fromPartner ? styles.fromPartner : styles.fromMe,
        ]}
        onPress={() => {
          haptics.light();
          setIsFullscreen(true);
          onPress?.();
        }}
      >
        <Image source={{ uri }} style={styles.photoThumbnail} />
        {timestamp && (
          <Text style={styles.photoTimestamp}>
            {new Date(timestamp).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        )}
      </TouchableOpacity>

      <Modal
        visible={isFullscreen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsFullscreen(false)}
      >
        <TouchableOpacity
          style={styles.fullscreenModal}
          activeOpacity={1}
          onPress={() => setIsFullscreen(false)}
        >
          <Image
            source={{ uri }}
            style={styles.fullscreenImage}
            resizeMode="contain"
          />
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setIsFullscreen(false)}
          >
            <Text style={styles.closeIcon}>✕</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

// Photo grid for viewing shared photos
export const PhotoGrid = ({ photos, onPhotoPress }) => {
  if (!photos || photos.length === 0) {
    return (
      <View style={styles.emptyGrid}>
        <Text style={styles.emptyIcon}>📸</Text>
        <Text style={styles.emptyText}>No photos shared yet</Text>
        <Text style={styles.emptySubtext}>
          Share moments with your partner
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.gridContainer}>
      {photos.map((photo, index) => (
        <TouchableOpacity
          key={photo.id || index}
          style={styles.gridItem}
          onPress={() => onPhotoPress?.(photo, index)}
        >
          <Image source={{ uri: photo.uri }} style={styles.gridImage} />
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  captureContainer: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.large,
    padding: theme.spacing.lg,
    ...theme.shadows.level1,
  },
  captureButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
  },
  captureIcon: {
    fontSize: 28,
    marginRight: theme.spacing.md,
  },
  captureText: {
    fontSize: 16,
    color: theme.colors.navyText,
    fontWeight: theme.typography.fontWeight.medium,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.lightGray,
    marginVertical: theme.spacing.sm,
  },
  previewContainer: {
    borderRadius: theme.borderRadius.large,
    overflow: 'hidden',
    backgroundColor: theme.colors.surface,
    ...theme.shadows.level2,
  },
  previewImage: {
    width: '100%',
    aspectRatio: 1,
  },
  previewActions: {
    flexDirection: 'row',
    padding: theme.spacing.md,
    gap: theme.spacing.md,
  },
  cancelPreviewButton: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
    borderRadius: theme.borderRadius.medium,
    backgroundColor: theme.colors.lightGray,
  },
  cancelPreviewText: {
    color: theme.colors.mediumGray,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  sendButton: {
    flex: 2,
    flexDirection: 'row',
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.borderRadius.medium,
    backgroundColor: theme.colors.primary,
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontWeight: theme.typography.fontWeight.semibold,
    marginRight: theme.spacing.sm,
  },
  sendIcon: {
    fontSize: 16,
  },
  photoMessage: {
    maxWidth: '70%',
    borderRadius: theme.borderRadius.medium,
    overflow: 'hidden',
    marginVertical: theme.spacing.xs,
  },
  fromPartner: {
    alignSelf: 'flex-start',
  },
  fromMe: {
    alignSelf: 'flex-end',
  },
  photoThumbnail: {
    width: 200,
    height: 200,
    borderRadius: theme.borderRadius.medium,
  },
  photoTimestamp: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    color: '#FFFFFF',
    fontSize: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  fullscreenModal: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullscreenImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH,
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeIcon: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 2,
  },
  gridItem: {
    width: (SCREEN_WIDTH - theme.spacing['2xl'] * 2 - 4) / 3,
    aspectRatio: 1,
  },
  gridImage: {
    width: '100%',
    height: '100%',
  },
  emptyGrid: {
    alignItems: 'center',
    padding: theme.spacing['2xl'],
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: theme.spacing.md,
  },
  emptyText: {
    fontSize: 18,
    color: theme.colors.navyText,
    fontWeight: theme.typography.fontWeight.semibold,
    marginBottom: theme.spacing.xs,
  },
  emptySubtext: {
    fontSize: 14,
    color: theme.colors.mediumGray,
  },
});

export default PhotoCapture;
