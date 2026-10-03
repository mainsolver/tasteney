import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  useColorScheme,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing } from '@/constants/theme';
import { RatingSelector } from '@/components/rating-selector';
import { ImageSelector } from '@/components/image-selector';
import { SensorySelector } from '@/components/sensory-selector';
import { saveDrinkEntry, getDrinkEntryById } from '@/services/storage';
import { resolveLocationFromAsset } from '@/services/location';
import type { ImagePickerAsset } from 'expo-image-picker';
import { BeverageArchetype, BEVERAGE_SUBTYPES, SensoryDescriptor } from '@/types/drink';

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
  const params = useLocalSearchParams<{ id?: string }>();
  const editId = params.id;
  const isEditing = Boolean(editId);

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
  const [archetype, setArchetype] = useState<BeverageArchetype>('Wine');
  const [subtype, setSubtype] = useState<string | undefined>(undefined);
  const [selectedDescriptors, setSelectedDescriptors] = useState<SensoryDescriptor[]>([]);
  const [originalCreatedAt, setOriginalCreatedAt] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);

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
    setIsGeocodingLocation(true);
    try {
      // Look from the last image added backwards to find the first valid GPS coordinate
      for (let i = newAssets.length - 1; i >= 0; i--) {
        const asset = newAssets[i];
        const location = await resolveLocationFromAsset(asset);
        if (location && (location.country || location.city)) {
          if (location.country) {
            setCountry(location.country);
          }
          if (location.city) {
            setCity(location.city);
          }
          const displayLabel = [location.city, location.country].filter(Boolean).join(', ');
          setAutoDetectedLocation(displayLabel);
          break;
        }
      }
    } catch (err) {
      console.error('Failed to resolve location from asset:', err);
    } finally {
      setIsGeocodingLocation(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Drink Name Required', 'Please provide a name for this drink before saving.');
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
      Alert.alert('Save Failed', 'An error occurred while saving the drink entry. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {/* Header
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + (Platform.OS === 'web' ? 16 : 8),
            backgroundColor: colors.background,
            borderBottomColor: colors.surfaceContainerHigh,
          },
        ]}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            onPress={() => {
              if (router.canGoBack()) {
                router.back();
              } else {
                router.push('/');
              }
            }}
            style={[styles.backButton, { backgroundColor: colors.surfaceContainerLow }]}>
            <Text style={[styles.backIcon, { color: colors.primary }]}>←</Text>
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={[styles.headerSubtitle, { color: colors.secondary }]}>
              {isEditing ? 'UPDATE ENTRY' : 'RITUAL JOURNAL'}
            </Text>
            <Text style={[styles.headerTitle, { color: colors.primary }]}>
              {isEditing ? 'Edit Drink' : 'Log New Drink'}
            </Text>
          </View>
        </View>
      </View>*/}

      <ScrollView
        contentContainerStyle={[
          styles.scrollContainer,
          {
            paddingBottom: insets.bottom + 90,
          },
        ]}
        showsVerticalScrollIndicator={false}>
        {/* Archetype Quick Selector */}
        <View style={styles.sectionBlock}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
              BEVERAGE ARCHETYPE
            </Text>
            <Text style={[styles.sectionHint, { color: colors.secondary }]}>Select category</Text>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.archetypeScroll}>
            {ARCHETYPES.map((item) => {
              const isSelected = archetype === item.label;
              return (
                <TouchableOpacity
                  key={item.label}
                  activeOpacity={0.7}
                  onPress={() => handleArchetypeChange(item.label)}
                  style={[
                    styles.archetypePill,
                    isSelected
                      ? [styles.archetypePillSelected, { backgroundColor: colors.primaryContainer }]
                      : [styles.archetypePillUnselected, { backgroundColor: colors.surfaceContainerLow }],
                  ]}>
                  <Text style={styles.archetypeIcon}>{item.icon}</Text>
                  <Text
                    style={[
                      styles.archetypeText,
                      isSelected ? { color: colors.onPrimary, fontWeight: '700' } : { color: colors.text },
                    ]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Beverage Subtype Selector */}
        {BEVERAGE_SUBTYPES[archetype]?.length > 0 && (
          <View style={styles.sectionBlock}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
                BEVERAGE SUBTYPE
              </Text>
              <Text style={[styles.sectionHint, { color: colors.secondary }]}>Optional</Text>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.subtypeScroll}>
              {BEVERAGE_SUBTYPES[archetype].map((item) => {
                const isSelected = subtype === item;
                return (
                  <TouchableOpacity
                    key={item}
                    activeOpacity={0.7}
                    onPress={() => setSubtype(isSelected ? undefined : item)}
                    style={[
                      styles.subtypePill,
                      isSelected
                        ? [styles.subtypePillSelected, { backgroundColor: colors.primaryContainer }]
                        : [styles.subtypePillUnselected, { backgroundColor: colors.surfaceContainerLow }],
                    ]}>
                    <Text
                      style={[
                        styles.subtypeText,
                        isSelected ? { color: colors.onPrimary, fontWeight: '700' } : { color: colors.text },
                      ]}>
                      {item}
                    </Text>
                  </TouchableOpacity>
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
          />
        </View>

        {/* Name and Manufacturer Fields */}
        <View style={styles.sectionBlock}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
              DRINK IDENTITY
            </Text>
            <Text style={[styles.requiredBadge, { color: colors.secondary }]}>* Required</Text>
          </View>

          <View style={[styles.inputCard, { backgroundColor: colors.surfaceContainerLow }]}>
            <TextInput
              style={[styles.nameInput, { color: colors.primary }]}
              placeholder="Drink Name (e.g. Sassicaia 2018, Geisha Pour-Over)"
              placeholderTextColor="rgba(85, 66, 67, 0.45)"
              value={name}
              onChangeText={setName}
            />

            <View style={[styles.inputDivider, { backgroundColor: colors.surfaceContainerHighest }]} />

            <View style={styles.subInputRow}>
              <Text style={[styles.subInputIcon, { color: colors.secondary }]}>🏷️</Text>
              <TextInput
                style={[styles.subInput, { color: colors.text }]}
                placeholder="Manufacturer / Producer / Estate"
                placeholderTextColor="rgba(85, 66, 67, 0.45)"
                value={manufacturer}
                onChangeText={setManufacturer}
              />
            </View>
          </View>
        </View>

        {/* Location & Origin Fields */}
        <View style={styles.sectionBlock}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
              LOCATION & ORIGIN
            </Text>
            {isGeocodingLocation ? (
              <Text style={[styles.sectionHint, { color: colors.primary }]}>Extracting GPS...</Text>
            ) : autoDetectedLocation ? (
              <View style={[styles.autoDetectedBadge, { backgroundColor: colors.secondaryFixed }]}>
                <Text style={[styles.autoDetectedBadgeText, { color: colors.onSecondaryFixed }]}>
                  📍 Auto-detected
                </Text>
              </View>
            ) : (
              <Text style={[styles.sectionHint, { color: colors.secondary }]}>Optional</Text>
            )}
          </View>

          <View style={[styles.inputCard, { backgroundColor: colors.surfaceContainerLow }]}>
            <View style={styles.subInputRow}>
              <Text style={[styles.subInputIcon, { color: colors.secondary }]}>🌍</Text>
              <TextInput
                style={[styles.subInput, { color: colors.text }]}
                placeholder="Country (e.g. France, Ethiopia, Japan)"
                placeholderTextColor="rgba(85, 66, 67, 0.45)"
                value={country}
                onChangeText={(val) => {
                  setCountry(val);
                  if (autoDetectedLocation) setAutoDetectedLocation(null);
                }}
              />
            </View>

            <View style={[styles.inputDivider, { backgroundColor: colors.surfaceContainerHighest }]} />

            <View style={styles.subInputRow}>
              <Text style={[styles.subInputIcon, { color: colors.secondary }]}>🏙️</Text>
              <TextInput
                style={[styles.subInput, { color: colors.text }]}
                placeholder="City / Region (e.g. Bordeaux, Yirgacheffe, Kyoto)"
                placeholderTextColor="rgba(85, 66, 67, 0.45)"
                value={city}
                onChangeText={(val) => {
                  setCity(val);
                  if (autoDetectedLocation) setAutoDetectedLocation(null);
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
        <View style={styles.sectionBlock}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
              SENSORY DESCRIPTIONS & PROFILE
            </Text>
            <Text style={[styles.sectionHint, { color: colors.secondary }]}>Smell, Taste & Aftertaste</Text>
          </View>

          <SensorySelector
            descriptors={selectedDescriptors}
            onChange={setSelectedDescriptors}
          />
        </View>

        {/* Personal Note / Memo */}
        <View style={styles.sectionBlock}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
              PERSONAL NOTE & MEMO
            </Text>
            <Text style={[styles.sectionHint, { color: colors.secondary }]}>Optional private note</Text>
          </View>

          <View style={[styles.memoCard, { backgroundColor: colors.surfaceContainerLow }]}>
            <TextInput
              style={[styles.memoInput, { color: colors.text }]}
              placeholder="Add your tasting impressions, pairings, temperature, or personal memories..."
              placeholderTextColor="rgba(85, 66, 67, 0.45)"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              value={notes}
              onChangeText={setNotes}
            />
          </View>
        </View>

        {/* Save Button */}
        <View style={styles.saveButtonWrapper}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleSave}
            disabled={isSaving}
            style={[
              styles.saveButton,
              { backgroundColor: colors.primaryContainer },
              isSaving && { opacity: 0.6 },
            ]}>
            <Text style={[styles.saveButtonIcon, { color: colors.secondaryFixed }]}>
              {isEditing ? '✓' : '🔖'}
            </Text>
            <Text style={[styles.saveButtonText, { color: colors.onPrimary }]}>
              {isSaving
                ? isEditing
                  ? 'Updating...'
                  : 'Saving...'
                : isEditing
                ? 'Update Tasting Entry'
                : 'Save Tasting Entry'}
            </Text>
          </TouchableOpacity>
          <Text style={[styles.saveFooterHint, { color: colors.textSecondary }]}>
            Saved locally to private device ledger
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
            <Text style={styles.toastTitle}>{isEditing ? 'Drink Updated' : 'Drink Logged'}</Text>
            <Text style={styles.toastSubtitle}>
              {isEditing ? 'Changes saved successfully to your diary' : 'Saved successfully to your diary'}
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
