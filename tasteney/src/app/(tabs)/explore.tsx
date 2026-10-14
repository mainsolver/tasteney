import React, { useState, useMemo, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  Platform,
  Linking,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SymbolView } from 'expo-symbols';
import { useTranslation } from 'react-i18next';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/button';
import { SearchBar } from '@/components/search-bar';
import { CategoryPill } from '@/components/category-pill';
import { Badge } from '@/components/badge';
import { LinkedArticleContent } from '@/components/linked-article-content';
import { BottomTabInset, Colors, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import {
  getCategories,
  getArticles,
  getArticleById,
  getRelatedArticles,
} from '@/data/drink-knowledge-service';
import { DrinkArticle, ArticleType } from '@/types/drink-knowledge';
import { isGerman, translateArchetype } from '@/i18n';
import { BeverageArchetype } from '@/types/drink';

const TYPE_CONFIG: Record<
  ArticleType,
  { icon: string; labelKey: string; badgeVariant: 'primary' | 'secondary' | 'outline' | 'surface' }
> = {
  general: { icon: '📖', labelKey: 'explore.types.general', badgeVariant: 'primary' },
  ingredient: { icon: '🌾', labelKey: 'explore.types.ingredient', badgeVariant: 'secondary' },
  location: { icon: '📍', labelKey: 'explore.types.location', badgeVariant: 'outline' },
};

export default function ExploreKnowledgeScreen() {
  const router = useRouter();
  const scheme = useColorScheme();
  const theme = useTheme();
  const { t } = useTranslation();
  const german = isGerman();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const safeAreaInsets = useSafeAreaInsets();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedArticleType, setSelectedArticleType] = useState<ArticleType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedArticleId, setExpandedArticleId] = useState<string | null>(null);

  const scrollViewRef = useRef<ScrollView>(null);

  useFocusEffect(
    useCallback(() => {
      scrollViewRef.current?.scrollTo({ y: 0, animated: false });
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        window.scrollTo(0, 0);
        document.documentElement?.scrollTo?.(0, 0);
        document.body?.scrollTo?.(0, 0);
      }
    }, [])
  );

  const insets = {
    ...safeAreaInsets,
    bottom: safeAreaInsets.bottom + BottomTabInset + Spacing.three,
  };

  const currentLanguage = german ? 'de' : 'en';

  const categories = useMemo(() => {
    return [
      { id: 'all', name: t('common.allShort'), icon: '🌟', archetype: undefined },
      ...getCategories().map((c) => ({
        id: c.id,
        name: german && c.archetype ? translateArchetype(c.archetype as BeverageArchetype) : c.name,
        icon: c.icon || '🍹',
        archetype: c.archetype,
      })),
    ];
  }, [t, german]);

  const articleTypesList = useMemo(() => {
    return [
      { id: 'all' as const, label: t('explore.types.all'), icon: '✨' },
      { id: 'general' as const, label: t('explore.types.general'), icon: '📖' },
      { id: 'ingredient' as const, label: t('explore.types.ingredient'), icon: '🌾' },
      { id: 'location' as const, label: t('explore.types.location'), icon: '📍' },
    ];
  }, [t]);

  const filteredArticles = useMemo(() => {
    return getArticles({
      category: selectedCategory === 'all' ? undefined : selectedCategory,
      type: selectedArticleType === 'all' ? undefined : selectedArticleType,
      searchQuery: searchQuery,
      language: currentLanguage,
    });
  }, [selectedCategory, selectedArticleType, searchQuery, currentLanguage]);

  const handleArticlePress = useCallback(
    (targetId: string) => {
      const targetArticle = getArticleById(targetId, currentLanguage);
      if (!targetArticle) return;

      // Adjust filter if target article is hidden by current category/type filters
      if (selectedCategory !== 'all' && selectedCategory !== targetArticle.category) {
        setSelectedCategory('all');
      }
      if (selectedArticleType !== 'all' && selectedArticleType !== targetArticle.type) {
        setSelectedArticleType('all');
      }

      setExpandedArticleId(targetArticle.id);
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    },
    [selectedCategory, selectedArticleType, currentLanguage]
  );

  const toggleExpand = (articleId: string) => {
    setExpandedArticleId((prev) => (prev === articleId ? null : articleId));
  };

  const getCategoryDetails = (catId: string) => {
    const found = categories.find((c) => c.id === catId);
    return {
      name: found ? found.name : catId,
      icon: found ? found.icon : '🍹',
      archetype: found?.archetype as BeverageArchetype | undefined,
    };
  };

  const renderArticleCard = (article: DrinkArticle) => {
    const isExpanded = expandedArticleId === article.id;
    const catDetails = getCategoryDetails(article.category);
    const typeInfo = TYPE_CONFIG[article.type] || TYPE_CONFIG.general;
    const typeLabel = t(typeInfo.labelKey);
    const relatedArticles = getRelatedArticles(article.id, currentLanguage);

    return (
      <View
        key={article.id}
        style={[
          styles.articleCard,
          {
            backgroundColor: colors.surfaceContainerLow,
            borderColor: isExpanded ? colors.primaryContainer : colors.outlineVariant,
          },
        ]}>
        {/* Header Touchable */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => toggleExpand(article.id)}
          style={styles.cardHeaderTouchable}>
          <View style={styles.cardTopRow}>
            <View style={styles.badgeCluster}>
              <Badge
                variant="secondary"
                icon={catDetails.icon}
                label={catDetails.name}
                style={styles.categoryBadge}
              />
              <Badge
                variant={typeInfo.badgeVariant}
                icon={typeInfo.icon}
                label={typeLabel}
                style={styles.typeBadge}
              />
            </View>

            <View
              style={[
                styles.expandIndicator,
                {
                  backgroundColor: isExpanded
                    ? colors.primary
                    : colors.surfaceContainerHighest,
                },
              ]}>
              <SymbolView
                name={{
                  ios: isExpanded ? 'chevron.up' : 'chevron.down',
                  android: isExpanded ? 'expand_less' : 'expand_more',
                  web: isExpanded ? 'expand_less' : 'expand_more',
                }}
                size={14}
                weight="bold"
                tintColor={isExpanded ? '#ffffff' : colors.textSecondary}
              />
            </View>
          </View>

          <Text style={[styles.articleTitle, { color: colors.text }]}>
            {article.title}
          </Text>

          <Text
            style={[styles.articleSummary, { color: colors.textSecondary }]}
            numberOfLines={isExpanded ? undefined : 3}>
            {article.summary}
          </Text>
        </TouchableOpacity>

        {/* Specialized Metadata Chips */}
        {(article.location || article.ingredient) && (
          <View
            style={[
              styles.metadataSection,
              {
                backgroundColor: colors.surfaceContainer,
                borderTopColor: colors.outlineVariant,
              },
            ]}>
            {article.location && (
              <View style={styles.metadataRow}>
                <Text style={styles.metaIcon}>📍</Text>
                <View style={styles.metaContent}>
                  <Text style={[styles.metaLabel, { color: colors.textSecondary }]}>
                    {t('explore.articleCard.location')}:
                  </Text>
                  <Text style={[styles.metaValue, { color: colors.text }]}>
                    {article.location.region}, {article.location.country}
                  </Text>
                  {article.location.coordinates && (
                    <Text style={[styles.metaCoords, { color: colors.textSecondary }]}>
                      {article.location.coordinates.lat}° N, {article.location.coordinates.lon}° E
                    </Text>
                  )}
                </View>
              </View>
            )}

            {article.ingredient && (
              <View style={styles.metadataRow}>
                <Text style={styles.metaIcon}>🌾</Text>
                <View style={styles.metaContent}>
                  <Text style={[styles.metaLabel, { color: colors.textSecondary }]}>
                    {t('explore.articleCard.ingredient')}:
                  </Text>
                  <Text style={[styles.metaValue, { color: colors.text }]}>
                    {article.ingredient.kind}
                  </Text>
                  {article.ingredient.alsoKnownAs &&
                    article.ingredient.alsoKnownAs.length > 0 && (
                      <View style={styles.synonymsList}>
                        <Text style={[styles.synonymsLabel, { color: colors.textSecondary }]}>
                          {t('explore.articleCard.alsoKnownAs')}
                        </Text>
                        <Text style={[styles.synonymsText, { color: colors.secondary }]}>
                          {article.ingredient.alsoKnownAs.join(' · ')}
                        </Text>
                      </View>
                    )}
                </View>
              </View>
            )}
          </View>
        )}

        {/* Collapsible Expanded Article Body */}
        {isExpanded && (
          <View
            style={[
              styles.expandedBody,
              {
                borderTopColor: colors.outlineVariant,
                backgroundColor: colors.surfaceContainerLowest,
              },
            ]}>
            <View style={styles.contentParagraph}>
              <LinkedArticleContent
                content={article.content}
                onArticlePress={handleArticlePress}
                style={[styles.bodyText, { color: colors.text }]}
              />
            </View>

            {/* Tags */}
            {article.tags && article.tags.length > 0 && (
              <View style={styles.tagsContainer}>
                {article.tags.map((tag) => (
                  <View
                    key={tag}
                    style={[
                      styles.tagChip,
                      {
                        backgroundColor: colors.surfaceContainer,
                        borderColor: colors.outlineVariant,
                      },
                    ]}>
                    <Text style={[styles.tagText, { color: colors.textSecondary }]}>
                      #{tag}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {/* Related Articles Cross-Reference */}
            {relatedArticles.length > 0 && (
              <View
                style={[
                  styles.relatedArticlesBox,
                  {
                    backgroundColor: colors.surfaceContainer,
                    borderColor: colors.outlineVariant,
                  },
                ]}>
                <Text style={[styles.relatedSectionTitle, { color: colors.primary }]}>
                  🔗 {t('explore.articleCard.relatedArticles')}
                </Text>
                <View style={styles.relatedChipsWrap}>
                  {relatedArticles.map((rel) => {
                    const relTypeInfo = TYPE_CONFIG[rel.type] || TYPE_CONFIG.general;
                    return (
                      <TouchableOpacity
                        key={rel.id}
                        activeOpacity={0.7}
                        onPress={() => handleArticlePress(rel.id)}
                        style={[
                          styles.relatedChipButton,
                          {
                            backgroundColor: colors.surfaceContainerHigh,
                            borderColor: colors.outlineVariant,
                          },
                        ]}>
                        <Text style={styles.relatedChipIcon}>{relTypeInfo.icon}</Text>
                        <Text style={[styles.relatedChipText, { color: colors.primary }]}>
                          {rel.title}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}

            {/* Wikipedia Reference Link */}
            {article.wikipediaUrl && (
              <TouchableOpacity
                activeOpacity={0.7}
                accessibilityRole="link"
                accessibilityHint="Opens Wikipedia article in web browser"
                onPress={() => Linking.openURL(article.wikipediaUrl!)}
                style={[
                  styles.wikipediaLinkButton,
                  {
                    backgroundColor: colors.surfaceContainer,
                    borderColor: colors.outlineVariant,
                  },
                ]}>
                <Text style={styles.wikipediaIcon}>🌐</Text>
                <View style={styles.wikipediaTextWrap}>
                  <Text style={[styles.wikipediaLabel, { color: colors.textSecondary }]}>
                    {t('explore.articleCard.wikipedia')}
                  </Text>
                  <Text style={[styles.wikipediaActionText, { color: colors.primary }]}>
                    {t('explore.articleCard.readOnWikipedia')} ↗
                  </Text>
                </View>
              </TouchableOpacity>
            )}

            {/* Log Drink CTA */}
            {catDetails.archetype && (
              <View style={styles.cardActionRow}>
                <Button
                  variant="primary"
                  size="sm"
                  title={
                    german
                      ? `+ ${catDetails.name} ins Tagebuch eintragen`
                      : `+ Log a ${catDetails.name} to Diary`
                  }
                  onPress={() =>
                    router.push({
                      pathname: '/new-entry',
                      params: { archetype: catDetails.archetype },
                    })
                  }
                  fullWidth
                />
              </View>
            )}
          </View>
        )}
      </View>
    );
  };

  return (
    <View
      style={[
        styles.screen,
        { backgroundColor: colors.background, paddingTop: safeAreaInsets.top },
      ]}>
      <ScrollView
        ref={scrollViewRef}
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets={true}
        keyboardDismissMode="on-drag"
        style={[styles.scrollView, { backgroundColor: theme.background }]}
        contentContainerStyle={[
          styles.contentContainer,
          {
            paddingBottom: insets.bottom,
            paddingLeft: safeAreaInsets.left,
            paddingRight: safeAreaInsets.right,
          },
        ]}
        showsVerticalScrollIndicator={false}>
        <ThemedView style={styles.container}>
          {/* Header Title Section */}
          <ThemedView style={styles.header}>
            <View style={styles.headerTitleRow}>
              <View style={[styles.titleIconBadge, { backgroundColor: colors.secondaryFixed }]}>
                <Text style={styles.titleIconText}>📖</Text>
              </View>
              <View style={styles.titleTextCol}>
                <ThemedText type="subtitle" style={styles.screenMainTitle}>
                  {german ? 'Getränke-Enzyklopädie' : 'Drink Encyclopedia'}
                </ThemedText>
                <ThemedText style={styles.screenSubtitle} themeColor="textSecondary">
                  {german
                    ? 'Wissen, Terroirs, Zutaten & vernetzte Verkostungs-Guides'
                    : 'History, origins, ingredients & connected tasting guides'}
                </ThemedText>
              </View>
            </View>

            {/* Search Bar */}
            <SearchBar
              value={searchQuery}
              onChangeText={(text) => {
                setSearchQuery(text);
                scrollViewRef.current?.scrollTo({ y: 0, animated: true });
              }}
              onFocus={() => scrollViewRef.current?.scrollTo({ y: 0, animated: true })}
              placeholder={t('explore.searchPlaceholder')}
            />

            {/* Drink Category Filter Pills (Tier 1) */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterPillsScroll}>
              {categories.map((cat) => {
                const isSelected = selectedCategory === cat.id;
                return (
                  <CategoryPill
                    key={cat.id}
                    icon={cat.icon}
                    label={cat.name}
                    isSelected={isSelected}
                    onPress={() => setSelectedCategory(cat.id)}
                  />
                );
              })}
            </ScrollView>

            {/* Article Type Filter Pills (Tier 2) */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.typeFilterPillsScroll}>
              {articleTypesList.map((typeItem) => {
                const isSelected = selectedArticleType === typeItem.id;
                return (
                  <CategoryPill
                    key={typeItem.id}
                    icon={typeItem.icon}
                    label={typeItem.label}
                    isSelected={isSelected}
                    onPress={() => setSelectedArticleType(typeItem.id)}
                  />
                );
              })}
            </ScrollView>
          </ThemedView>

          {/* Knowledge Articles List */}
          <ThemedView style={styles.articlesList}>
            {filteredArticles.length === 0 ? (
              <View
                style={[
                  styles.emptyStateCard,
                  {
                    backgroundColor: colors.surfaceContainerLow,
                    borderColor: colors.outlineVariant,
                  },
                ]}>
                <Text style={styles.emptyStateEmoji}>🔍</Text>
                <Text style={[styles.emptyStateTitle, { color: colors.text }]}>
                  {german ? 'Keine passenden Artikel gefunden' : 'No knowledge articles match'}
                </Text>
                <Text style={[styles.emptyStateSubtitle, { color: colors.textSecondary }]}>
                  {german
                    ? `Passe deine Suchanfrage an oder setze die Filter zurück.`
                    : `Try adjusting your search query or resetting category and type filters.`}
                </Text>
                <Button
                  variant="secondary"
                  size="sm"
                  title={german ? 'Alle Filter zurücksetzen' : 'Reset All Filters'}
                  onPress={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                    setSelectedArticleType('all');
                  }}
                  style={{ marginTop: Spacing.two }}
                />
              </View>
            ) : (
              filteredArticles.map(renderArticleCard)
            )}
          </ThemedView>
        </ThemedView>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    paddingTop: Spacing.two,
  },
  container: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    gap: Spacing.four,
    maxWidth: 800,
    width: '100%',
    alignSelf: 'center',
  },
  header: {
    gap: Spacing.three,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    marginBottom: Spacing.one,
  },
  titleIconBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4d0011',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  titleIconText: {
    fontSize: 24,
  },
  titleTextCol: {
    flex: 1,
    gap: 2,
  },
  screenMainTitle: {
    fontSize: 26,
    fontWeight: '800',
    lineHeight: 32,
  },
  screenSubtitle: {
    fontSize: 13,
    lineHeight: 18,
  },
  filterPillsScroll: {
    gap: Spacing.two,
    paddingVertical: Spacing.half,
  },
  typeFilterPillsScroll: {
    gap: Spacing.two,
    paddingVertical: Spacing.half,
  },
  articlesList: {
    gap: Spacing.four,
    paddingBottom: Spacing.six,
  },
  articleCard: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1.5,
    shadowColor: '#4d0011',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  cardHeaderTouchable: {
    padding: Spacing.four,
    gap: Spacing.two,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badgeCluster: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    flexWrap: 'wrap',
  },
  categoryBadge: {
    paddingHorizontal: Spacing.two + 2,
    paddingVertical: 4,
    borderRadius: 12,
  },
  typeBadge: {
    paddingHorizontal: Spacing.two + 2,
    paddingVertical: 4,
    borderRadius: 12,
  },
  expandIndicator: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  articleTitle: {
    fontSize: 20,
    fontWeight: '800',
    lineHeight: 26,
  },
  articleSummary: {
    fontSize: 14,
    lineHeight: 20,
  },
  metadataSection: {
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two + 2,
    borderTopWidth: 1,
    gap: Spacing.two,
  },
  metadataRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.two,
  },
  metaIcon: {
    fontSize: 16,
    marginTop: 2,
  },
  metaContent: {
    flex: 1,
    gap: 2,
  },
  metaLabel: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  metaValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  metaCoords: {
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  synonymsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  synonymsLabel: {
    fontSize: 12,
  },
  synonymsText: {
    fontSize: 12,
    fontWeight: '600',
  },
  expandedBody: {
    padding: Spacing.four,
    borderTopWidth: 1,
    gap: Spacing.four,
  },
  contentParagraph: {
    paddingVertical: Spacing.one,
  },
  bodyText: {
    fontSize: 15,
    lineHeight: 24,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.one + 2,
  },
  tagChip: {
    paddingHorizontal: Spacing.two + 2,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
  },
  relatedArticlesBox: {
    padding: Spacing.three,
    borderRadius: 14,
    borderWidth: 1,
    gap: Spacing.two,
  },
  relatedSectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  relatedChipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  relatedChipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.two + 4,
    paddingVertical: Spacing.one + 2,
    borderRadius: 12,
    borderWidth: 1,
    gap: 6,
  },
  relatedChipIcon: {
    fontSize: 13,
  },
  relatedChipText: {
    fontSize: 13,
    fontWeight: '700',
  },
  wikipediaLinkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.three,
    borderRadius: 14,
    borderWidth: 1,
    gap: Spacing.two + 2,
  },
  wikipediaIcon: {
    fontSize: 20,
  },
  wikipediaTextWrap: {
    flex: 1,
    gap: 2,
  },
  wikipediaLabel: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  wikipediaActionText: {
    fontSize: 13,
    fontWeight: '700',
  },
  cardActionRow: {
    paddingTop: Spacing.one,
  },
  emptyStateCard: {
    padding: Spacing.six,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    gap: Spacing.two,
    marginTop: Spacing.four,
  },
  emptyStateEmoji: {
    fontSize: 40,
    marginBottom: Spacing.one,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});
