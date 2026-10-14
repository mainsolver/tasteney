import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  useColorScheme,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Colors, Spacing } from '@/constants/theme';
import { BeverageArchetype, SensoryDescriptor, DrinkEntry } from '@/types/drink';
import { translateSensoryTag, isGerman } from '@/i18n';

export type SensoryCategory = 'Smell' | 'Taste' | 'Aftertaste';

interface CategoryConfig {
  key: SensoryCategory;
  title: string;
  subtitle: string;
  icon: string;
  placeholder: string;
}

export const ARCHETYPE_SENSORY_PRESETS: Record<BeverageArchetype, Record<SensoryCategory, string[]>> = {
  Wine: {
    Smell: ['Berry', 'Cherry', 'Oak', 'Earthy'],
    Taste: ['Blackberry', 'Cherry', 'Apple', 'Peach'],
    Aftertaste: ['Tannins', 'Minerality', 'Acidity', 'Oak'],
  },
  Coffee: {
    Smell: ['Roast', 'Caramel', 'Hazelnut', 'Floral'],
    Taste: ['Chocolate', 'Espresso', 'Butterscotch', 'Citrus'],
    Aftertaste: ['Bitter', 'Warmth', 'Vanilla', 'Sweet'],
  },
  Spirits: {
    Smell: ['Smoky', 'Oak', 'Caramel', 'Spicy'],
    Taste: ['Cinnamon', 'Tobacco', 'Honey', 'Pepper'],
    Aftertaste: ['Oak', 'Smoky', 'Warmth', 'Vanilla'],
  },
  Beer: {
    Smell: ['Citrus', 'Tropical', 'Herbal', 'Apple'],
    Taste: ['Apple', 'Nutty', 'Grassy', 'Cherry'],
    Aftertaste: ['Acidity', 'Bitter', 'Saline', 'Minerality'],
  },
  Tea: {
    Smell: ['Honey', 'Floral', 'Herbal', 'Citrus'],
    Taste: ['Bergamot', 'Grassy', 'Peach', 'Honey'],
    Aftertaste: ['Sweet', 'Minerality', 'Acidity', 'Tannins'],
  },
  'Soda & Tonics': {
    Smell: ['Citrus', 'Herbal', 'Tropical', 'Apple'],
    Taste: ['Citrus', 'Apple', 'Cherry', 'Peach'],
    Aftertaste: ['Acidity', 'Saline', 'Minerality', 'Sweet'],
  },
  Cocktail: {
    Smell: ['Citrus', 'Herbal', 'Floral', 'Spicy'],
    Taste: ['Citrus', 'Cinnamon', 'Cherry', 'Honey'],
    Aftertaste: ['Acidity', 'Vanilla', 'Smoky', 'Oak'],
  },
  Other: {
    Smell: ['Apple', 'Honey', 'Earthy', 'Tropical'],
    Taste: ['Apple', 'Honey', 'Peach', 'Grassy'],
    Aftertaste: ['Acidity', 'Sweet', 'Saline', 'Minerality'],
  },
};

const CATEGORIES: CategoryConfig[] = [
  {
    key: 'Smell',
    title: 'Smell',
    subtitle: 'Nose & Aroma Profile',
    icon: '👃',
    placeholder: 'Type or choose aroma (e.g. Floral, Oak)...',
  },
  {
    key: 'Taste',
    title: 'Taste',
    subtitle: 'Palate & Flavor Structure',
    icon: '👅',
    placeholder: 'Type or choose flavor (e.g. Chocolate, Citrus)...',
  },
  {
    key: 'Aftertaste',
    title: 'Aftertaste',
    subtitle: 'Finish & Lingering Impressions',
    icon: '✨',
    placeholder: 'Type or choose finish (e.g. Tannins, Minerality)...',
  },
];

