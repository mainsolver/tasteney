import React, { useState, useMemo, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  Platform,
} from 'react-native';
import { Image } from 'expo-image';
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
import { BottomTabInset, Colors, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { getDrinkKnowledgeBase, DrinkCategoryKnowledge } from '@/data/drink-knowledge';
import { isGerman, translateArchetype } from '@/i18n';

type ActiveSectionTab = 'origin' | 'production' | 'styles' | 'sensory' | 'serving' | 'facts';

export default function ExploreKnowledgeScreen() {
  const router = useRouter();
  const scheme = useColorScheme();
  const theme = useTheme();
  const { t } = useTranslation();
  const german = isGerman();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const safeAreaInsets = useSafeAreaInsets();

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const scrollViewRef = useRef<ScrollView>(null);
  const [expandedCategoryId, setExpandedCategoryId] = useState<string>('beer');
  const [activeSubTabs, setActiveSubTabs] = useState<Record<string, ActiveSectionTab>>({
    beer: 'origin',
    wine: 'origin',
    coffee: 'origin',
    spirits: 'origin',
    tea: 'origin',
    cocktail: 'origin',
    'soda-tonics': 'origin',
    other: 'origin',
  });

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

  const knowledgeBase = useMemo(() => {
    return getDrinkKnowledgeBase(german);
  }, [german]);

  const insets = {
    ...safeAreaInsets,
    bottom: safeAreaInsets.bottom + BottomTabInset + Spacing.three,
  };

  const categories = useMemo(() => {
    return ['All', ...knowledgeBase.map((item) => item.archetype)];
  }, [knowledgeBase]);

  const filteredKnowledge = useMemo(() => {
    return knowledgeBase.filter((item) => {
      const matchesCategory =
        selectedCategory === 'All' || item.archetype === selectedCategory;

      const q = searchQuery.toLowerCase().trim();
      if (!q) return matchesCategory;

      const translatedArchetype = translateArchetype(item.archetype).toLowerCase();
      const matchesQuery =
        item.title.toLowerCase().includes(q) ||
        item.archetype.toLowerCase().includes(q) ||
        translatedArchetype.includes(q) ||
        item.tagline.toLowerCase().includes(q) ||
        item.origin.history.toLowerCase().includes(q) ||
        item.origin.region.toLowerCase().includes(q) ||
        item.styles.some(
          (s) =>
            s.name.toLowerCase().includes(q) ||
            s.description.toLowerCase().includes(q) ||
            s.flavorNotes?.some((n) => n.toLowerCase().includes(q))
        ) ||
        item.production.ingredients.some((ing) => ing.toLowerCase().includes(q)) ||
        item.sensoryProfile.keyAromas.some((aroma) => aroma.toLowerCase().includes(q));

      return matchesCategory && matchesQuery;
    });
  }, [selectedCategory, searchQuery, knowledgeBase]);

  const toggleExpand = (id: string) => {
    setExpandedCategoryId((prev) => (prev === id ? '' : id));
  };

  const handleSubTabChange = (categoryId: string, tab: ActiveSectionTab) => {
    setActiveSubTabs((prev) => ({
      ...prev,
      [categoryId]: tab,
    }));
  };

  const renderSectionTabButton = (
    categoryId: string,
    tab: ActiveSectionTab,
    label: string,
    icon: string
  ) => {
    const isActive = (activeSubTabs[categoryId] || 'origin') === tab;
    return (
      <TouchableOpacity
        key={tab}
        activeOpacity={0.7}
        onPress={() => handleSubTabChange(categoryId, tab)}
        style={[
          styles.subTabButton,
          {
            backgroundColor: isActive
              ? colors.primaryContainer
              : colors.surfaceContainer,
          },
        ]}>
        <Text
          style={[
            styles.subTabButtonText,
            { color: isActive ? colors.onPrimary : colors.textSecondary },
          ]}>
          {icon} {label}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderCategoryCard = (item: DrinkCategoryKnowledge) => {
    const isExpanded = expandedCategoryId === item.id;
    const currentTab = activeSubTabs[item.id] || 'origin';
    const displayArchetype = translateArchetype(item.archetype);

    return (
      <View
        key={item.id}
        style={[
          styles.card,
          {
            backgroundColor: colors.surfaceContainerLow,
            borderColor: isExpanded ? colors.primaryContainer : colors.outlineVariant,
          },
        ]}>
        {/* Banner with Image */}
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => toggleExpand(item.id)}
          style={styles.bannerTouchable}>
          <View style={styles.imageContainer}>
            <Image
              source={item.bannerImage}
              style={styles.bannerImage}
              contentFit="cover"
              transition={200}
            />
            <View
              style={[
                styles.imageGradientOverlay,
                {
                  backgroundColor:
                    scheme === 'dark' ? 'rgba(28, 28, 25, 0.75)' : 'rgba(28, 28, 25, 0.6)',
                },
              ]}
            />
            <View style={styles.bannerHeaderContent}>
              <View style={styles.badgeRow}>
                <Badge
                  variant="secondary"
                  icon={item.icon}
                  label={displayArchetype}
                  style={styles.archetypeBadge}
                />
                <View
                  style={[
                    styles.toggleIndicator,
                    {
                      backgroundColor: isExpanded
                        ? colors.primary
                        : 'rgba(255, 255, 255, 0.25)',
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
                    tintColor="#ffffff"
                  />
                </View>
              </View>

              <Text style={styles.bannerTitle}>{item.title}</Text>
              <Text style={styles.bannerTagline} numberOfLines={2}>
                {item.tagline}
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Quick Highlights Summary Bar */}
        <View
          style={[
            styles.quickInfoBar,
            {
              backgroundColor: colors.surfaceContainer,
              borderBottomColor: colors.outlineVariant,
            },
          ]}>
          <View style={styles.quickInfoItem}>
            <Text style={[styles.quickInfoLabel, { color: colors.textSecondary }]}>
              {german ? 'HERKUNFT' : 'ORIGIN'}
            </Text>
            <Text style={[styles.quickInfoValue, { color: colors.text }]} numberOfLines={1}>
              {item.origin.era.split('(')[0].trim()}
            </Text>
          </View>
          <View style={[styles.quickInfoDivider, { backgroundColor: colors.outlineVariant }]} />
          <View style={styles.quickInfoItem}>
            <Text style={[styles.quickInfoLabel, { color: colors.textSecondary }]}>
              {german ? 'REGION' : 'REGION'}
            </Text>
            <Text style={[styles.quickInfoValue, { color: colors.text }]} numberOfLines={1}>
              {item.origin.region.split('&')[0].split('(')[0].trim()}
            </Text>
          </View>
          <View style={[styles.quickInfoDivider, { backgroundColor: colors.outlineVariant }]} />
          <View style={styles.quickInfoItem}>
            <Text style={[styles.quickInfoLabel, { color: colors.textSecondary }]}>
              {german ? 'STILE' : 'STYLES'}
            </Text>
            <Text style={[styles.quickInfoValue, { color: colors.text }]} numberOfLines={1}>
              {item.styles.length} {german ? 'Hauptstile' : 'Major Styles'}
            </Text>
          </View>
        </View>

        {/* Collapsible Expanded Knowledge Base Body */}
        {isExpanded && (
          <View style={styles.cardExpandedContent}>
            {/* Sub-Navigation Pill Tabs */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.subTabsScrollContainer}>
              {renderSectionTabButton(item.id, 'origin', t('explore.subtabs.origin'), '📜')}
              {renderSectionTabButton(item.id, 'production', t('explore.subtabs.production'), '🔬')}
              {renderSectionTabButton(item.id, 'styles', t('explore.subtabs.styles'), '🏷️')}
              {renderSectionTabButton(item.id, 'sensory', t('explore.subtabs.sensory'), '👃')}
              {renderSectionTabButton(item.id, 'serving', t('explore.subtabs.serving'), '🧊')}
              {renderSectionTabButton(item.id, 'facts', t('explore.subtabs.facts'), '💡')}
            </ScrollView>

            {/* TAB 1: Origin & History */}
            {currentTab === 'origin' && (
              <View style={styles.sectionBody}>
                <View
                  style={[
                    styles.infoHighlightBox,
                    { backgroundColor: colors.surfaceContainer, borderColor: colors.outlineVariant },
                  ]}>
                  <Text style={[styles.infoHighlightLabel, { color: colors.secondary }]}>
                    {german ? 'HISTORISCHE EPOCHE & URSPRUNG' : 'HISTORICAL ERA & ROOTS'}
                  </Text>
                  <Text style={[styles.infoHighlightMain, { color: colors.text }]}>
                    {item.origin.era}
                  </Text>
                  <Text style={[styles.infoHighlightSub, { color: colors.textSecondary }]}>
                    📍 {item.origin.region}
                  </Text>
                </View>

                <View style={styles.proseBlock}>
                  <Text style={[styles.proseParagraph, { color: colors.text }]}>
                    {item.origin.history}
                  </Text>
                </View>

                <Text style={[styles.subsectionTitle, { color: colors.primary }]}>
                  {german ? 'Historischer Zeitstrahl & Meilensteine' : 'Historical Timeline & Milestones'}
                </Text>
                <View style={styles.timelineContainer}>
                  {item.origin.milestones.map((m, idx) => (
                    <View key={idx} style={styles.timelineRow}>
                      <View style={styles.timelineLeftCol}>
                        <View
                          style={[
                            styles.timelineDot,
                            { backgroundColor: colors.primaryContainer },
                          ]}
                        />
                        {idx < item.origin.milestones.length - 1 && (
                          <View
                            style={[
                              styles.timelineLine,
                              { backgroundColor: colors.outlineVariant },
                            ]}
                          />
                        )}
                      </View>
                      <View style={styles.timelineContent}>
                        <View
                          style={[
                            styles.timelineYearBadge,
                            { backgroundColor: colors.surfaceContainerHighest },
                          ]}>
                          <Text style={[styles.timelineYearText, { color: colors.primary }]}>
                            {m.year}
                          </Text>
                        </View>
                        <Text style={[styles.timelineEventText, { color: colors.text }]}>
                          {m.event}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* TAB 2: Craft & Process */}
            {currentTab === 'production' && (
              <View style={styles.sectionBody}>
                <Text style={[styles.subsectionTitle, { color: colors.primary }]}>
                  {german ? 'Wesentliche Zutaten' : 'Essential Ingredients'}
                </Text>
                <View style={styles.ingredientsPillsWrap}>
                  {item.production.ingredients.map((ing, idx) => (
                    <View
                      key={idx}
                      style={[
                        styles.ingredientPill,
                        { backgroundColor: colors.surfaceContainer, borderColor: colors.outlineVariant },
                      ]}>
                      <Text style={[styles.ingredientPillText, { color: colors.text }]}>
                        🌱 {ing}
                      </Text>
                    </View>
                  ))}
                </View>

                <Text
                  style={[
                    styles.subsectionTitle,
                    { color: colors.primary, marginTop: Spacing.four },
                  ]}>
                  {german ? 'Herstellung & Veredelungsprozess' : 'Crafting & Production Journey'}
                </Text>
                <View style={styles.processStepsContainer}>
                  {item.production.steps.map((st, idx) => (
                    <View
                      key={idx}
                      style={[
                        styles.processStepCard,
                        {
                          backgroundColor: colors.surfaceContainer,
                          borderColor: colors.outlineVariant,
                        },
                      ]}>
                      <Text style={[styles.processStepName, { color: colors.primary }]}>
                        {st.name}
                      </Text>
                      <Text style={[styles.processStepDesc, { color: colors.textSecondary }]}>
                        {st.description}
                      </Text>
                    </View>
                  ))}
                </View>

                {item.production.craftTrivia && (
                  <View
                    style={[
                      styles.craftTriviaBox,
                      {
                        backgroundColor: colors.surfaceContainerHighest,
                        borderColor: colors.secondary,
                      },
                    ]}>
                    <Text style={[styles.craftTriviaTitle, { color: colors.secondary }]}>
                      {german ? '✨ Meister-Handwerkswissen' : '✨ Master Craftsman Insight'}
                    </Text>
                    <Text style={[styles.craftTriviaText, { color: colors.text }]}>
                      {item.production.craftTrivia}
                    </Text>
                  </View>
                )}
              </View>
            )}

            {/* TAB 3: Styles & Varieties */}
            {currentTab === 'styles' && (
              <View style={styles.sectionBody}>
                <Text style={[styles.subsectionTitle, { color: colors.primary }]}>
                  {german ? 'Wichtige Stile & Profile' : 'Key Styles & Profiles'}
                </Text>
                <View style={styles.stylesList}>
                  {item.styles.map((styleItem, idx) => (
                    <View
                      key={idx}
                      style={[
                        styles.styleCard,
                        {
                          backgroundColor: colors.surfaceContainer,
                          borderColor: colors.outlineVariant,
                        },
                      ]}>
                      <View style={styles.styleCardHeader}>
                        <Text style={[styles.styleCardName, { color: colors.text }]}>
                          {styleItem.name}
                        </Text>
                        {styleItem.abv && (
                          <View
                            style={[
                              styles.abvBadge,
                              { backgroundColor: colors.surfaceContainerHighest },
                            ]}>
                            <Text style={[styles.abvBadgeText, { color: colors.primary }]}>
                              {styleItem.abv}
                            </Text>
                          </View>
                        )}
                      </View>
                      <Text style={[styles.styleCardDesc, { color: colors.textSecondary }]}>
                        {styleItem.description}
                      </Text>

                      {styleItem.flavorNotes && styleItem.flavorNotes.length > 0 && (
                        <View style={styles.flavorNotesWrap}>
                          {styleItem.flavorNotes.map((fn, fIdx) => (
                            <View
                              key={fIdx}
                              style={[
                                styles.flavorNoteTag,
                                { backgroundColor: colors.surfaceContainerLowest },
                              ]}>
                              <Text style={[styles.flavorNoteTagText, { color: colors.secondary }]}>
                                • {fn}
                              </Text>
                            </View>
                          ))}
                        </View>
                      )}
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* TAB 4: Tasting & Aroma */}
            {currentTab === 'sensory' && (
              <View style={styles.sectionBody}>
                <Text style={[styles.subsectionTitle, { color: colors.primary }]}>
                  {german ? 'Typisches Aromenspektrum' : 'Signature Aroma Spectrum'}
                </Text>
                <View style={styles.aromaTagsWrap}>
                  {item.sensoryProfile.keyAromas.map((aroma, idx) => (
                    <View
                      key={idx}
                      style={[
                        styles.aromaTag,
                        { backgroundColor: colors.primaryContainer },
                      ]}>
                      <Text style={[styles.aromaTagText, { color: colors.onPrimary }]}>
                        🌸 {aroma}
                      </Text>
                    </View>
                  ))}
                </View>

                <View
                  style={[
                    styles.tastingCalloutCard,
                    {
                      backgroundColor: colors.surfaceContainer,
                      borderColor: colors.outlineVariant,
                      marginTop: Spacing.four,
                    },
                  ]}>
                  <Text style={[styles.tastingCalloutLabel, { color: colors.secondary }]}>
                    {german ? 'GESCHMACKSDIMENSIONEN & GAUMENBALANCE' : 'FLAVOR DIMENSIONS & PALATE BALANCE'}
                  </Text>
                  <Text style={[styles.tastingCalloutText, { color: colors.text }]}>
                    {item.sensoryProfile.flavorCharacteristics}
                  </Text>
                </View>

                <View
                  style={[
                    styles.tastingCalloutCard,
                    {
                      backgroundColor: colors.surfaceContainer,
                      borderColor: colors.outlineVariant,
                      marginTop: Spacing.three,
                    },
                  ]}>
                  <Text style={[styles.tastingCalloutLabel, { color: colors.primary }]}>
                    {german ? 'VERKOSTUNGSTECHNIK & BEWERTUNG' : 'HOW TO TASTE & EVALUATE'}
                  </Text>
                  <Text style={[styles.tastingCalloutText, { color: colors.text }]}>
                    {item.sensoryProfile.tastingTechnique}
                  </Text>
                </View>
              </View>
            )}

            {/* TAB 5: Serving & Glass */}
            {currentTab === 'serving' && (
              <View style={styles.sectionBody}>
                <View
                  style={[
                    styles.servingTempCard,
                    {
                      backgroundColor: colors.surfaceContainer,
                      borderColor: colors.outlineVariant,
                    },
                  ]}>
                  <Text style={[styles.servingTempLabel, { color: colors.secondary }]}>
                    🌡️ {german ? 'OPTIMALE SERVIERTEMPERATUR' : 'OPTIMAL SERVING TEMPERATURE'}
                  </Text>
                  <Text style={[styles.servingTempValue, { color: colors.text }]}>
                    {item.serving.idealTemperature}
                  </Text>
                </View>

                <Text
                  style={[
                    styles.subsectionTitle,
                    { color: colors.primary, marginTop: Spacing.four },
                  ]}>
                  {german ? 'Empfohlene Gläser' : 'Recommended Glassware'}
                </Text>
                <View style={styles.glasswareList}>
                  {item.serving.glassware.map((glass, idx) => (
                    <View
                      key={idx}
                      style={[
                        styles.glasswareItem,
                        {
                          backgroundColor: colors.surfaceContainer,
                          borderColor: colors.outlineVariant,
                        },
                      ]}>
                      <Text style={styles.glasswareIcon}>🥂</Text>
                      <Text style={[styles.glasswareText, { color: colors.text }]}>
                        {glass}
                      </Text>
                    </View>
                  ))}
                </View>

                <View
                  style={[
                    styles.proTipBox,
                    {
                      backgroundColor: colors.surfaceContainerHighest,
                      borderColor: colors.primary,
                      marginTop: Spacing.four,
                    },
                  ]}>
                  <Text style={[styles.proTipTitle, { color: colors.primary }]}>
                    💡 {german ? 'Sommelier- & Keller-Profi-Tipp' : 'Sommelier & Cellar Pro-Tip'}
                  </Text>
                  <Text style={[styles.proTipText, { color: colors.text }]}>
                    {item.serving.proTips}
                  </Text>
                </View>
              </View>
            )}

            {/* TAB 6: Trivia & Facts */}
            {currentTab === 'facts' && (
              <View style={styles.sectionBody}>
                <Text style={[styles.subsectionTitle, { color: colors.primary }]}>
                  {german ? 'Faszinierende Getränke-Fakten & Trivia' : 'Intriguing Beverage Lore & Trivia'}
                </Text>
                <View style={styles.factsList}>
                  {item.funFacts.map((fact, idx) => (
                    <View
                      key={idx}
                      style={[
                        styles.factCard,
                        {
                          backgroundColor: colors.surfaceContainer,
                          borderColor: colors.outlineVariant,
                        },
                      ]}>
                      <View
                        style={[
                          styles.factNumberBadge,
                          { backgroundColor: colors.secondaryFixed },
                        ]}>
                        <Text
                          style={[
                            styles.factNumberText,
                            { color: colors.onSecondaryFixed },
                          ]}>
                          #{idx + 1}
                        </Text>
                      </View>
                      <Text style={[styles.factCardText, { color: colors.text }]}>
                        {fact}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Action Footer: Quick Log Drink */}
            <View
              style={[
                styles.cardActionFooter,
                {
                  borderTopColor: colors.outlineVariant,
                  backgroundColor: colors.surfaceContainerLow,
                },
              ]}>
              <Button
                variant="primary"
                title={german ? `+ ${displayArchetype} ins Tagebuch eintragen` : `+ Log a ${item.archetype} to Diary`}
                onPress={() => router.push({ pathname: '/new-entry', params: { archetype: item.archetype } })}
                fullWidth
              />
            </View>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background, paddingTop: safeAreaInsets.top }]}>
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
                  {german ? 'Geschichte, Herkunft, Brautraditionen & Verkostungs-Guides' : 'History, origins, brewing traditions & tasting guides'}
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

            {/* Filter Pills */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterPillsScroll}>
              {categories.map((cat) => {
                const isSelected = selectedCategory === cat;
                return (
                  <CategoryPill
                    key={cat}
                    label={cat === 'All' ? t('common.allShort') : translateArchetype(cat)}
                    isSelected={isSelected}
                    onPress={() => setSelectedCategory(cat)}
                  />
                );
              })}
            </ScrollView>
          </ThemedView>

          {/* Knowledge Articles List */}
          <ThemedView style={styles.articlesList}>
            {filteredKnowledge.length === 0 ? (
              <View
                style={[
                  styles.emptyStateCard,
                  { backgroundColor: colors.surfaceContainerLow, borderColor: colors.outlineVariant },
                ]}>
                <Text style={styles.emptyStateEmoji}>🔍</Text>
                <Text style={[styles.emptyStateTitle, { color: colors.text }]}>
                  {german ? 'Keine passenden Artikel gefunden' : 'No knowledge articles match'}
                </Text>
                <Text style={[styles.emptyStateSubtitle, { color: colors.textSecondary }]}>
                  {german
                    ? `Passe deine Suchanfrage '${searchQuery}' an oder setze die Filter zurück.`
                    : `Try adjusting your search query '${searchQuery}' or resetting category filters.`}
                </Text>
                <Button
                  variant="secondary"
                  size="sm"
                  title={german ? 'Alle Filter zurücksetzen' : 'Reset All Filters'}
                  onPress={() => {
                    setSearchQuery('');
                    setSelectedCategory('All');
                  }}
                  style={{ marginTop: Spacing.two }}
                />
              </View>
            ) : (
              filteredKnowledge.map(renderCategoryCard)
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
    flexDirection: 'row',
    justifyContent: 'center',
  },
  container: {
    maxWidth: MaxContentWidth,
    flexGrow: 1,
    paddingHorizontal: Spacing.four,
  },
  header: {
    paddingTop: Spacing.two,
    paddingBottom: Spacing.three,
    gap: Spacing.three,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  titleIconBadge: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
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
    paddingVertical: Spacing.one,
  },
  articlesList: {
    gap: Spacing.four,
    paddingBottom: Spacing.six,
  },
  card: {
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1.5,
    shadowColor: '#4d0011',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 3,
  },
  bannerTouchable: {
    width: '100%',
  },
  imageContainer: {
    height: 180,
    width: '100%',
    position: 'relative',
    justifyContent: 'flex-end',
  },
  bannerImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  imageGradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  bannerHeaderContent: {
    padding: Spacing.four,
    gap: Spacing.one,
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.one,
  },
  archetypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.two + 2,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  badgeEmoji: {
    fontSize: 13,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  toggleIndicator: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerTitle: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '800',
    textShadowColor: 'rgba(0, 0, 0, 0.7)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  bannerTagline: {
    color: '#f0ede9',
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
    textShadowColor: 'rgba(0, 0, 0, 0.7)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  quickInfoBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: Spacing.two + 2,
    paddingHorizontal: Spacing.three,
    borderBottomWidth: 1,
  },
  quickInfoItem: {
    alignItems: 'center',
    flex: 1,
    gap: 2,
  },
  quickInfoLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  quickInfoValue: {
    fontSize: 12,
    fontWeight: '600',
  },
  quickInfoDivider: {
    width: 1,
    height: 20,
  },
  cardExpandedContent: {
    paddingTop: Spacing.three,
  },
  subTabsScrollContainer: {
    paddingHorizontal: Spacing.three,
    gap: Spacing.two,
    paddingBottom: Spacing.two,
  },
  subTabButton: {
    paddingHorizontal: Spacing.three,
    paddingVertical: 8,
    borderRadius: 12,
  },
  subTabButtonText: {
    fontSize: 12,
    fontWeight: '700',
  },
  sectionBody: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.four,
    gap: Spacing.three,
  },
  infoHighlightBox: {
    padding: Spacing.three,
    borderRadius: 16,
    borderWidth: 1,
    gap: 4,
  },
  infoHighlightLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  infoHighlightMain: {
    fontSize: 15,
    fontWeight: '700',
  },
  infoHighlightSub: {
    fontSize: 13,
    fontWeight: '500',
  },
  proseBlock: {
    marginVertical: Spacing.one,
  },
  proseParagraph: {
    fontSize: 14,
    lineHeight: 22,
    fontWeight: '400',
  },
  subsectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  timelineContainer: {
    gap: 0,
    marginTop: Spacing.one,
  },
  timelineRow: {
    flexDirection: 'row',
  },
  timelineLeftCol: {
    alignItems: 'center',
    width: 24,
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 6,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    marginVertical: 4,
  },
  timelineContent: {
    flex: 1,
    paddingBottom: Spacing.three,
    paddingLeft: Spacing.two,
    gap: 4,
  },
  timelineYearBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  timelineYearText: {
    fontSize: 11,
    fontWeight: '700',
  },
  timelineEventText: {
    fontSize: 13,
    lineHeight: 18,
  },
  ingredientsPillsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  ingredientPill: {
    paddingHorizontal: Spacing.three,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
  },
  ingredientPillText: {
    fontSize: 12,
    fontWeight: '600',
  },
  processStepsContainer: {
    gap: Spacing.two,
  },
  processStepCard: {
    padding: Spacing.three,
    borderRadius: 14,
    borderWidth: 1,
    gap: 4,
  },
  processStepName: {
    fontSize: 13,
    fontWeight: '700',
  },
  processStepDesc: {
    fontSize: 12,
    lineHeight: 17,
  },
  craftTriviaBox: {
    padding: Spacing.three,
    borderRadius: 14,
    borderWidth: 1,
    borderLeftWidth: 4,
    gap: 4,
    marginTop: Spacing.two,
  },
  craftTriviaTitle: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  craftTriviaText: {
    fontSize: 13,
    lineHeight: 19,
    fontStyle: 'italic',
  },
  stylesList: {
    gap: Spacing.two,
  },
  styleCard: {
    padding: Spacing.three,
    borderRadius: 14,
    borderWidth: 1,
    gap: Spacing.one,
  },
  styleCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  styleCardName: {
    fontSize: 14,
    fontWeight: '700',
    flex: 1,
  },
  abvBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  abvBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  styleCardDesc: {
    fontSize: 12,
    lineHeight: 18,
  },
  flavorNotesWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: Spacing.one,
  },
  flavorNoteTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  flavorNoteTagText: {
    fontSize: 11,
    fontWeight: '600',
  },
  aromaTagsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  aromaTag: {
    paddingHorizontal: Spacing.three,
    paddingVertical: 6,
    borderRadius: 12,
  },
  aromaTagText: {
    fontSize: 12,
    fontWeight: '700',
  },
  tastingCalloutCard: {
    padding: Spacing.three,
    borderRadius: 14,
    borderWidth: 1,
    gap: 4,
  },
  tastingCalloutLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  tastingCalloutText: {
    fontSize: 13,
    lineHeight: 19,
  },
  servingTempCard: {
    padding: Spacing.three,
    borderRadius: 14,
    borderWidth: 1,
    gap: 4,
  },
  servingTempLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  servingTempValue: {
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
  glasswareList: {
    gap: Spacing.one + 2,
  },
  glasswareItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.two + 2,
    borderRadius: 12,
    borderWidth: 1,
    gap: Spacing.two,
  },
  glasswareIcon: {
    fontSize: 16,
  },
  glasswareText: {
    fontSize: 13,
    fontWeight: '600',
  },
  proTipBox: {
    padding: Spacing.three,
    borderRadius: 14,
    borderWidth: 1,
    borderLeftWidth: 4,
    gap: 4,
  },
  proTipTitle: {
    fontSize: 12,
    fontWeight: '800',
  },
  proTipText: {
    fontSize: 13,
    lineHeight: 19,
  },
  factsList: {
    gap: Spacing.two,
  },
  factCard: {
    flexDirection: 'row',
    padding: Spacing.three,
    borderRadius: 14,
    borderWidth: 1,
    gap: Spacing.two,
  },
  factNumberBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  factNumberText: {
    fontSize: 11,
    fontWeight: '800',
  },
  factCardText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
  },
  cardActionFooter: {
    padding: Spacing.three,
    borderTopWidth: 1,
  },
  quickLogButton: {
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickLogButtonText: {
    fontSize: 13,
    fontWeight: '700',
  },
  emptyStateCard: {
    alignItems: 'center',
    padding: Spacing.five,
    borderRadius: 20,
    borderWidth: 1,
    gap: Spacing.two,
    marginTop: Spacing.three,
  },
  emptyStateEmoji: {
    fontSize: 40,
  },
  emptyStateTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  emptyStateSubtitle: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 19,
  },
  resetFilterButton: {
    marginTop: Spacing.two,
    paddingHorizontal: Spacing.four,
    paddingVertical: 8,
    borderRadius: 10,
  },
  resetFilterButtonText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
