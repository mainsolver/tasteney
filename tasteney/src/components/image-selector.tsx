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
import { BeverageArchetype } from '@/types/drink';
import { ARCHETYPE_FALLBACK_IMAGES, DEFAULT_ENTRY_IMAGE as DEFAULT_FALLBACK_IMAGE } from '@/constants/drink-images';

interface ImageSelectorProps {
  images: string[];
  onChangeImages: (images: string[]) => void;
  onImagesAdded?: (assets: ImagePicker.ImagePickerAsset[]) => void;
  archetype?: BeverageArchetype;
}

export function ImageSelector({ images, onChangeImages, onImagesAdded, archetype }: ImageSelectorProps) {
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

  const fallbackImage = (archetype && ARCHETYPE_FALLBACK_IMAGES[archetype]) || DEFAULT_FALLBACK_IMAGE;
  const activeDisplayUri = images.length > 0 ? images[activeImageIndex] : fallbackImage;
  const isCustomImage = images.length > 0;

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
          {german ? 'FOTOAUFNAHMEN' : 'VISUAL RECORD'}
        </Text>
        {images.length > 0 && (
          <Text style={[styles.subHint, { color: colors.secondary }]}>
            {german
              ? `${images.length} Foto${images.length > 1 ? 's' : ''} angehängt`
              : `${images.length} photo${images.length > 1 ? 's' : ''} attached`}
          </Text>
        )}
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

        {/* Tag Badge inside the image */}
        <View style={styles.tagBadge}>
          <Text style={styles.tagBadgeText}>
            {isCustomImage
              ? (german ? `FOTO ${activeImageIndex + 1} VON ${images.length}` : `PHOTO ${activeImageIndex + 1} OF ${images.length}`)
              : (german ? 'BEISPIELVORSCHAU' : 'SAMPLE PREVIEW')}
          </Text>
        </View>

        {/* Delete button inside the image */}
        {isCustomImage && (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => handleRemoveImage(activeImageIndex)}
            style={styles.imageDeleteButton}>
            <Text style={styles.imageDeleteButtonText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Action button below the example image */}
      <View style={styles.actionsRow}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={showPhotoOptions}
          style={[
            styles.actionButton,
            {
              backgroundColor: colors.surfaceContainerHighest,
              borderColor: colors.outlineVariant,
            },
          ]}>
          <Text style={styles.actionButtonIcon}>📷</Text>
          <Text style={[styles.actionButtonText, { color: colors.primary }]}>
            {isCustomImage
              ? (german ? '+ Foto hinzufügen' : '+ Add Photo')
              : (german ? 'Foto anhängen' : 'Attach Photo')}
          </Text>
        </TouchableOpacity>
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
  tagBadge: {
    position: 'absolute',
    bottom: 12,
    left: 12,
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
  imageDeleteButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  imageDeleteButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: Spacing.four,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#4d0011',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  actionButtonIcon: {
    fontSize: 15,
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.3,
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