function createDescriptorId(category: string, name: string): string {
  const sanitized = name.toLowerCase().replace(/[^a-z0-9]/g, '_');
  return `desc_${category.toLowerCase()}_${sanitized}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
}

export function isSameSensoryTag(tagA: string, tagB: string): boolean {
  const a = tagA.trim().toLowerCase();
  const b = tagB.trim().toLowerCase();
  if (a === b) return true;
  const aTrans = translateSensoryTag(tagA).trim().toLowerCase();
  const bTrans = translateSensoryTag(tagB).trim().toLowerCase();
  return aTrans === bTrans || aTrans === b || a === bTrans;
}

interface SensorySelectorProps {
  descriptors: SensoryDescriptor[];
  onChange: (descriptors: SensoryDescriptor[]) => void;
  archetype?: BeverageArchetype;
  entries?: DrinkEntry[];
  onInputActive?: (category: SensoryCategory) => void;
  onCategoryLayout?: (category: SensoryCategory, y: number) => void;
}

export function SensorySelector({
  descriptors,
  onChange,
  archetype,
  entries,
  onInputActive,
  onCategoryLayout,
}: SensorySelectorProps) {
  const scheme = useColorScheme();
  const { t } = useTranslation();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const german = isGerman();

  const activeArchetype = archetype || 'Wine';

  // Aggregate tag usage frequency per category for the current archetype
  const rankedCategoryCandidates = useMemo(() => {
    const defaultPresets = ARCHETYPE_SENSORY_PRESETS[activeArchetype] || {
      Smell: [],
      Taste: [],
      Aftertaste: [],
    };

    const countsByCategory: Record<SensoryCategory, Record<string, number>> = {
      Smell: {},
      Taste: {},
      Aftertaste: {},
    };

    const userTagsByCategory: Record<SensoryCategory, string[]> = {
      Smell: [],
      Taste: [],
      Aftertaste: [],
    };

    if (entries && entries.length > 0) {
      for (const entry of entries) {
        if (entry.archetype === activeArchetype && entry.sensoryDescriptors) {
          for (const desc of entry.sensoryDescriptors) {
            const rawCat = desc.category;
            const targetCat: SensoryCategory | null =
              rawCat === 'Smell' ? 'Smell' : rawCat === 'Taste' ? 'Taste' : rawCat === 'Aftertaste' || rawCat === 'Finish' ? 'Aftertaste' : null;

            if (targetCat && desc.name) {
              const nameTrimmed = desc.name.trim();
              const nameLower = nameTrimmed.toLowerCase();
              countsByCategory[targetCat][nameLower] = (countsByCategory[targetCat][nameLower] || 0) + 1;

              // Track canonical user name if not already tracked (translation-aware)
              if (!userTagsByCategory[targetCat].some((t) => isSameSensoryTag(t, nameTrimmed))) {
                userTagsByCategory[targetCat].push(nameTrimmed);
              }
            }
          }
        }
      }
    }

    const result: Record<SensoryCategory, string[]> = {
      Smell: [],
      Taste: [],
      Aftertaste: [],
    };

    const categories: SensoryCategory[] = ['Smell', 'Taste', 'Aftertaste'];
    for (const cat of categories) {
      const presets = defaultPresets[cat] || [];
      const userTags = userTagsByCategory[cat] || [];

      // Combine presets and user tags uniquely (translation-aware & case-insensitive)
      const combined: string[] = [...presets];
      for (const uTag of userTags) {
        if (!combined.some((p) => isSameSensoryTag(p, uTag))) {
          combined.push(uTag);
        }
      }

      const getCount = (tag: string): number => {
        const raw = tag.trim().toLowerCase();
        const trans = translateSensoryTag(tag).trim().toLowerCase();
        let count = countsByCategory[cat][raw] || 0;
        if (trans !== raw && countsByCategory[cat][trans]) {
          count += countsByCategory[cat][trans];
        }
        return count;
      };

      // Sort descending by usage frequency
      combined.sort((a, b) => {
        const countA = getCount(a);
        const countB = getCount(b);
        if (countB !== countA) {
          return countB - countA;
        }

        const indexA = presets.findIndex((p) => isSameSensoryTag(p, a));
        const indexB = presets.findIndex((p) => isSameSensoryTag(p, b));

        if (indexA !== -1 && indexB !== -1) {
          return indexA - indexB;
        }
        if (indexA !== -1) return -1;
        if (indexB !== -1) return 1;

        return translateSensoryTag(a).localeCompare(translateSensoryTag(b));
      });

      result[cat] = combined;
    }

    return result;
  }, [activeArchetype, entries]);

  const [inputValues, setInputValues] = useState<Record<SensoryCategory, string>>({
    Smell: '',
    Taste: '',
    Aftertaste: '',
  });

  const handleInputChange = (category: SensoryCategory, text: string) => {
    setInputValues((prev) => ({ ...prev, [category]: text }));
  };

  const isCategoryMatch = (descCat: string, targetCat: SensoryCategory) => {
    if (descCat === targetCat) return true;
    return targetCat === 'Aftertaste' && descCat === 'Finish';
  };

  const addTag = (category: SensoryCategory, tagName: string, intensity: number = 3) => {
    const trimmed = tagName.trim();
    if (!trimmed) return;

    // Check if tag already exists in this category (translation-aware)
    const existingIndex = descriptors.findIndex(
      (d) => isCategoryMatch(d.category, category) && isSameSensoryTag(d.name, trimmed)
    );

    if (existingIndex >= 0) {
      // Clear input if duplicate
      setInputValues((prev) => ({ ...prev, [category]: '' }));
      return;
    }

    const newDescriptor: SensoryDescriptor = {
      id: createDescriptorId(category, trimmed),
      name: trimmed,
      category,
      intensity,
    };

    onChange([...descriptors, newDescriptor]);
    setInputValues((prev) => ({ ...prev, [category]: '' }));
  };

  const removeTag = (id: string) => {
    onChange(descriptors.filter((d) => d.id !== id));
  };

  const updateIntensity = (id: string, intensity: number) => {
    onChange(
      descriptors.map((d) => (d.id === id ? { ...d, intensity: Math.max(1, Math.min(5, intensity)) } : d))
    );
  };

  return (
    <View style={styles.container}>
      {CATEGORIES.map((catConfig) => {
        const category = catConfig.key;
        const currentInput = inputValues[category] || '';
        const categoryDescriptors = descriptors.filter((d) => isCategoryMatch(d.category, category));

        const catTitle = t(`sensory.categories.${category}.title`, { defaultValue: catConfig.title });
        const catSubtitle = t(`sensory.categories.${category}.subtitle`, { defaultValue: catConfig.subtitle });
        const catPlaceholder = t(`sensory.categories.${category}.placeholder`, { defaultValue: catConfig.placeholder });

        // Calculate autocomplete suggestions using localized display and matching
        const candidateTags = rankedCategoryCandidates[category] || [];
        const trimmedQuery = currentInput.trim().toLowerCase();
        const existingNames = new Set(
          categoryDescriptors.flatMap((d) => [
            d.name.trim().toLowerCase(),
            translateSensoryTag(d.name).trim().toLowerCase(),
          ])
        );

        // Deduplicate and filter suggestions against existing descriptors and query
        const matchingPresets: string[] = [];
        const seenPresets = new Set<string>();

        for (const preset of candidateTags) {
          const localized = translateSensoryTag(preset);
          const localizedLower = localized.trim().toLowerCase();
          const rawLower = preset.trim().toLowerCase();

          const isAlreadyAdded =
            existingNames.has(localizedLower) ||
            existingNames.has(rawLower) ||
            categoryDescriptors.some((d) => isSameSensoryTag(d.name, preset));

          if (isAlreadyAdded) continue;

          const matchesQuery =
            trimmedQuery === '' ||
            localizedLower.includes(trimmedQuery) ||
            rawLower.includes(trimmedQuery);

          if (matchesQuery && !seenPresets.has(localizedLower)) {
            seenPresets.add(localizedLower);
            matchingPresets.push(localized);
            if (matchingPresets.length >= 4) break;
          }
        }

        const hasExactMatch =
          trimmedQuery.length > 0 &&
          (existingNames.has(trimmedQuery) ||
            existingNames.has(translateSensoryTag(trimmedQuery).toLowerCase()) ||
            candidateTags.some((preset) => isSameSensoryTag(preset, trimmedQuery)));

        const showCustomOption =
          trimmedQuery.length > 0 &&
          !hasExactMatch &&
          !existingNames.has(trimmedQuery) &&
          !existingNames.has(translateSensoryTag(trimmedQuery).toLowerCase());

        return (
          <View
            key={category}
            onLayout={(e) => onCategoryLayout?.(category, e.nativeEvent.layout.y)}
            style={[styles.categoryCard, { backgroundColor: colors.surfaceContainerLow }]}>
            {/* Category Header */}
            <View style={styles.categoryHeader}>
              <View style={styles.categoryTitleRow}>
                <Text style={styles.categoryIcon}>{catConfig.icon}</Text>
                <View>
                  <Text style={[styles.categoryTitle, { color: colors.primary }]}>
                    {catTitle}
                  </Text>
                  <Text style={[styles.categorySubtitle, { color: colors.textSecondary }]}>
                    {catSubtitle}
                  </Text>
                </View>
              </View>

              {categoryDescriptors.length > 0 && (
                <View
                  style={[
                    styles.countBadge,
                    { backgroundColor: colors.surfaceContainerHighest },
                  ]}>
                  <Text style={[styles.countBadgeText, { color: colors.primary }]}>
                    {categoryDescriptors.length} {german ? (categoryDescriptors.length === 1 ? 'Eintrag' : 'Einträge') : (categoryDescriptors.length === 1 ? 'tag' : 'tags')}
                  </Text>
                </View>
              )}
            </View>

            {/* Input with Autocomplete */}
            <View style={styles.inputContainer}>
              <View
                style={[
                  styles.inputWrapper,
                  {
                    backgroundColor: colors.surfaceContainerLowest,
                    borderColor: colors.surfaceContainerHigh,
                  },
                ]}>
                <Text style={styles.inputSearchIcon}>🔍</Text>
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder={catPlaceholder}
                  placeholderTextColor="rgba(85, 66, 67, 0.45)"
                  value={currentInput}
                  onFocus={() => onInputActive?.(category)}
                  onChangeText={(text) => {
                    handleInputChange(category, text);
                    onInputActive?.(category);
                  }}
                  onSubmitEditing={() => {
                    if (currentInput.trim()) {
                      addTag(category, currentInput);
                    }
                  }}
                  returnKeyType="done"
                />
                {currentInput.trim().length > 0 && (
                  <TouchableOpacity
                    onPress={() => addTag(category, currentInput)}
                    activeOpacity={0.7}
                    style={[styles.addBtn, { backgroundColor: colors.primaryContainer }]}>
                    <Text style={[styles.addBtnText, { color: colors.onPrimary }]}>{t('sensory.add')}</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Autocomplete Suggestions / Quick Tags */}
              {(currentInput.trim().length > 0 || categoryDescriptors.length === 0) && (
                <View style={styles.suggestionsContainer}>
                  <Text style={[styles.suggestionsLabel, { color: colors.secondary }]}>
                    {currentInput.trim().length > 0 ? (german ? 'Vorschläge:' : 'Suggestions:') : (german ? 'Beliebte Voreinstellungen:' : 'Popular presets:')}
                  </Text>
                  <View style={styles.suggestionsList}>
                    {showCustomOption && (
                      <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => addTag(category, currentInput)}
                        style={[
                          styles.suggestionChip,
                          styles.customChip,
                          {
                            backgroundColor: colors.secondaryFixed,
                            borderColor: colors.secondary,
                          },
                        ]}>
                        <Text style={[styles.suggestionChipText, { color: colors.onSecondaryFixed }]}>
                          + {german ? `Eigene(s) "${currentInput.trim()}" hinzufügen` : `Add custom "${currentInput.trim()}"`}
                        </Text>
                      </TouchableOpacity>
                    )}

                    {matchingPresets.map((preset, idx) => (
                      <TouchableOpacity
                        key={`suggestion-${category}-${preset}-${idx}`}
                        activeOpacity={0.7}
                        onPress={() => addTag(category, preset)}
                        style={[
                          styles.suggestionChip,
                          { backgroundColor: colors.surfaceContainer },
                        ]}>
                        <Text style={[styles.suggestionChipText, { color: colors.textSecondary }]}>
                          + {preset}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}
            </View>

            {/* Added Tags with Intensity Controls */}
            {categoryDescriptors.length > 0 && (
              <View style={styles.tagsContainer}>
                <Text style={[styles.tagsSectionLabel, { color: colors.textSecondary }]}>
                  {german ? `HINZUGEFÜGTE ${catTitle.toUpperCase()}-EINDRÜCKE & INTENSITÄT:` : `ADDED ${category.toUpperCase()} DESCRIPTORS & INTENSITY:`}
                </Text>

                <View style={styles.tagsList}>
                  {categoryDescriptors.map((desc) => (
                    <View
                      key={desc.id}
                      style={[
                        styles.tagRowCard,
                        {
                          backgroundColor: colors.surfaceContainerLowest,
                          borderColor: colors.surfaceContainerHigh,
                        },
                      ]}>
                      {/* Tag Name & Category */}
                      <View style={styles.tagInfo}>
                        <Text style={[styles.tagName, { color: colors.text }]}>
                          {translateSensoryTag(desc.name)}
                        </Text>
                        <Text style={[styles.intensitySummary, { color: colors.secondary }]}>
                          {t('sensory.intensityPrefix')} {desc.intensity}/5
                        </Text>
                      </View>

                      {/* 1-5 Intensity Buttons */}
                      <View style={styles.intensityControls}>
                        {[1, 2, 3, 4, 5].map((lvl) => {
                          const isLevelActive = desc.intensity === lvl;
                          return (
                            <TouchableOpacity
                              key={lvl}
                              activeOpacity={0.7}
                              onPress={() => updateIntensity(desc.id, lvl)}
                              style={[
                                styles.intensityPill,
                                isLevelActive
                                  ? [styles.intensityPillActive, { backgroundColor: colors.primaryContainer }]
                                  : [styles.intensityPillInactive, { backgroundColor: colors.surfaceContainer }],
                              ]}>
                              <Text
                                style={[
                                  styles.intensityPillText,
                                  isLevelActive
                                    ? [styles.intensityPillTextActive, { color: colors.onPrimary }]
                                    : [styles.intensityPillTextInactive, { color: colors.textSecondary }],
                                ]}>
                                {lvl}
                              </Text>
                            </TouchableOpacity>
                          );
                        })}
                      </View>

                      {/* Remove Tag Button */}
                      <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => removeTag(desc.id)}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        style={[styles.removeTagBtn, { backgroundColor: colors.surfaceContainerHigh }]}>
                        <Text style={[styles.removeTagBtnText, { color: colors.textSecondary }]}>✕</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.three,
  },
  categoryCard: {
    borderRadius: 20,
    padding: Spacing.three,
    gap: Spacing.two,
    shadowColor: '#4d0011',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  categoryTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryIcon: {
    fontSize: 22,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  categorySubtitle: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 1,
  },
  countBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  countBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  inputContainer: {
    gap: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  inputSearchIcon: {
    fontSize: 13,
    marginRight: 6,
    opacity: 0.6,
  },
  input: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 6,
  },
  addBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  addBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  suggestionsContainer: {
    gap: 6,
    marginTop: 2,
  },
  suggestionsLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  suggestionsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  suggestionChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  customChip: {
    borderWidth: 1,
  },
  suggestionChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  tagsContainer: {
    gap: 8,
    marginTop: 6,
  },
  tagsSectionLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  tagsList: {
    gap: 8,
  },
  tagRowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1,
    gap: 8,
  },
  tagInfo: {
    flex: 1,
    gap: 2,
  },
  tagName: {
    fontSize: 13,
    fontWeight: '700',
  },
  intensitySummary: {
    fontSize: 11,
    fontWeight: '600',
  },
  intensityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  intensityPill: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  intensityPillActive: {
    shadowColor: '#4d0011',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.25,
    shadowRadius: 2,
    elevation: 2,
  },
  intensityPillInactive: {},
  intensityPillText: {
    fontSize: 11,
  },
  intensityPillTextActive: {
    fontWeight: '800',
  },
  intensityPillTextInactive: {
    fontWeight: '600',
  },
  removeTagBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 2,
  },
  removeTagBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
});
