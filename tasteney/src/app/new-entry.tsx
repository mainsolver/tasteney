import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  useColorScheme,
  Alert,
  Keyboard,
} from 'react-native';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Colors, Spacing } from '@/constants/theme';
import { Button } from '@/components/button';
import { CategoryPill } from '@/components/category-pill';
import { Badge } from '@/components/badge';
import { RatingSelector } from '@/components/rating-selector';
import { ImageSelector } from '@/components/image-selector';
import { SensorySelector } from '@/components/sensory-selector';
import { saveDrinkEntry, getDrinkEntryById } from '@/services/storage';
import { resolveLocationFromAsset, getCurrentDeviceLocation } from '@/services/location';
import { checkServerConnectivity } from '@/services/network';
import type { ImagePickerAsset } from 'expo-image-picker';
import { BeverageArchetype, BEVERAGE_SUBTYPES, SensoryDescriptor } from '@/types/drink';
import { translateArchetype, translateSubtype } from '@/i18n';

const ARCHETYPES: { label: BeverageArchetype; icon: string }[] = [
  { label: 'Wine', icon: '🍷' },
  { label: 'Coffee', icon: '☕' },
  { label: 'Spirits', icon: '🥃' },
  { label: 'Beer', icon: '🍺' },
  { label: 'Tea', icon: '🍵' },
  { label: 'Soda & Tonics', icon: '🫧' },
  { label: 'Cocktail', icon: '🍸' },
  { label: 'Other', icon: '✨' },
];

