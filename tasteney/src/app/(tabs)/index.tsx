import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  useColorScheme,
  Platform,
  TextInput,
  RefreshControl,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Colors, Spacing } from '@/constants/theme';
import { getDrinkEntries } from '@/services/storage';
import { DrinkEntry } from '@/types/drink';
import {
  translateArchetype,
  translateSubtype,
  formatDate,
} from '@/i18n';

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

const DEFAULT_ENTRY_IMAGE = require('@/assets/images/drinks/wine.jpg');

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

  const renderItem = ({ item }: { item: DrinkEntry }) => {
    const displayImage = item.images && item.images.length > 0 ? item.images[0] : DEFAULT_ENTRY_IMAGE;
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

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push('/new-entry')}
            style={[styles.addDrinkHeaderBtn, { backgroundColor: colors.primaryContainer }]}>
            <Text style={[styles.addDrinkIcon, { color: colors.secondaryFixed }]}>{t('diary.addDrink')}</Text>
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={[styles.searchBar, { backgroundColor: colors.surfaceContainerLow }]}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            placeholder={t('diary.searchPlaceholder')}
            placeholderTextColor="rgba(85, 66, 67, 0.45)"
            value={searchQuery}
            onFocus={() => flatListRef.current?.scrollToOffset({ offset: 0, animated: true })}
            onChangeText={(text) => {
              setSearchQuery(text);
              flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
            }}
            style={[styles.searchInput, { color: colors.text }]}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Text style={{ color: colors.textSecondary, paddingHorizontal: 4 }}>✕</Text>
            </TouchableOpacity>
          ) : null}
        </View>

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
              <TouchableOpacity
                onPress={() => setSelectedCategory(item)}
                style={[
                  styles.categoryPill,
                  isSelected
                    ? [styles.categoryPillSelected, { backgroundColor: colors.primary }]
                    : [styles.categoryPillUnselected, { backgroundColor: colors.surfaceContainerLow }],
                ]}>
                <Text
                  style={[
                    styles.categoryPillText,
                    isSelected ? { color: colors.onPrimary, fontWeight: '700' } : { color: colors.textSecondary },
                  ]}>
                  {item === 'All' ? t('common.allDrinks') : `${ARCHETYPE_ICONS[item] || ''} ${translateArchetype(item)}`}
                </Text>
              </TouchableOpacity>
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
            <Text style={styles.emptyIcon}>🍷</Text>
            <Text style={[styles.emptyTitle, { color: colors.primary }]}>{t('diary.emptyTitle')}</Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
              {searchQuery || selectedCategory !== 'All'
                ? t('diary.emptyFilterSubtitle')
                : t('diary.emptyInitialSubtitle')}
            </Text>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => router.push('/new-entry')}
              style={[styles.emptyButton, { backgroundColor: colors.primaryContainer }]}>
              <Text style={[styles.emptyButtonText, { color: colors.onPrimary }]}>
                {t('diary.emptyButton')}
              </Text>
            </TouchableOpacity>
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
  addDrinkHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    shadowColor: '#6b1724',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  addDrinkIcon: {
    fontSize: 16,
    fontWeight: '800',
  },
  addDrinkText: {
    fontSize: 13,
    fontWeight: '700',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 10 : 6,
    gap: 8,
  },
  searchIcon: {
    fontSize: 14,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
  },
  categoriesList: {
    gap: 8,
    paddingVertical: 4,
  },
  categoryPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  categoryPillUnselected: {},
  categoryPillSelected: {
    shadowColor: '#4d0011',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryPillText: {
    fontSize: 12,
    fontWeight: '600',
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
  emptyButton: {
    marginTop: 12,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 24,
    shadowColor: '#6b1724',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
  },
  emptyButtonText: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
