import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  useColorScheme,
  Platform,
  RefreshControl,
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
import { DrinkEntry } from '@/types/drink';
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

export default function DiaryHomeScreen() {
  const router = useRouter();
  const scheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];

  const [entries, setEntries] = useState<DrinkEntry[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const flatListRef = useRef<FlatList<DrinkEntry>>(null);

  const loadEntries = async () => {
    const data = await getDrinkEntries();
    setEntries(data);
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

  const onRefresh = async () => {
    setRefreshing(true);
    await loadEntries();
    setRefreshing(false);
  };

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

  const categories = ['All', 'Wine', 'Coffee', 'Spirits', 'Beer', 'Tea', 'Cocktail', 'Soda & Tonics', 'Other'];

  const activeIcon = selectedCategory !== 'All' ? ARCHETYPE_ICONS[selectedCategory] || '✨' : '🍷';

  const handleAddNewEntry = () => {
    if (selectedCategory !== 'All') {
      router.push({
        pathname: '/new-entry',
        params: { archetype: selectedCategory },
      });
    } else {
      router.push('/new-entry');
    }
  };

  const renderItem = ({ item }: { item: DrinkEntry }) => {
    const displayImage =
      item.images && item.images.length > 0 ? item.images[0] : getArchetypeFallbackImage(item.archetype);
    const dateFormatted = formatDate(item.createdAt, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    const locationText = [item.city, item.country].filter(Boolean).join(', ');
    const displayArchetype = translateArchetype(item.archetype);
    const displaySubtype = item.subtype ? translateSubtype(item.archetype, item.subtype) : '';

    return (
      <TouchableOpacity
        activeOpacity={0.88}
        onPress={() => router.push({ pathname: '/entry-detail', params: { id: item.id } })}
        style={[styles.card, { backgroundColor: colors.surfaceContainerLow }]}>
        <View style={styles.cardContent}>
          {/* Left Side: First Image with Rating Inside */}
          <View style={styles.cardImageContainer}>
            <Image source={displayImage} style={styles.cardImage} contentFit="cover" />
            <View style={[styles.ratingBadge, { backgroundColor: colors.primaryContainer }]}>
              <Text style={[styles.ratingScore, { color: colors.onPrimary }]}>{item.rating}</Text>
              <Text style={[styles.ratingMax, { color: colors.onPrimary }]}>/10</Text>
            </View>
          </View>

          {/* Right Side: Name, Place, Date, Type, Producer */}
          <View style={styles.cardInfo}>
            <Text style={[styles.cardTitle, { color: colors.primary }]} numberOfLines={1}>
              {item.name}
            </Text>

            {/* Type */}
            <View style={styles.cardMetaRow}>
              <Text style={[styles.cardType, { color: colors.primary }]} numberOfLines={1}>
                {ARCHETYPE_ICONS[item.archetype] || '✨'} {displayArchetype}
                {displaySubtype ? ` • ${displaySubtype}` : ''}
              </Text>
            </View>

            {/* Producer */}
            {item.manufacturer ? (
              <Text style={[styles.cardProducer, { color: colors.secondary }]} numberOfLines={1}>
                🏷️ {item.manufacturer}
              </Text>
            ) : null}

            {/* Place */}
            {locationText ? (
              <Text style={[styles.cardLocation, { color: colors.secondary }]} numberOfLines={1}>
                📍 {locationText}
              </Text>
            ) : null}

            {/* Date */}
            <Text style={[styles.cardDate, { color: colors.textSecondary }]} numberOfLines={1}>
              🗓️ {dateFormatted}
            </Text>
          </View>

          {/* Navigation Chevron Indicator */}
          <View style={styles.cardChevronContainer}>
            <Text style={[styles.cardChevron, { color: colors.outline }]}>›</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      {/* Top Header */}
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + (Platform.OS === 'web' ? 20 : 10),
            backgroundColor: colors.background,
            borderBottomColor: colors.surfaceContainerHigh,
          },
        ]}>
        <View style={styles.headerRow}>
          <View>
            <Text style={[styles.journalSub, { color: colors.secondary }]}>{t('diary.journalSubtitle')}</Text>
            <Text style={[styles.journalTitle, { color: colors.primary }]}>{t('diary.title')}</Text>
          </View>

          <Button
            variant="container"
            size="sm"
            title={t('diary.addDrink')}
            onPress={handleAddNewEntry}
          />
        </View>

        {/* Search Bar */}
        <SearchBar
          value={searchQuery}
          onChangeText={(text) => {
            setSearchQuery(text);
            flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
          }}
          onFocus={() => flatListRef.current?.scrollToOffset({ offset: 0, animated: true })}
          placeholder={t('diary.searchPlaceholder')}
        />

        {/* Categories Bar */}
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={categories}
          keyExtractor={(item) => item}
          contentContainerStyle={styles.categoriesList}
          renderItem={({ item }) => {
            const isSelected = selectedCategory === item;
            return (
              <CategoryPill
                label={item === 'All' ? t('common.allDrinks') : translateArchetype(item)}
                icon={item !== 'All' ? ARCHETYPE_ICONS[item] : undefined}
                isSelected={isSelected}
                onPress={() => setSelectedCategory(item)}
              />
            );
          }}
        />
      </View>

      {/* Main List */}
      <FlatList
        ref={flatListRef}
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets={true}
        keyboardDismissMode="on-drag"
        data={filteredEntries}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={[
          styles.listContent,
          {
            paddingBottom: insets.bottom + 90,
          },
        ]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
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
              title={
                selectedCategory !== 'All'
                  ? t('diary.emptyButtonCategory', { icon: activeIcon })
                  : t('diary.emptyButton')
              }
              onPress={handleAddNewEntry}
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
    left: 6,
    flexDirection: 'row',
    alignItems: 'baseline',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 10,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 3,
  },
  ratingScore: {
    fontSize: 13,
    fontWeight: '800',
  },
  ratingMax: {
    fontSize: 9,
    fontWeight: '600',
    opacity: 0.85,
  },
  cardInfo: {
    flex: 1,
    justifyContent: 'center',
    gap: 3,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 20,
  },
  cardMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardType: {
    fontSize: 12,
    fontWeight: '600',
  },
  cardProducer: {
    fontSize: 12,
    fontWeight: '500',
  },
  cardLocation: {
    fontSize: 12,
    fontWeight: '500',
  },
  cardDate: {
    fontSize: 11,
    fontWeight: '400',
    marginTop: 1,
  },
  cardChevronContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 4,
    paddingRight: 6,
  },
  cardChevron: {
    fontSize: 22,
    fontWeight: '600',
    lineHeight: 24,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
    gap: 12,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 280,
  },
});
