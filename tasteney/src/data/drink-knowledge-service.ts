import knowledgeJson from '@/data/drink-knowledge.json';
import {
  DrinkKnowledgeData,
  DrinkCategory,
  DrinkArticle,
  ArticleFilterOptions,
} from '@/types/drink-knowledge';

const data: DrinkKnowledgeData = knowledgeJson as DrinkKnowledgeData;

/**
 * Returns raw data container for drink knowledge.
 */
export function getKnowledgeData(): DrinkKnowledgeData {
  return data;
}

/**
 * Returns all available beverage knowledge categories.
 */
export function getCategories(): DrinkCategory[] {
  return data.categories;
}

/**
 * Resolves localized fields for an article with field-level fallback to English and root fields.
 */
export function getLocalizedArticle(article: DrinkArticle, language?: string): DrinkArticle {
  if (!article) return article;
  const normalizedLang = (language || 'en').toLowerCase().trim();
  const shortLang = normalizedLang.split('-')[0];

  const targetTranslation =
    article.translations?.[normalizedLang] ||
    article.translations?.[shortLang];
  const enTranslation = article.translations?.['en'];

  const resolvedTitle =
    targetTranslation?.title || enTranslation?.title || article.title;
  const resolvedSummary =
    targetTranslation?.summary || enTranslation?.summary || article.summary;
  const resolvedContent =
    targetTranslation?.content || enTranslation?.content || article.content;
  const resolvedWikipediaUrl =
    targetTranslation?.wikipediaUrl || enTranslation?.wikipediaUrl || article.wikipediaUrl;

  return {
    ...article,
    title: resolvedTitle,
    summary: resolvedSummary,
    content: resolvedContent,
    wikipediaUrl: resolvedWikipediaUrl,
  };
}

/**
 * Returns all knowledge articles without filtering, optionally localized.
 */
export function getAllArticles(language?: string): DrinkArticle[] {
  if (!language) return data.articles;
  return data.articles.map((a) => getLocalizedArticle(a, language));
}

/**
 * Finds an article by its unique ID, optionally localized.
 */
export function getArticleById(id: string, language?: string): DrinkArticle | undefined {
  if (!id) return undefined;
  const article = data.articles.find((a) => a.id.toLowerCase() === id.toLowerCase());
  if (!article) return undefined;
  return language ? getLocalizedArticle(article, language) : article;
}

/**
 * Returns related articles for a given article ID, optionally localized.
 */
export function getRelatedArticles(id: string, language?: string): DrinkArticle[] {
  const article = getArticleById(id);
  if (!article || !article.relatedArticleIds || article.relatedArticleIds.length === 0) {
    return [];
  }

  return article.relatedArticleIds
    .map((relId) => getArticleById(relId, language))
    .filter((a): a is DrinkArticle => Boolean(a));
}

/**
 * Filters articles based on category, article type, search query, and language.
 */
export function getArticles(filterOptions?: ArticleFilterOptions): DrinkArticle[] {
  if (!filterOptions) {
    return data.articles;
  }

  const { category, type, searchQuery, language } = filterOptions;
  const normalizedCategory = category?.toLowerCase().trim();
  const normalizedQuery = searchQuery?.toLowerCase().trim();

  const articles = language
    ? data.articles.map((a) => getLocalizedArticle(a, language))
    : data.articles;

  return articles.filter((article) => {
    // 1. Category Filter
    if (normalizedCategory && normalizedCategory !== 'all') {
      if (article.category.toLowerCase() !== normalizedCategory) {
        return false;
      }
    }

    // 2. Type Filter ('all', 'general', 'ingredient', 'location')
    if (type && type !== 'all') {
      if (article.type !== type) {
        return false;
      }
    }

    // 3. Search Query Filter
    if (normalizedQuery) {
      const inTitle = article.title.toLowerCase().includes(normalizedQuery);
      const inSummary = article.summary.toLowerCase().includes(normalizedQuery);
      const inContent = article.content.toLowerCase().includes(normalizedQuery);
      const inCategory = article.category.toLowerCase().includes(normalizedQuery);
      const inTags = article.tags?.some((tag) => tag.toLowerCase().includes(normalizedQuery)) ?? false;
      const inLocation =
        article.location &&
        (article.location.region.toLowerCase().includes(normalizedQuery) ||
          article.location.country.toLowerCase().includes(normalizedQuery));
      const inIngredient =
        article.ingredient &&
        (article.ingredient.kind.toLowerCase().includes(normalizedQuery) ||
          article.ingredient.alsoKnownAs?.some((aka) => aka.toLowerCase().includes(normalizedQuery)));

      // Also check root/fallback fields to maximize discoverability across languages
      const origArticle = data.articles.find((a) => a.id === article.id);
      const inOrigTitle = origArticle ? origArticle.title.toLowerCase().includes(normalizedQuery) : false;
      const inOrigSummary = origArticle ? origArticle.summary.toLowerCase().includes(normalizedQuery) : false;
      const inOrigContent = origArticle ? origArticle.content.toLowerCase().includes(normalizedQuery) : false;

      if (
        !inTitle &&
        !inSummary &&
        !inContent &&
        !inCategory &&
        !inTags &&
        !inLocation &&
        !inIngredient &&
        !inOrigTitle &&
        !inOrigSummary &&
        !inOrigContent
      ) {
        return false;
      }
    }

    return true;
  });
}
