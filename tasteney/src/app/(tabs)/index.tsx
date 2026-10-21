import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Linking,
  useColorScheme,
  Platform,
} from 'react-native';
import { Image } from 'expo-image';
import { useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { Colors, Spacing, MaxContentWidth } from '@/constants/theme';
import { Card } from '@/components/card';
import { Badge } from '@/components/badge';
import { formatDate } from '@/i18n';
import {
  NewsArticle,
  getOrCreateWelcomeMessage,
  fetchNewsArticles,
  combineNewsWithWelcome,
} from '@/services/news';

const PAGE_SIZE = 5;

export default function NewsScreen() {
  const scheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];

  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [welcomeMessage, setWelcomeMessage] = useState<NewsArticle | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentLimit, setCurrentLimit] = useState(PAGE_SIZE);
  const flatListRef = useRef<FlatList<NewsArticle>>(null);

  // Initialize welcome message and load initial news batch
  const loadInitialNews = useCallback(async () => {
    try {
      const welcome = await getOrCreateWelcomeMessage(
        t('news.welcomeTitle'),
        t('news.welcomeBody')
      );
      setWelcomeMessage(welcome);

      const backendNews = await fetchNewsArticles(PAGE_SIZE);
      const combined = combineNewsWithWelcome(backendNews, welcome);
      setArticles(combined);
      setCurrentLimit(PAGE_SIZE);

      // If backend returned fewer than PAGE_SIZE, there are no older news articles
      if (backendNews.length < PAGE_SIZE) {
        setHasMore(false);
      } else {
        setHasMore(true);
      }
    } catch (err) {
      console.error('Error loading initial news:', err);
    }
  }, [t]);

  useFocusEffect(
    useCallback(() => {
      loadInitialNews();
      flatListRef.current?.scrollToOffset({ offset: 0, animated: false });
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        window.scrollTo(0, 0);
        document.documentElement?.scrollTo?.(0, 0);
        document.body?.scrollTo?.(0, 0);
      }
    }, [loadInitialNews])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      const welcome =
        welcomeMessage ||
        (await getOrCreateWelcomeMessage(t('news.welcomeTitle'), t('news.welcomeBody')));
      if (!welcomeMessage) {
        setWelcomeMessage(welcome);
      }

      const backendNews = await fetchNewsArticles(PAGE_SIZE);
      const combined = combineNewsWithWelcome(backendNews, welcome);
      setArticles(combined);
      setCurrentLimit(PAGE_SIZE);
      if (backendNews.length < PAGE_SIZE) {
        setHasMore(false);
      } else {
        setHasMore(true);
      }
    } catch (err) {
      console.error('Error refreshing news:', err);
    } finally {
      setRefreshing(false);
    }
  };

  const handleLoadMore = async () => {
    if (isLoadingMore || !hasMore || refreshing) return;

    setIsLoadingMore(true);
    const nextLimit = currentLimit + PAGE_SIZE;

    try {
      const backendNews = await fetchNewsArticles(nextLimit);
      const welcome =
        welcomeMessage ||
        (await getOrCreateWelcomeMessage(t('news.welcomeTitle'), t('news.welcomeBody')));

      const combined = combineNewsWithWelcome(backendNews, welcome);
      setArticles(combined);

      // Check if we received new items
      if (backendNews.length <= currentLimit || backendNews.length < nextLimit) {
        setHasMore(false);
      } else {
        setHasMore(true);
      }
      setCurrentLimit(nextLimit);
    } catch (err) {
      console.error('Error loading more news:', err);
      setHasMore(false);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const handleOpenLink = async (url?: string | null) => {
    if (!url) return;
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      }
    } catch (err) {
      console.error('Failed to open link:', err);
    }
  };

  const renderItem = ({ item }: { item: NewsArticle }) => {
    const isWelcome = item.isWelcomeMessage;
    const hasImage = Boolean(item.imagePath && item.imagePath.trim().length > 0);
    const hasLink = Boolean(item.link && item.link.trim().length > 0);

    return (
      <Card
        variant="elevated"
        style={[
          styles.articleCard,
          {
            backgroundColor: isWelcome
              ? scheme === 'dark'
                ? '#2a1a1e'
                : '#fff4f6'
              : colors.surfaceContainerLowest,
            borderColor: isWelcome ? colors.primary : colors.outlineVariant,
            borderWidth: isWelcome ? 1.5 : 1,
          },
        ]}>
        {hasImage && (
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: item.imagePath! }}
              style={styles.articleImage}
              contentFit="cover"
              transition={200}
            />
          </View>
        )}

        <View style={styles.cardHeader}>
          {isWelcome ? (
            <Badge
              label={`✨ ${t('news.welcomeBadge')}`}
              variant="primary"
            />
          ) : null}

          <Text style={[styles.dateText, { color: colors.outline }]}>
            {formatDate(item.createdAt)}
          </Text>
        </View>

        <Text style={[styles.headlineText, { color: colors.text }]}>{item.headline}</Text>

        <Text style={[styles.bodyText, { color: colors.textSecondary }]}>{item.text}</Text>

        {hasLink && (
          <TouchableOpacity
            style={styles.linkButton}
            onPress={() => handleOpenLink(item.link)}
            activeOpacity={0.7}>
            <Text style={[styles.linkButtonText, { color: colors.primary }]}>
              {t('news.readMore')} →
            </Text>
          </TouchableOpacity>
        )}
      </Card>
    );
  };

  const renderFooter = () => {
    if (isLoadingMore) {
      return (
        <View style={styles.footerLoader}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={[styles.footerLoaderText, { color: colors.textSecondary }]}>
            {t('news.loadingMore')}
          </Text>
        </View>
      );
    }

    if (!hasMore && articles.length > 1) {
      return (
        <View style={styles.caughtUpContainer}>
          <View style={[styles.divider, { backgroundColor: colors.outlineVariant }]} />
          <Text style={[styles.caughtUpText, { color: colors.outline }]}>
            {t('news.allCaughtUp')}
          </Text>
          <View style={[styles.divider, { backgroundColor: colors.outlineVariant }]} />
        </View>
      );
    }

    return null;
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + Spacing.two,
            backgroundColor: colors.background,
            borderColor: colors.outlineVariant,
          },
        ]}>
        <Text style={[styles.headerSub, { color: colors.primary }]}>{t('news.headerSub')}</Text>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{t('news.headerTitle')}</Text>
      </View>

      {/* News List */}
      <FlatList
        ref={flatListRef}
        data={articles}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={[
          styles.listContent,
          {
            paddingBottom: insets.bottom + 90,
          },
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.4}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📰</Text>
            <Text style={[styles.emptyTitle, { color: colors.primary }]}>
              {t('news.emptyTitle')}
            </Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
              {t('news.emptySubtitle')}
            </Text>
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
    paddingBottom: Spacing.three,
    borderBottomWidth: 1,
    gap: Spacing.one,
  },
  headerSub: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  listContent: {
    padding: Spacing.four,
    gap: Spacing.four,
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    width: '100%',
  },
  articleCard: {
    padding: Spacing.four,
    gap: Spacing.two,
    borderRadius: 20,
  },
  imageContainer: {
    width: '100%',
    height: 180,
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: Spacing.two,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  articleImage: {
    width: '100%',
    height: '100%',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.one,
  },
  dateText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 'auto',
  },
  headlineText: {
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 24,
  },
  bodyText: {
    fontSize: 14,
    lineHeight: 22,
  },
  linkButton: {
    alignSelf: 'flex-start',
    marginTop: Spacing.two,
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.two,
  },
  linkButtonText: {
    fontSize: 14,
    fontWeight: '700',
  },
  footerLoader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.four,
    gap: Spacing.two,
  },
  footerLoaderText: {
    fontSize: 13,
    fontWeight: '500',
  },
  caughtUpContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.four,
    gap: Spacing.three,
  },
  divider: {
    flex: 1,
    height: 1,
  },
  caughtUpText: {
    fontSize: 12,
    fontWeight: '500',
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
  },
});
