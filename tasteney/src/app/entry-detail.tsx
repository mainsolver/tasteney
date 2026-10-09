import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  useColorScheme,
  Platform,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Colors, Spacing, MaxContentWidth } from '@/constants/theme';
import { Button } from '@/components/button';
import { getDrinkEntryById, deleteDrinkEntry } from '@/services/storage';
import { DrinkEntry } from '@/types/drink';
import { SCORE_DESCRIPTIONS } from '@/components/rating-selector';
import {
  translateArchetype,
  translateSubtype,
  translateScoreDescription,
  translateSensoryTag,
  formatDate,
  isGerman,
} from '@/i18n';
import { getArchetypeFallbackImage } from '@/constants/drink-images';

const ARCHETYPE_ICONS: Record<string, string> = {
  Wine: '🍷',
  Coffee: '☕',
  Spirits: '🥃',
  Beer: '🍺',
  Tea: '🍵',
  'Soda & Tonics': '🫧',
  Cocktail: '🍸',
  Other: '✨',
};

const CATEGORY_META: Record<string, { title: string; subtitle: string; icon: string }> = {
  Smell: { title: 'Nose & Aroma', subtitle: 'Aroma & Bouquet', icon: '👃' },
  Taste: { title: 'Palate & Flavor', subtitle: 'Flavor Structure', icon: '👅' },
  Aftertaste: { title: 'Finish & Length', subtitle: 'Lingering Impression', icon: '✨' },
  Finish: { title: 'Finish & Length', subtitle: 'Lingering Impression', icon: '✨' },
};

