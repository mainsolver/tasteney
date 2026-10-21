import React, { useState, useCallback, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  useColorScheme,
  Platform,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Colors, Spacing } from '@/constants/theme';
import { Button } from '@/components/button';
import { SearchBar } from '@/components/search-bar';
import { CategoryPill } from '@/components/category-pill';
import { getDrinkEntries } from '@/services/storage';
import { resolveImageUri } from '@/services/image-storage';
import { BeverageArchetype, DrinkEntry } from '@/types/drink';
import { getUserPreferences, sortArchetypesWithPreferences } from '@/services/user-preferences';
import {
  translateArchetype,
  translateSubtype,
  formatDate,
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

const BASE_ARCHETYPES: BeverageArchetype[] = [
  'Wine',
  'Coffee',
  'Spirits',
  'Beer',
  'Tea',
  'Cocktail',
  'Soda & Tonics',
  'Other',
];

export default function DiaryHomeScreen() {
  const router = useRouter();
  const scheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];

  const [entries, setEntries] = useState<DrinkEntry[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAlcoholInfo, setShowAlcoholInfo] = useState(false);
  const flatListRef = useRef<FlatList<DrinkEntry>>(null);

  const loadEntries = async () => {
    const [data, prefs] = await Promise.all([
      getDrinkEntries(),
      getUserPreferences(),
    ]);
    setEntries(data);
    setShowAlcoholInfo(prefs.showAlcoholInfo);
  };

  useFocusEffect(
    useCallback(() => {
      loadEntries();
      flatListRef.current?.scrollToOffset({ offset: 0, animated: false });
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        window.scrollTo(0, 0);
        document.documentElement?.scrollTo?.(0, 0);
        document.body?.scrollTo?.(0, 0);
      }
    }, [])
  );

  const filteredEntries = entries.filter((item) => {
    const matchesCategory = selectedCategory === 'All' || item.archetype === selectedCategory;
    const query = searchQuery.trim().toLowerCase();
    const translatedArchetype = translateArchetype(item.archetype).toLowerCase();
    const translatedSubtype = item.subtype ? translateSubtype(item.archetype, item.subtype).toLowerCase() : '';
    const matchesQuery =
      query === '' ||
      item.name.toLowerCase().includes(query) ||
      item.manufacturer.toLowerCase().includes(query) ||
      item.archetype.toLowerCase().includes(query) ||
      translatedArchetype.includes(query) ||
      (item.country ? item.country.toLowerCase().includes(query) : false) ||
      (item.city ? item.city.toLowerCase().includes(query) : false) ||
      (item.subtype ? item.subtype.toLowerCase().includes(query) || translatedSubtype.includes(query) : false) ||
      item.notes.toLowerCase().includes(query);
    return matchesCategory && matchesQuery;
  });

  const { categoryCounts, sortedCategories, sortedArchetypes } = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const entry of entries) {
      if (entry.archetype) {
        counts[entry.archetype] = (counts[entry.archetype] || 0) + 1;
      }
    }

    const availableArchetypes = BASE_ARCHETYPES.filter((arch) => (counts[arch] || 0) > 0);
    const sorted = sortArchetypesWithPreferences(availableArchetypes, counts, showAlcoholInfo);

    return {
      categoryCounts: counts,
      sortedCategories: ['All', ...sorted],
      sortedArchetypes: sorted,
    };
  }, [entries, showAlcoholInfo]);

  const activeIcon = selectedCategory !== 'All' ? ARCHETYPE_ICONS[selectedCategory] || '🥂' : '🌟';

  const handleAddNewEntry = () => {
    if (selectedCategory !== 'All') {
      router.push({
        pathname: '/new-entry',
        params: { archetype: selectedCategory },
      });
    } else {
      const defaultArchetypeList = sortArchetypesWithPreferences(BASE_ARCHETYPES, {}, showAlcoholInfo);
      const topArchetype = sortedArchetypes[0] || defaultArchetypeList[0];
      router.push({
        pathname: '/new-entry',
        params: { archetype: topArchetype },
      });
    }
  };

  const renderItem = ({ item }: { item: DrinkEntry }) => {
    const rawImage = item.images && item.images.length > 0 ? item.images[0] : null;
    const resolvedUri = resolveImageUri(rawImage);
    const fallbackImage = getArchetypeFallbackImage(item.archetype);
    const imageSource = resolvedUri ? { uri: resolvedUri } : fallbackImage;

    const locationText = [item.city, item.country].filter(Boolean).join(', ');
    const translatedSubtype = item.subtype ? translateSubtype(item.archetype, item.subtype) : '';

    return (
      <TouchableOpacity
        activeOpacity={0.88}
        onPress={() => router.push({ pathname: '/entry-detail', params: { id: item.id } })}
        style={[styles.card, { backgroundColor: colors.surfaceContainerLow }]}>
        <View style={styles.cardContent}>
          <View style={styles.cardImageContainer}>
            <Image
              source={imageSource}
              style={styles.cardImage}
              contentFit="cover"
              transition={200}
            />
            <View style={[styles.ratingBadge, { backgroundColor: colors.primary }]}>
              <Text style={styles.ratingText}>★ {item.rating}</Text>
            </View>
          </View>

          <View style={styles.cardDetails}>
            <View style={styles.cardHeaderRow}>
              <View style={styles.typeBadge}>
                <Text style={styles.archetypeIcon}>{ARCHETYPE_ICONS[item.archetype] || '✨'}</Text>
                <Text style={[styles.archetypeText, { color: colors.primary }]}>
                  {translateArchetype(item.archetype).toUpperCase()}
                </Text>
              </View>
              <Text style={[styles.dateText, { color: colors.outline }]}>
                {formatDate(item.createdAt)}
              </Text>
            </View>

            <Text style={[styles.drinkName, { color: colors.text }]} numberOfLines={1}>
              {item.name}
            </Text>

            <Text style={[styles.manufacturerText, { color: colors.textSecondary }]} numberOfLines={1}>
              {item.manufacturer}
            </Text>

            {translatedSubtype ? (
              <View style={styles.subtypeRow}>
                <Text style={[styles.subtypeText, { color: colors.textSecondary }]} numberOfLines={1}>
                  {translatedSubtype}
                </Text>
              </View>
            ) : null}

            {locationText ? (
              <View style={styles.locationRow}>
                <Text style={styles.locationIcon}>📍</Text>
                <Text style={[styles.locationText, { color: colors.outline }]} numberOfLines={1}>
                  {locationText}
                </Text>
              </View>
            ) : null}

            {item.sensoryDescriptors && item.sensoryDescriptors.length > 0 ? (
              <View style={styles.tagsContainer}>
                {item.sensoryDescriptors.slice(0, 3).map((tag, idx) => (
                  <View
                    key={tag.id || idx}
                    style={[styles.tagBadge, { backgroundColor: colors.surfaceContainerHighest }]}>
                    <Text style={[styles.tagText, { color: colors.textSecondary }]}>
                      {tag.name}
                    </Text>
                  </View>
                ))}
                {item.sensoryDescriptors.length > 3 && (
                  <Text style={[styles.tagMore, { color: colors.outline }]}>
                    +{item.sensoryDescriptors.length - 3}
                  </Text>
                )}
              </View>
            ) : null}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + Spacing.two,
            backgroundColor: colors.background,
            borderColor: colors.outlineVariant,
          },
        ]}>
        <View style={styles.headerRow}>
          <View>
            <Text style={[styles.journalSub, { color: colors.primary }]}>
              {t('diary.journalSubtitle')}
            </Text>
            <Text style={[styles.journalTitle, { color: colors.text }]}>
              {t('diary.title')}
            </Text>
          </View>
        </View>

        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder={t('diary.searchPlaceholder')}
        />

        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={sortedCategories}
          keyExtractor={(item) => item}
          contentContainerStyle={styles.categoriesList}
          renderItem={({ item }) => {
            const isSelected = selectedCategory === item;
            let icon = '🌟';
            let label = t('common.allDrinks');

            if (item !== 'All') {
              icon = ARCHETYPE_ICONS[item] || '🍷';
              label = `${icon} ${translateArchetype(item as BeverageArchetype)}`;
            }

            const count = item === 'All' ? entries.length : categoryCounts[item] || 0;

            return (
              <CategoryPill
                label={label}
                count={count}
                isSelected={isSelected}
                onPress={() => setSelectedCategory(item)}
              />
            );
          }}
        />
      </View>

      <FlatList
        ref={flatListRef}
        data={filteredEntries}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={[
          styles.listContent,
          {
            paddingBottom: insets.bottom + 100,
          },
        ]}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>{activeIcon}</Text>
            <Text style={[styles.emptyTitle, { color: colors.primary }]}>{t('diary.emptyTitle')}</Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
              {searchQuery || selectedCategory !== 'All'
                ? t('diary.emptyFilterSubtitle')
                : t('diary.emptyInitialSubtitle')}
            </Text>

            <Button
              variant="container"
              size="md"
              fullWidth
              title={
                selectedCategory !== 'All'
                  ? t('diary.emptyButtonCategory', { icon: activeIcon })
                  : t('diary.emptyButton')
              }
              onPress={handleAddNewEntry}
              style={[
                styles.addButton,
                {
                  shadowColor: colors.secondaryFixed,
                },
              ]}
            />
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.two,
    borderBottomWidth: 1,
    gap: Spacing.two,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  addButton: {
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  journalSub: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  journalTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  categoriesList: {
    gap: 8,
    paddingVertical: 4,
  },
  listContent: {
    padding: Spacing.four,
    gap: Spacing.three,
  },
  card: {
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#4d0011',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  cardContent: {
    flexDirection: 'row',
    padding: 12,
    gap: 12,
    alignItems: 'center',
  },
  cardImageContainer: {
    width: 100,
    height: 100,
    borderRadius: 14,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  ratingBadge: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  ratingText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },
  cardDetails: {
    flex: 1,
    gap: 4,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  archetypeIcon: {
    fontSize: 12,
  },
  archetypeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  dateText: {
    fontSize: 11,
    fontWeight: '500',
  },
  drinkName: {
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 20,
  },
  manufacturerText: {
    fontSize: 13,
    fontWeight: '500',
  },
  subtypeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  subtypeText: {
    fontSize: 11,
    fontWeight: '500',
    fontStyle: 'italic',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  locationIcon: {
    fontSize: 10,
  },
  locationText: {
    fontSize: 11,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 2,
    alignItems: 'center',
  },
  tagBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '600',
  },
  tagMore: {
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 2,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.six,
    paddingHorizontal: Spacing.four,
    gap: Spacing.two,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: Spacing.two,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: Spacing.three,
  },
});
