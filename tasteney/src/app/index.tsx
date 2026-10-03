import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  useColorScheme,
  Platform,
  Alert,
  TextInput,
  RefreshControl,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing } from '@/constants/theme';
import { getDrinkEntries, deleteDrinkEntry } from '@/services/storage';
import { DrinkEntry } from '@/types/drink';
import { SCORE_DESCRIPTIONS } from '@/components/rating-selector';

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

const DEFAULT_ENTRY_IMAGE =
  'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=800&q=80';

export default function DiaryHomeScreen() {
  const router = useRouter();
  const scheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];

  const [entries, setEntries] = useState<DrinkEntry[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const loadEntries = async () => {
    const data = await getDrinkEntries();
    setEntries(data);
  };

  useFocusEffect(
    useCallback(() => {
      loadEntries();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadEntries();
    setRefreshing(false);
  };

  const handleDelete = (id: string, name: string) => {
    Alert.alert(
      'Delete Entry',
      `Are you sure you want to remove "${name}" from your diary?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteDrinkEntry(id);
            await loadEntries();
          },
        },
      ]
    );
  };

  const filteredEntries = entries.filter((item) => {
    const matchesCategory = selectedCategory === 'All' || item.archetype === selectedCategory;
    const matchesQuery =
      searchQuery.trim() === '' ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.manufacturer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.notes.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  const categories = ['All', 'Wine', 'Coffee', 'Spirits', 'Beer', 'Tea', 'Cocktail', 'Soda & Tonics', 'Other'];

  const renderItem = ({ item }: { item: DrinkEntry }) => {
    const displayImage = item.images && item.images.length > 0 ? item.images[0] : DEFAULT_ENTRY_IMAGE;
    const dateFormatted = new Date(item.createdAt).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    const descriptor = SCORE_DESCRIPTIONS[item.rating] || `${item.rating}.0`;

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => router.push({ pathname: '/new-entry', params: { id: item.id } })}
        style={[styles.card, { backgroundColor: colors.surfaceContainerLow }]}>
        {/* Card Image Banner */}
        <View style={styles.cardImageContainer}>
          <Image source={{ uri: displayImage }} style={styles.cardImage} contentFit="cover" />
          <View style={styles.imageOverlay} />

          {/* Archetype & Image count badge */}
          <View style={styles.cardHeaderBadges}>
            <View style={styles.archetypeBadge}>
              <Text style={styles.archetypeBadgeText}>
                {ARCHETYPE_ICONS[item.archetype] || '✨'} {item.archetype}
              </Text>
            </View>

            {item.images && item.images.length > 1 && (
              <View style={styles.photoCountBadge}>
                <Text style={styles.photoCountText}>📷 {item.images.length}</Text>
              </View>
            )}
          </View>

          {/* Rating Badge */}
          <View style={[styles.ratingBadge, { backgroundColor: colors.primaryContainer }]}>
            <Text style={[styles.ratingScore, { color: colors.onPrimary }]}>{item.rating}</Text>
            <Text style={[styles.ratingMax, { color: colors.onPrimary }]}>/10</Text>
          </View>
        </View>

        {/* Card Body */}
        <View style={styles.cardBody}>
          <View style={styles.cardTitleRow}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={[styles.cardTitle, { color: colors.primary }]}>{item.name}</Text>
              {item.manufacturer ? (
                <Text style={[styles.cardManufacturer, { color: colors.secondary }]}>
                  📍 {item.manufacturer}
                </Text>
              ) : null}
            </View>

            <View style={styles.cardActions}>
              <TouchableOpacity
                onPress={() => router.push({ pathname: '/new-entry', params: { id: item.id } })}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                style={[styles.cardActionButton, { backgroundColor: colors.surfaceContainerHighest }]}>
                <Text style={[styles.editButtonText, { color: colors.primary }]}>✎</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleDelete(item.id, item.name)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                style={[styles.cardActionButton, { backgroundColor: colors.surfaceContainerHighest }]}>
                <Text style={[styles.deleteButtonText, { color: colors.outline }]}>✕</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Score Descriptor */}
          <View style={styles.descriptorRow}>
            <Text style={[styles.descriptorText, { color: colors.textSecondary }]}>
              {descriptor}
            </Text>
            <Text style={[styles.cardDate, { color: colors.textSecondary }]}>{dateFormatted}</Text>
          </View>

          {/* Sensory Descriptors */}
          {item.sensoryDescriptors && item.sensoryDescriptors.length > 0 && (
            <View style={styles.descriptorsWrapper}>
              {item.sensoryDescriptors.map((desc) => {
                const categoryIcon =
                  desc.category === 'Smell'
                    ? '👃'
                    : desc.category === 'Taste'
                    ? '👅'
                    : '✨';
                return (
                  <View
                    key={desc.id}
                    style={[styles.descriptorChip, { backgroundColor: colors.surfaceContainerHighest }]}>
                    <Text style={[styles.descriptorChipText, { color: colors.primary }]}>
                      {categoryIcon} {desc.name}
                      {desc.intensity ? ` • ${desc.intensity}/5` : ''}
                    </Text>
                  </View>
                );
              })}
            </View>
          )}

          {/* Personal Memo */}
          {item.notes ? (
            <View style={[styles.notesContainer, { backgroundColor: colors.surfaceContainerLowest }]}>
              <Text style={[styles.notesText, { color: colors.text }]} numberOfLines={3}>
                &ldquo;{item.notes}&rdquo;
              </Text>
            </View>
          ) : null}
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
            <Text style={[styles.journalSub, { color: colors.secondary }]}>EPICUREAN DIARY</Text>
            <Text style={[styles.journalTitle, { color: colors.primary }]}>Tasteney Journal</Text>
          </View>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push('/new-entry')}
            style={[styles.addDrinkHeaderBtn, { backgroundColor: colors.primaryContainer }]}>
            <Text style={[styles.addDrinkIcon, { color: colors.secondaryFixed }]}>+</Text>
            <Text style={[styles.addDrinkText, { color: colors.onPrimary }]}>Add Drink</Text>
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={[styles.searchBar, { backgroundColor: colors.surfaceContainerLow }]}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            placeholder="Search drinks, producers, tasting notes..."
            placeholderTextColor="rgba(85, 66, 67, 0.45)"
            value={searchQuery}
            onChangeText={setSearchQuery}
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
                  {item === 'All' ? '🌟 All Drinks' : `${ARCHETYPE_ICONS[item] || ''} ${item}`}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* Main List */}
      <FlatList
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
            <Text style={[styles.emptyTitle, { color: colors.primary }]}>No Tasting Entries Yet</Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
              {searchQuery || selectedCategory !== 'All'
                ? 'No drink matches your filter criteria.'
                : 'Start logging your beverage experiences, ratings, images, and tasting impressions.'}
            </Text>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => router.push('/new-entry')}
              style={[styles.emptyButton, { backgroundColor: colors.primaryContainer }]}>
              <Text style={[styles.emptyButtonText, { color: colors.onPrimary }]}>
                + Log Your First Drink
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
    gap: Spacing.four,
  },
  card: {
    borderRadius: 22,
    overflow: 'hidden',
    shadowColor: '#4d0011',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 3,
  },
  cardImageContainer: {
    height: 180,
    width: '100%',
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(77, 0, 17, 0.2)',
  },
  cardHeaderBadges: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    gap: 6,
  },
  archetypeBadge: {
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  archetypeBadgeText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },
  photoCountBadge: {
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 12,
  },
  photoCountText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },
  ratingBadge: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'baseline',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
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
  cardBody: {
    padding: Spacing.four,
    gap: Spacing.two,
  },
  cardTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardTitle: {
    fontSize: 19,
    fontWeight: '700',
    lineHeight: 24,
  },
  cardManufacturer: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
  },
  deleteButton: {
    padding: 6,
    borderRadius: 12,
  },
  deleteButtonText: {
    fontSize: 14,
    fontWeight: '700',
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardActionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editButtonText: {
    fontSize: 15,
    fontWeight: '700',
  },
  descriptorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  descriptorText: {
    fontSize: 13,
    fontStyle: 'italic',
    fontWeight: '500',
  },
  cardDate: {
    fontSize: 12,
    opacity: 0.7,
  },
  descriptorsWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 2,
  },
  descriptorChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  descriptorChipText: {
    fontSize: 11,
    fontWeight: '600',
  },
  notesContainer: {
    padding: 12,
    borderRadius: 14,
    marginTop: 4,
  },
  notesText: {
    fontSize: 13,
    lineHeight: 19,
    fontStyle: 'italic',
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
