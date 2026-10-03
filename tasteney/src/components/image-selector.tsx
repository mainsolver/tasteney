import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  useColorScheme,
  ActionSheetIOS,
  Platform,
} from 'react-native';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { Colors, Spacing } from '@/constants/theme';

interface ImageSelectorProps {
  images: string[];
  onChangeImages: (images: string[]) => void;
  onImagesAdded?: (assets: ImagePicker.ImagePickerAsset[]) => void;
}

const DEFAULT_FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=1200&q=80';

export function ImageSelector({ images, onChangeImages, onImagesAdded }: ImageSelectorProps) {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const handlePickFromLibrary = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Needed',
          'Please allow access to your photo library to attach photos of your drink.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsMultipleSelection: true,
        quality: 0.8,
        exif: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const newUris = result.assets.map((a) => a.uri);
        const merged = [...images, ...newUris];
        onChangeImages(merged);
        onImagesAdded?.(result.assets);
        setActiveImageIndex(images.length);
      }
    } catch (error) {
      console.error('Error selecting photos:', error);
      Alert.alert('Error', 'Could not open photo library.');
    }
  };

  const handleTakePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Needed',
          'Please allow camera access to take a photo of your drink.'
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        quality: 0.8,
        exif: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const newUri = result.assets[0].uri;
        const merged = [...images, newUri];
        onChangeImages(merged);
        onImagesAdded?.(result.assets);
        setActiveImageIndex(images.length);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Could not access camera.');
    }
  };

  const showPhotoOptions = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', 'Take Photo', 'Choose from Library'],
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) {
            handleTakePhoto();
          } else if (buttonIndex === 2) {
            handlePickFromLibrary();
          }
        }
      );
    } else {
      Alert.alert('Add Photo', 'Choose an option to add drink images', [
        { text: 'Take Photo', onPress: handleTakePhoto },
        { text: 'Choose from Library', onPress: handlePickFromLibrary },
        { text: 'Cancel', style: 'cancel' },
      ]);
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    const updated = images.filter((_, idx) => idx !== indexToRemove);
    onChangeImages(updated);
    if (activeImageIndex >= updated.length) {
      setActiveImageIndex(Math.max(0, updated.length - 1));
    }
  };

  const activeDisplayUri = images.length > 0 ? images[activeImageIndex] : DEFAULT_FALLBACK_IMAGE;
  const isCustomImage = images.length > 0;

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
          VISUAL RECORD
        </Text>
        <Text style={[styles.subHint, { color: colors.secondary }]}>
          {images.length > 0 ? `${images.length} photo${images.length > 1 ? 's' : ''} attached` : 'Add photos'}
        </Text>
      </View>

      {/* Main Image Banner Card */}
      <View style={[styles.showcaseCard, { backgroundColor: colors.surfaceContainerLow }]}>
        <Image
          source={{ uri: activeDisplayUri }}
          style={styles.showcaseImage}
          contentFit="cover"
          transition={300}
        />
        <View style={styles.gradientOverlay} />

        {/* Floating Controls inside the image */}
        <View style={styles.floatingControls}>
          <View style={styles.tagBadge}>
            <Text style={styles.tagBadgeText}>
              {isCustomImage ? `PHOTO ${activeImageIndex + 1} OF ${images.length}` : 'SAMPLE PREVIEW'}
            </Text>
          </View>

          <View style={styles.actionButtonsRow}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={showPhotoOptions}
              style={[styles.glassButton, { backgroundColor: 'rgba(255, 255, 255, 0.92)' }]}>
              <Text style={[styles.glassButtonText, { color: colors.primary }]}>
                {isCustomImage ? '+ Add Photo' : 'Attach Photo'}
              </Text>
            </TouchableOpacity>

            {isCustomImage && (
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => handleRemoveImage(activeImageIndex)}
                style={[styles.glassIconButton, { backgroundColor: 'rgba(255, 255, 255, 0.92)' }]}>
                <Text style={[styles.glassIconText, { color: colors.textSecondary }]}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      {/* Thumbnails strip for multiple images */}
      {images.length > 1 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.thumbnailsContainer}>
          {images.map((uri, index) => {
            const isSelected = index === activeImageIndex;
            return (
              <TouchableOpacity
                key={`${uri}-${index}`}
                activeOpacity={0.7}
                onPress={() => setActiveImageIndex(index)}
                style={[
                  styles.thumbnailWrapper,
                  isSelected && [styles.thumbnailSelected, { borderColor: colors.primaryContainer }],
                ]}>
                <Image source={{ uri }} style={styles.thumbnailImage} contentFit="cover" />
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.two,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  subHint: {
    fontSize: 12,
    fontWeight: '500',
  },
  showcaseCard: {
    height: 190,
    width: '100%',
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#4d0011',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 3,
  },
  showcaseImage: {
    width: '100%',
    height: '100%',
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(77, 0, 17, 0.25)',
  },
  floatingControls: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tagBadge: {
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  tagBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  glassButton: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  glassButtonText: {
    fontSize: 12,
    fontWeight: '700',
  },
  glassIconButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  glassIconText: {
    fontSize: 12,
    fontWeight: '800',
  },
  thumbnailsContainer: {
    flexDirection: 'row',
    gap: 10,
    paddingVertical: 4,
  },
  thumbnailWrapper: {
    width: 54,
    height: 54,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  thumbnailSelected: {
    borderWidth: 2.5,
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
});
