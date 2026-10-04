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
import { useTranslation } from 'react-i18next';
import { Colors, Spacing } from '@/constants/theme';
import { isGerman } from '@/i18n';

interface ImageSelectorProps {
  images: string[];
  onChangeImages: (images: string[]) => void;
  onImagesAdded?: (assets: ImagePicker.ImagePickerAsset[]) => void;
}

const DEFAULT_FALLBACK_IMAGE = require('@/assets/images/drinks/wine.jpg');

export function ImageSelector({ images, onChangeImages, onImagesAdded }: ImageSelectorProps) {
  const scheme = useColorScheme();
  const { t } = useTranslation();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const german = isGerman();
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const handlePickFromLibrary = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          t('image.permissionNeeded'),
          t('image.libraryPermission')
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
      Alert.alert(t('common.error'), t('image.libraryError'));
    }
  };

  const handleTakePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          t('image.permissionNeeded'),
          t('image.cameraPermission')
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
      Alert.alert(t('common.error'), t('image.cameraError'));
    }
  };

  const showPhotoOptions = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: [t('common.cancel'), t('image.takePhoto'), t('image.chooseFromLibrary')],
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
      Alert.alert(t('image.dialogTitle'), t('image.dialogSubtitle'), [
        { text: t('image.takePhoto'), onPress: handleTakePhoto },
        { text: t('image.chooseFromLibrary'), onPress: handlePickFromLibrary },
        { text: t('common.cancel'), style: 'cancel' },
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
          {german ? 'FOTOAUFNAHMEN' : 'VISUAL RECORD'}
        </Text>
        <Text style={[styles.subHint, { color: colors.secondary }]}>
          {images.length > 0
            ? (german ? `${images.length} Foto${images.length > 1 ? 's' : ''} angehängt` : `${images.length} photo${images.length > 1 ? 's' : ''} attached`)
            : t('image.addPhotos')}
        </Text>
      </View>

      {/* Main Image Banner Card */}
      <View style={[styles.showcaseCard, { backgroundColor: colors.surfaceContainerLow }]}>
        <Image
          source={activeDisplayUri}
          style={styles.showcaseImage}
          contentFit="cover"
          transition={300}
        />
        <View style={styles.gradientOverlay} />

        {/* Floating Controls inside the image */}
        <View style={styles.floatingControls}>
          <View style={styles.tagBadge}>
            <Text style={styles.tagBadgeText}>
              {isCustomImage
                ? (german ? `FOTO ${activeImageIndex + 1} VON ${images.length}` : `PHOTO ${activeImageIndex + 1} OF ${images.length}`)
                : (german ? 'BEISPIELVORSCHAU' : 'SAMPLE PREVIEW')}
            </Text>
          </View>

          <View style={styles.actionButtonsRow}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={showPhotoOptions}
              style={[styles.glassButton, { backgroundColor: 'rgba(255, 255, 255, 0.92)' }]}>
              <Text style={[styles.glassButtonText, { color: colors.primary }]}>
                {isCustomImage
                  ? (german ? '+ Foto hinzufügen' : '+ Add Photo')
                  : (german ? 'Foto anhängen' : 'Attach Photo')}
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
                <Image source={uri} style={styles.thumbnailImage} contentFit="cover" />
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