export default function EntryDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const entryId = params.id;
  const { t } = useTranslation();
  const german = isGerman();

  const scheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];

  const [entry, setEntry] = useState<DrinkEntry | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const scrollViewRef = useRef<ScrollView>(null);

  const loadEntry = useCallback(async () => {
    if (!entryId) {
      setLoading(false);
      return;
    }
    const data = await getDrinkEntryById(entryId);
    setEntry(data);
    setLoading(false);
  }, [entryId]);

  useFocusEffect(
    useCallback(() => {
      loadEntry();
      scrollViewRef.current?.scrollTo({ y: 0, animated: false });
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        window.scrollTo(0, 0);
        document.documentElement?.scrollTo?.(0, 0);
        document.body?.scrollTo?.(0, 0);
      }
    }, [loadEntry])
  );

  const handleEdit = () => {
    if (!entry) return;
    router.push({ pathname: '/new-entry', params: { id: entry.id } });
  };

  const handleDelete = () => {
    if (!entry) return;
    Alert.alert(
      t('entryDetail.deleteTitle'),
      t('entryDetail.deleteMessage', { name: entry.name }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDrinkEntry(entry.id);
              if (router.canGoBack()) {
                router.back();
              } else {
                router.replace('/');
              }
            } catch (err) {
              console.error('Failed to delete entry:', err);
              Alert.alert(t('entryDetail.deleteErrorTitle'), t('entryDetail.deleteErrorMessage'));
            }
          },
        },
      ]
    );
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  };

  if (loading) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>{t('entryDetail.loading')}</Text>
      </View>
    );
  }

  if (!entry) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
        <Text style={styles.notFoundIcon}>🍷</Text>
        <Text style={[styles.notFoundTitle, { color: colors.primary }]}>{t('entryDetail.notFoundTitle')}</Text>
        <Text style={[styles.notFoundSubtitle, { color: colors.textSecondary }]}>
          {t('entryDetail.notFoundSubtitle')}
        </Text>
        <Button
          variant="container"
          size="md"
          title={t('entryDetail.returnToDiary')}
          onPress={handleBack}
          style={{ marginTop: Spacing.two }}
        />
      </View>
    );
  }

  const fallbackImage = getArchetypeFallbackImage(entry.archetype);
  const images = entry.images && entry.images.length > 0 ? entry.images : [fallbackImage];
  const dateFormatted = formatDate(entry.createdAt, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
  const descriptor = translateScoreDescription(entry.rating) || SCORE_DESCRIPTIONS[entry.rating] || `${entry.rating}.0`;
  const locationText = [entry.city, entry.country].filter(Boolean).join(', ');
  const displayArchetype = translateArchetype(entry.archetype);
  const displaySubtype = entry.subtype ? translateSubtype(entry.archetype, entry.subtype) : '';

  // Group sensory descriptors by category
  const groupedDescriptors = (entry.sensoryDescriptors || []).reduce<Record<string, NonNullable<typeof entry.sensoryDescriptors>>>(
    (acc, desc) => {
      const cat = desc.category || 'Taste';
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(desc);
      return acc;
    },
    {}
  );

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={[
          styles.scrollContainer,
          {
            paddingBottom: insets.bottom + 100,
          },
        ]}
        showsVerticalScrollIndicator={false}>
        <View style={styles.contentWrapper}>
          {/* Hero Image Section */}
          <View style={[styles.heroImageContainer, { backgroundColor: colors.surfaceContainerLow }]}>
            <Image
              source={images[activeImageIndex] || fallbackImage}
              style={styles.heroImage}
              contentFit="cover"
            />
            <View style={styles.heroImageGradient} />

            {/* Badges Overlay */}
            <View style={styles.heroBadgesRow}>
              <View style={styles.archetypeBadge}>
                <Text style={styles.archetypeBadgeText}>
                  {ARCHETYPE_ICONS[entry.archetype] || '✨'} {displayArchetype}
                  {displaySubtype ? ` • ${displaySubtype}` : ''}
                </Text>
              </View>

              <View style={[styles.ratingBadge, { backgroundColor: colors.primaryContainer }]}>
                <Text style={[styles.ratingScore, { color: colors.onPrimary }]}>{entry.rating}</Text>
                <Text style={[styles.ratingMax, { color: colors.onPrimary }]}>/10</Text>
              </View>
            </View>

            {/* Image pagination indicator if multiple images */}
            {images.length > 1 && (
              <View style={styles.imagePaginationBar}>
                {images.map((_, idx) => (
                  <TouchableOpacity
                    key={idx}
                    onPress={() => setActiveImageIndex(idx)}
                    style={[
                      styles.imagePaginationDot,
                      idx === activeImageIndex && styles.imagePaginationDotActive,
                    ]}
                  />
                ))}
              </View>
            )}
          </View>

          {/* Thumbnail Gallery Row if multiple images */}
          {images.length > 1 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.thumbnailList}>
              {images.map((imgUri, idx) => {
                const isSelected = idx === activeImageIndex;
                return (
                  <TouchableOpacity
                    key={idx}
                    activeOpacity={0.8}
                    onPress={() => setActiveImageIndex(idx)}
                    style={[
                      styles.thumbnailWrapper,
                      isSelected && [styles.thumbnailSelected, { borderColor: colors.primary }],
                    ]}>
                    <Image source={imgUri} style={styles.thumbnailImage} contentFit="cover" />
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}

          {/* Main Title & Meta Section */}
          <View style={[styles.sectionCard, { backgroundColor: colors.surfaceContainerLow }]}>
            <View style={styles.titleMetaContainer}>
              <View>
                <Text style={[styles.drinkTitle, { color: colors.primary }]}>{entry.name}</Text>
                {displaySubtype ? (
                  <View style={styles.subtypeBadgeContainer}>
                    <View style={[styles.subtypePill, { backgroundColor: colors.surfaceContainerHighest }]}>
                      <Text style={[styles.subtypePillText, { color: colors.primary }]}>
                        {ARCHETYPE_ICONS[entry.archetype] || '✨'} {displayArchetype} • {displaySubtype}
                      </Text>
                    </View>
                  </View>
                ) : null}
              </View>

              {entry.subtype ? (
                <View style={styles.metaRow}>
                  <Text style={styles.metaIcon}>🏷️</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.metaLabel, { color: colors.textSecondary }]}>
                      {german ? 'Unterkategorie / Stil' : 'Subtype / Style'}
                    </Text>
                    <Text style={[styles.metaValue, { color: colors.secondary }]}>
                      {displaySubtype}{' '}
                      <Text style={{ color: colors.textSecondary, fontWeight: '400', fontSize: 13 }}>
                        ({displayArchetype})
                      </Text>
                    </Text>
                  </View>
                </View>
              ) : (
                <View style={styles.metaRow}>
                  <Text style={styles.metaIcon}>🏷️</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.metaLabel, { color: colors.textSecondary }]}>{t('entryDetail.category')}</Text>
                    <Text style={[styles.metaValue, { color: colors.secondary }]}>{displayArchetype}</Text>
                  </View>
                </View>
              )}

              {entry.manufacturer ? (
                <View style={styles.metaRow}>
                  <Text style={styles.metaIcon}>🏛️</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.metaLabel, { color: colors.textSecondary }]}>{t('entryDetail.producer')}</Text>
                    <Text style={[styles.metaValue, { color: colors.secondary }]}>{entry.manufacturer}</Text>
                  </View>
                </View>
              ) : null}

              {locationText ? (
                <View style={styles.metaRow}>
                  <Text style={styles.metaIcon}>📍</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.metaLabel, { color: colors.textSecondary }]}>{t('entryDetail.origin')}</Text>
                    <Text style={[styles.metaValue, { color: colors.secondary }]}>{locationText}</Text>
                  </View>
                </View>
              ) : null}

              <View style={styles.metaRow}>
                <Text style={styles.metaIcon}>📅</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.metaLabel, { color: colors.textSecondary }]}>
                    {german ? 'Verkostungsdatum' : 'Tasting Date'}
                  </Text>
                  <Text style={[styles.metaValue, { color: colors.textSecondary }]}>{dateFormatted}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Appraisal & Rating Card */}
          <View style={[styles.sectionCard, { backgroundColor: colors.surfaceContainerLow }]}>
            <View style={styles.ratingCardHeader}>
              <View>
                <Text style={[styles.sectionSubLabel, { color: colors.textSecondary }]}>
                  {t('rating.overallAppraisal')}
                </Text>
                <Text style={[styles.ratingDescriptorText, { color: colors.primary }]}>
                  {descriptor}
                </Text>
              </View>

              <View style={[styles.ratingScorePillBadge, { backgroundColor: colors.primaryContainer }]}>
                <Text style={[styles.ratingScoreNumber, { color: colors.onPrimary }]}>{entry.rating}</Text>
                <Text style={[styles.ratingScoreTotal, { color: colors.onPrimary }]}> / 10</Text>
              </View>
            </View>

            {/* Visual 1-10 Scale Bar */}
            <View style={styles.scoreBarContainer}>
              {Array.from({ length: 10 }, (_, i) => i + 1).map((score) => {
                const isSelected = score === entry.rating;
                const isFilled = score <= entry.rating;
                return (
                  <View
                    key={score}
                    style={[
                      styles.scoreBarSegment,
                      {
                        backgroundColor: isSelected
                          ? colors.primaryContainer
                          : isFilled
                          ? colors.surfaceContainerHigh
                          : colors.surfaceContainerLowest,
                        borderColor: isSelected ? colors.primary : 'transparent',
                        borderWidth: isSelected ? 2 : 0,
                      },
                    ]}>
                    <Text
                      style={[
                        styles.scoreBarText,
                        {
                          color: isSelected
                            ? colors.onPrimary
                            : isFilled
                            ? colors.primary
                            : colors.outline,
                          fontWeight: isSelected ? '800' : '500',
                        },
                      ]}>
                      {score}
                    </Text>
                  </View>
                );
              })}
            </View>

            <View style={styles.ratingScaleLabels}>
              <Text style={[styles.scaleLabelText, { color: colors.textSecondary }]}>1.0 {t('rating.subpar')}</Text>
              <Text style={[styles.scaleLabelText, { color: colors.textSecondary }]}>5.0 {t('rating.benchmark')}</Text>
              <Text style={[styles.scaleLabelText, { color: colors.textSecondary }]}>10.0 {t('rating.masterwork')}</Text>
            </View>
          </View>

          {/* Sensory Profile Section */}
          {entry.sensoryDescriptors && entry.sensoryDescriptors.length > 0 && (
            <View style={[styles.sectionCard, { backgroundColor: colors.surfaceContainerLow }]}>
              <View style={styles.sectionHeaderRow}>
                <Text style={[styles.sectionSubLabel, { color: colors.textSecondary }]}>
                  {t('entryDetail.sensoryImpressions')}
                </Text>
                <Text style={[styles.sectionCountText, { color: colors.secondary }]}>
                  {entry.sensoryDescriptors.length} {german ? (entry.sensoryDescriptors.length === 1 ? 'Eindruck erfasst' : 'Eindrücke erfasst') : (entry.sensoryDescriptors.length === 1 ? 'note identified' : 'notes identified')}
                </Text>
              </View>

              {Object.entries(groupedDescriptors).map(([category, items]) => {
                const meta = CATEGORY_META[category] || {
                  title: category,
                  subtitle: 'Sensory notes',
                  icon: '✨',
                };
                const catTitle = t(`sensory.categories.${category}.detailTitle`, { defaultValue: meta.title });
                return (
                  <View key={category} style={styles.sensoryCategoryBlock}>
                    <View style={styles.sensoryCategoryHeader}>
                      <Text style={styles.sensoryCategoryIcon}>{meta.icon}</Text>
                      <Text style={[styles.sensoryCategoryTitle, { color: colors.primary }]}>
                        {catTitle}
                      </Text>
                    </View>

                    <View style={styles.sensoryChipsWrapper}>
                      {items.map((desc) => (
                        <View
                          key={desc.id}
                          style={[
                            styles.sensoryChip,
                            { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.surfaceContainerHigh },
                          ]}>
                          <Text style={[styles.sensoryChipName, { color: colors.text }]}>
                            {translateSensoryTag(desc.name)}
                          </Text>
                          {desc.intensity ? (
                            <View style={[styles.intensityBadge, { backgroundColor: colors.surfaceContainerHighest }]}>
                              <Text style={[styles.intensityText, { color: colors.primary }]}>
                                {'★'.repeat(desc.intensity)}
                                <Text style={{ opacity: 0.3 }}>{'★'.repeat(5 - desc.intensity)}</Text>
                              </Text>
                            </View>
                          ) : null}
                        </View>
                      ))}
                    </View>
                  </View>
                );
              })}
            </View>
          )}

          {/* Tasting Notes / Cellar Memo */}
          {entry.notes ? (
            <View style={[styles.sectionCard, { backgroundColor: colors.surfaceContainerLow }]}>
              <Text style={[styles.sectionSubLabel, { color: colors.textSecondary }]}>
                {german ? 'VERKOSTUNGSNOTIZEN & KOMMENTAR' : 'CELLAR & PAIRING MEMO'}
              </Text>
              <View style={[styles.notesCard, { backgroundColor: colors.surfaceContainerLowest }]}>
                <Text style={[styles.notesQuoteMark, { color: colors.primary }]}>“</Text>
                <Text style={[styles.notesBodyText, { color: colors.text }]}>{entry.notes}</Text>
              </View>
            </View>
          ) : null}

          {/* Bottom Action Buttons */}
          <View style={styles.bottomActionsRow}>
            <Button
              variant="container"
              size="md"
              icon="✎"
              title={german ? 'Bearbeiten' : 'Edit'}
              onPress={handleEdit}
              style={{ flex: 1 }}
            />

            <Button
              variant="danger"
              size="md"
              icon="🗑️"
              title={german ? 'Löschen' : 'Delete'}
              onPress={handleDelete}
              style={{ flex: 1 }}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.two,
  },
  loadingText: {
    fontSize: 16,
    fontStyle: 'italic',
  },
  notFoundIcon: {
    fontSize: 48,
    marginBottom: Spacing.two,
  },
  notFoundTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: Spacing.one,
  },
  notFoundSubtitle: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: Spacing.four,
    maxWidth: 320,
  },
  notFoundButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
  },
  notFoundButtonText: {
    fontSize: 15,
    fontWeight: '700',
  },
  header: {
    borderBottomWidth: 1,
    paddingBottom: 12,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    width: '100%',
    gap: Spacing.two,
  },
  headerIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerIconText: {
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
    textTransform: 'uppercase',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerActionButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  deleteBtnText: {
    fontSize: 15,
  },
  scrollContainer: {
    paddingTop: Spacing.three,
  },
  contentWrapper: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    paddingHorizontal: Spacing.three,
    gap: Spacing.three,
  },
  heroImageContainer: {
    width: '100%',
    height: 280,
    borderRadius: 24,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 3,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroImageGradient: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.18)',
  },
  heroBadgesRow: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  archetypeBadge: {
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  archetypeBadgeText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'baseline',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  ratingScore: {
    fontSize: 17,
    fontWeight: '800',
  },
  ratingMax: {
    fontSize: 11,
    fontWeight: '600',
    opacity: 0.85,
  },
  imagePaginationBar: {
    position: 'absolute',
    bottom: 12,
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 6,
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  imagePaginationDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  imagePaginationDotActive: {
    backgroundColor: '#ffffff',
    width: 14,
  },
  thumbnailList: {
    gap: 10,
    paddingVertical: 2,
  },
  thumbnailWrapper: {
    width: 64,
    height: 64,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  thumbnailSelected: {
    borderColor: '#4d0011',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  sectionCard: {
    borderRadius: 20,
    padding: Spacing.four,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  titleMetaContainer: {
    gap: 12,
  },
  drinkTitle: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
    lineHeight: 32,
  },
  subtypeBadgeContainer: {
    flexDirection: 'row',
    marginTop: 6,
  },
  subtypePill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  subtypePillText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  metaIcon: {
    fontSize: 18,
  },
  metaLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  metaValue: {
    fontSize: 15,
    fontWeight: '600',
    marginTop: 1,
  },
  ratingCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  sectionSubLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  ratingDescriptorText: {
    fontSize: 17,
    fontStyle: 'italic',
    fontWeight: '700',
    marginTop: 3,
  },
  ratingScorePillBadge: {
    flexDirection: 'row',
    alignItems: 'baseline',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
  },
  ratingScoreNumber: {
    fontSize: 18,
    fontWeight: '800',
  },
  ratingScoreTotal: {
    fontSize: 12,
    fontWeight: '600',
    opacity: 0.9,
  },
  scoreBarContainer: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 4,
  },
  scoreBarSegment: {
    flex: 1,
    height: 32,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreBarText: {
    fontSize: 12,
  },
  ratingScaleLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingHorizontal: 2,
  },
  scaleLabelText: {
    fontSize: 11,
    opacity: 0.7,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionCountText: {
    fontSize: 12,
    fontWeight: '600',
  },
  sensoryCategoryBlock: {
    marginTop: 10,
    gap: 8,
  },
  sensoryCategoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sensoryCategoryIcon: {
    fontSize: 16,
  },
  sensoryCategoryTitle: {
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sensoryChipsWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  sensoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
    gap: 6,
  },
  sensoryChipName: {
    fontSize: 14,
    fontWeight: '600',
  },
  intensityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  intensityText: {
    fontSize: 10,
    fontWeight: '700',
  },
  notesCard: {
    marginTop: 10,
    padding: Spacing.three,
    borderRadius: 14,
    position: 'relative',
  },
  notesQuoteMark: {
    fontSize: 32,
    lineHeight: 28,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    opacity: 0.4,
    marginBottom: -8,
  },
  notesBodyText: {
    fontSize: 15,
    lineHeight: 23,
    fontStyle: 'italic',
  },
  bottomActionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 6,
  },
  primaryActionButton: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4d0011',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  primaryActionText: {
    fontSize: 16,
    fontWeight: '700',
  },
  deleteActionButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    backgroundColor: 'rgba(186, 26, 26, 0.04)',
  },
  deleteActionText: {
    fontSize: 15,
    fontWeight: '700',
  },
});