export default function NewEntryScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string; archetype?: string }>();
  const editId = params.id;
  const isEditing = Boolean(editId);
  const { t } = useTranslation();

  const scheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];

  const [name, setName] = useState('');
  const [manufacturer, setManufacturer] = useState('');
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [isGeocodingLocation, setIsGeocodingLocation] = useState(false);
  const [autoDetectedLocation, setAutoDetectedLocation] = useState<string | null>(null);
  const [rating, setRating] = useState<number>(8);
  const [notes, setNotes] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [prevArchetypeParam, setPrevArchetypeParam] = useState(params.archetype);
  const [archetype, setArchetype] = useState<BeverageArchetype>(() => {
    if (!editId && params.archetype && ARCHETYPES.some((a) => a.label === params.archetype)) {
      return params.archetype as BeverageArchetype;
    }
    return 'Wine';
  });
  const [subtype, setSubtype] = useState<string | undefined>(undefined);

  if (params.archetype !== prevArchetypeParam) {
    setPrevArchetypeParam(params.archetype);
    if (!editId && params.archetype) {
      const matched = ARCHETYPES.find((a) => a.label === params.archetype);
      if (matched) {
        setArchetype(matched.label);
        setSubtype(undefined);
      }
    }
  }
  const [selectedDescriptors, setSelectedDescriptors] = useState<SensoryDescriptor[]>([]);
  const [originalCreatedAt, setOriginalCreatedAt] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [isOffline, setIsOffline] = useState(false);

  const scrollViewRef = useRef<ScrollView>(null);
  const sectionPositions = useRef<Record<string, number>>({});
  const sensoryCategoryPositions = useRef<Record<string, number>>({});
  const activeInputTarget = useRef<{ key: string; sub?: string } | null>(null);

  const scrollToTarget = useCallback((key: string, sub?: string) => {
    activeInputTarget.current = { key, sub };
    let targetY = 0;
    if (key === 'name' || key === 'manufacturer' || key === 'details') {
      targetY = (sectionPositions.current['details'] ?? 0) - 20;
    } else if (key === 'country' || key === 'city' || key === 'location') {
      targetY = (sectionPositions.current['location'] ?? 0) - 20;
    } else if (key === 'sensory') {
      const catY = sub ? (sensoryCategoryPositions.current[sub] ?? 0) : 0;
      targetY = (sectionPositions.current['sensory'] ?? 0) + catY - 15;
    } else if (key === 'notes') {
      targetY = (sectionPositions.current['notes'] ?? 0) - 15;
    }

    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({
        y: Math.max(0, targetY),
        animated: true,
      });
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;
      activeInputTarget.current = null;
      scrollViewRef.current?.scrollTo({ y: 0, animated: false });
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        window.scrollTo(0, 0);
        document.documentElement?.scrollTo?.(0, 0);
        document.body?.scrollTo?.(0, 0);
      }

      checkServerConnectivity().then(({ isOffline: offline }) => {
        if (isMounted) {
          setIsOffline(offline);
        }
      });

      return () => {
        isMounted = false;
      };
    }, [])
  );

  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => {
        if (activeInputTarget.current) {
          scrollToTarget(activeInputTarget.current.key, activeInputTarget.current.sub);
        }
      }
    );
    return () => {
      showSub.remove();
    };
  }, [scrollToTarget]);

  useEffect(() => {
    let isMounted = true;
    if (editId) {
      getDrinkEntryById(editId).then((entry) => {
        if (isMounted && entry) {
          setName(entry.name || '');
          setManufacturer(entry.manufacturer || '');
          setCountry(entry.country || '');
          setCity(entry.city || '');
          setRating(entry.rating ?? 8);
          setNotes(entry.notes || '');
          setImages(entry.images || []);
          setArchetype(entry.archetype || 'Wine');
          setSubtype(entry.subtype || undefined);
          setSelectedDescriptors(entry.sensoryDescriptors || []);
          setOriginalCreatedAt(entry.createdAt || null);
        }
      });
    }
    return () => {
      isMounted = false;
    };
  }, [editId]);

  const handleArchetypeChange = (newArchetype: BeverageArchetype) => {
    setArchetype(newArchetype);
    setSubtype(undefined);
  };

  const handleImagesAdded = async (newAssets: ImagePickerAsset[]) => {
    if (!newAssets || newAssets.length === 0) return;

    // If both country and city are already filled in by the user, do not override or request permissions
    let currentCountry = country.trim();
    let currentCity = city.trim();
    if (currentCountry && currentCity) {
      return;
    }

    setIsGeocodingLocation(true);
    try {
      let resolved = false;

      // Tier 1: Try resolving location from photo EXIF metadata (reverse order: newest first)
      for (let i = newAssets.length - 1; i >= 0; i--) {
        const asset = newAssets[i];
        const location = await resolveLocationFromAsset(asset);
        if (location && (location.country || location.city)) {
          if (!currentCountry && location.country) {
            setCountry(location.country);
            currentCountry = location.country;
          }
          if (!currentCity && location.city) {
            setCity(location.city);
            currentCity = location.city;
          }
          const displayLabel = [location.city, location.country].filter(Boolean).join(', ');
          setAutoDetectedLocation(displayLabel);
          resolved = true;
          break;
        }
      }

      // Tier 2: If EXIF yielded no location and info is still missing, fall back to current device GPS
      if (!resolved && (!currentCountry || !currentCity)) {
        const deviceLocation = await getCurrentDeviceLocation();
        if (deviceLocation && (deviceLocation.country || deviceLocation.city)) {
          if (!currentCountry && deviceLocation.country) {
            setCountry(deviceLocation.country);
          }
          if (!currentCity && deviceLocation.city) {
            setCity(deviceLocation.city);
          }
          const displayLabel = [deviceLocation.city, deviceLocation.country].filter(Boolean).join(', ');
          setAutoDetectedLocation(displayLabel);
        }
      }
    } catch (err) {
      console.error('Failed to resolve location:', err);
    } finally {
      setIsGeocodingLocation(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert(t('newEntry.validationTitle'), t('newEntry.validationMessage'));
      return;
    }

    try {
      setIsSaving(true);
      await saveDrinkEntry({
        ...(editId ? { id: editId, createdAt: originalCreatedAt || undefined } : {}),
        name: name.trim(),
        manufacturer: manufacturer.trim(),
        country: country.trim() || undefined,
        city: city.trim() || undefined,
        rating,
        notes: notes.trim(),
        images,
        archetype,
        subtype: subtype || undefined,
        sensoryDescriptors: selectedDescriptors,
      });

      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
        // Reset or navigate back to the diary
        setName('');
        setManufacturer('');
        setCountry('');
        setCity('');
        setAutoDetectedLocation(null);
        setRating(8);
        setNotes('');
        setImages([]);
        setArchetype('Wine');
        setSubtype(undefined);
        setSelectedDescriptors([]);
        setOriginalCreatedAt(null);
        if (router.canGoBack()) {
          router.back();
        } else {
          router.push('/');
        }
      }, 1200);
    } catch (error) {
      console.error('Save failed:', error);
      Alert.alert(t('newEntry.saveFailedTitle'), t('newEntry.saveFailedMessage'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top + 44 : 0}>
      <ScrollView
        ref={scrollViewRef}
        contentOffset={{ x: 0, y: 0 }}
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets={true}
        keyboardDismissMode="on-drag"
        contentContainerStyle={[
          styles.scrollContainer,
          {
            paddingBottom: insets.bottom + 120,
          },
        ]}
        showsVerticalScrollIndicator={false}>
        {/* Archetype Quick Selector */}
        <View style={styles.sectionBlock}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
              {t('newEntry.sectionCategory')}
            </Text>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.archetypeScroll}>
            {ARCHETYPES.map((item) => {
              const isSelected = archetype === item.label;
              return (
                <CategoryPill
                  key={item.label}
                  label={translateArchetype(item.label)}
                  icon={item.icon}
                  isSelected={isSelected}
                  onPress={() => handleArchetypeChange(item.label)}
                />
              );
            })}
          </ScrollView>
        </View>

        {/* Beverage Subtype Selector */}
        {BEVERAGE_SUBTYPES[archetype]?.length > 0 && (
          <View style={styles.sectionBlock}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
                {t('newEntry.sectionSubtypeHeader')}
              </Text>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.subtypeScroll}>
              {BEVERAGE_SUBTYPES[archetype].map((item) => {
                const isSelected = subtype === item;
                return (
                  <CategoryPill
                    key={item}
                    label={translateSubtype(archetype, item)}
                    isSelected={isSelected}
                    onPress={() => setSubtype(isSelected ? undefined : item)}
                  />
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* Visual Record / Image Selector */}
        <View style={styles.sectionBlock}>
          <ImageSelector
            images={images}
            onChangeImages={setImages}
            onImagesAdded={handleImagesAdded}
            archetype={archetype}
          />
        </View>

        {/* Name and Manufacturer Fields */}
        <View
          style={styles.sectionBlock}
          onLayout={(e) => {
            sectionPositions.current['details'] = e.nativeEvent.layout.y;
          }}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
              {t('newEntry.sectionDetails')}
            </Text>
          </View>

          <View style={[styles.inputCard, { backgroundColor: colors.surfaceContainerLow }]}>
            <TextInput
              style={[styles.nameInput, { color: colors.primary }]}
              placeholder={t('newEntry.namePlaceholder')}
              placeholderTextColor="rgba(85, 66, 67, 0.45)"
              value={name}
              onFocus={() => scrollToTarget('name')}
              onChangeText={(text) => {
                setName(text);
                scrollToTarget('name');
              }}
            />

            <View style={[styles.inputDivider, { backgroundColor: colors.surfaceContainerHighest }]} />

            <View style={styles.subInputRow}>
              <Text style={[styles.subInputIcon, { color: colors.secondary }]}>🏷️</Text>
              <TextInput
                style={[styles.subInput, { color: colors.text }]}
                placeholder={t('newEntry.producerPlaceholder')}
                placeholderTextColor="rgba(85, 66, 67, 0.45)"
                value={manufacturer}
                onFocus={() => scrollToTarget('manufacturer')}
                onChangeText={(text) => {
                  setManufacturer(text);
                  scrollToTarget('manufacturer');
                }}
              />
            </View>
          </View>
        </View>

        {/* Location & Origin Fields */}
        <View
          style={styles.sectionBlock}
          onLayout={(e) => {
            sectionPositions.current['location'] = e.nativeEvent.layout.y;
          }}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
              {t('newEntry.sectionOrigin')}
            </Text>
            {isGeocodingLocation ? (
              <Text style={[styles.sectionHint, { color: colors.primary }]}>
                {t('newEntry.extractingGps')}
              </Text>
            ) : autoDetectedLocation ? (
              <Badge variant="secondary" label={t('newEntry.autoDetected')} />
            ) : null}
          </View>

          <View style={[styles.inputCard, { backgroundColor: colors.surfaceContainerLow }]}>
            <View style={styles.subInputRow}>
              <Text style={[styles.subInputIcon, { color: colors.secondary }]}>🌍</Text>
              <TextInput
                style={[styles.subInput, { color: colors.text }]}
                placeholder={t('newEntry.countryPlaceholder')}
                placeholderTextColor="rgba(85, 66, 67, 0.45)"
                value={country}
                onFocus={() => scrollToTarget('country')}
                onChangeText={(val) => {
                  setCountry(val);
                  if (autoDetectedLocation) setAutoDetectedLocation(null);
                  scrollToTarget('country');
                }}
              />
            </View>

            <View style={[styles.inputDivider, { backgroundColor: colors.surfaceContainerHighest }]} />

            <View style={styles.subInputRow}>
              <Text style={[styles.subInputIcon, { color: colors.secondary }]}>🏙️</Text>
              <TextInput
                style={[styles.subInput, { color: colors.text }]}
                placeholder={t('newEntry.cityPlaceholder')}
                placeholderTextColor="rgba(85, 66, 67, 0.45)"
                value={city}
                onFocus={() => scrollToTarget('city')}
                onChangeText={(val) => {
                  setCity(val);
                  if (autoDetectedLocation) setAutoDetectedLocation(null);
                  scrollToTarget('city');
                }}
              />
            </View>
          </View>
        </View>

        {/* 1 - 10 Rating Selector */}
        <View style={styles.sectionBlock}>
          <RatingSelector value={rating} onChange={setRating} />
        </View>

        {/* Sensory Tags */}
        <View
          style={styles.sectionBlock}
          onLayout={(e) => {
            sectionPositions.current['sensory'] = e.nativeEvent.layout.y;
          }}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
              {t('newEntry.sectionSensory')}
            </Text>
          </View>

          <SensorySelector
            descriptors={selectedDescriptors}
            onChange={setSelectedDescriptors}
            onInputActive={(category) => scrollToTarget('sensory', category)}
            onCategoryLayout={(category, y) => {
              sensoryCategoryPositions.current[category] = y;
            }}
          />
        </View>

        {/* Personal Note / Memo */}
        <View
          style={styles.sectionBlock}
          onLayout={(e) => {
            sectionPositions.current['notes'] = e.nativeEvent.layout.y;
          }}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
              {t('newEntry.sectionNotes')}
            </Text>
          </View>

          <View style={[styles.memoCard, { backgroundColor: colors.surfaceContainerLow }]}>
            <TextInput
              style={[styles.memoInput, { color: colors.text }]}
              placeholder={t('newEntry.notesPlaceholder')}
              placeholderTextColor="rgba(85, 66, 67, 0.45)"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              value={notes}
              onFocus={() => scrollToTarget('notes')}
              onChangeText={(val) => {
                setNotes(val);
                scrollToTarget('notes');
              }}
            />
          </View>
        </View>

        {/* Save Button */}
        <View style={styles.saveButtonWrapper}>
          <Button
            variant="container"
            size="lg"
            icon={isEditing ? '✓' : '🔖'}
            title={
              isSaving
                ? isEditing
                  ? t('newEntry.updating')
                  : t('newEntry.saving')
                : isEditing
                ? t('newEntry.saveEdit')
                : t('newEntry.saveNew')
            }
            onPress={handleSave}
            loading={isSaving}
            fullWidth
          />
          <Text style={[styles.saveFooterHint, { color: colors.textSecondary }]}>
            {isOffline ? t('newEntry.offlinePrefix') : t('newEntry.noAccountPrefix')}
            {t('newEntry.footerHint')}
          </Text>
        </View>
      </ScrollView>

      {/* Confirmation Toast */}
      {showToast && (
        <View style={[styles.toastContainer, { backgroundColor: colors.primary }]}>
          <View style={[styles.toastIconBox, { backgroundColor: colors.secondaryFixed }]}>
            <Text style={[styles.toastIcon, { color: colors.onSecondaryFixed }]}>✓</Text>
          </View>
          <View style={styles.toastTextBox}>
            <Text style={styles.toastTitle}>{isEditing ? t('newEntry.toastTitleEdit') : t('newEntry.toastTitleNew')}</Text>
            <Text style={styles.toastSubtitle}>
              {isEditing ? t('newEntry.toastSubtitleEdit') : t('newEntry.toastSubtitleNew')}
            </Text>
          </View>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.three,
    borderBottomWidth: 1,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 20,
    fontWeight: '700',
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerSubtitle: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
  },
  scrollContainer: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
    gap: Spacing.four,
  },
  sectionBlock: {
    gap: Spacing.two,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  sectionHint: {
    fontSize: 12,
    fontWeight: '500',
  },
  autoDetectedBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  autoDetectedBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  requiredBadge: {
    fontSize: 12,
    fontWeight: '600',
  },
  archetypeScroll: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 2,
  },
  archetypePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 24,
  },
  archetypePillUnselected: {},
  archetypePillSelected: {
    shadowColor: '#4d0011',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  archetypeIcon: {
    fontSize: 14,
  },
  archetypeText: {
    fontSize: 13,
    fontWeight: '600',
  },
  subtypeScroll: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 2,
  },
  subtypePill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  subtypePillUnselected: {},
  subtypePillSelected: {
    shadowColor: '#4d0011',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  subtypeText: {
    fontSize: 13,
    fontWeight: '600',
  },
  inputCard: {
    borderRadius: 18,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    gap: Spacing.two,
    shadowColor: '#4d0011',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  nameInput: {
    fontSize: 18,
    fontWeight: '700',
    paddingVertical: 4,
  },
  inputDivider: {
    height: 1,
    width: '100%',
  },
  subInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  subInputIcon: {
    fontSize: 14,
  },
  subInput: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 4,
  },
  tagsWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 18,
  },
  tagChipUnselected: {},
  tagChipSelected: {},
  tagChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  tagChipTextUnselected: {},
  tagChipTextSelected: {
    fontWeight: '700',
  },
  memoCard: {
    borderRadius: 18,
    padding: Spacing.four,
    shadowColor: '#4d0011',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  memoInput: {
    fontSize: 15,
    lineHeight: 22,
    minHeight: 90,
  },
  saveButtonWrapper: {
    marginTop: Spacing.two,
    gap: 8,
    alignItems: 'center',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingVertical: 16,
    borderRadius: 30,
    gap: 10,
    shadowColor: '#6b1724',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 5,
  },
  saveButtonIcon: {
    fontSize: 18,
  },
  saveButtonText: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  saveFooterHint: {
    fontSize: 12,
    textAlign: 'center',
    opacity: 0.7,
  },
  toastContainer: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
    zIndex: 999,
  },
  toastIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  toastIcon: {
    fontSize: 18,
    fontWeight: '800',
  },
  toastTextBox: {
    flex: 1,
  },
  toastTitle: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  toastSubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
  },
});
