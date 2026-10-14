export type ArticleType = 'general' | 'ingredient' | 'location';

export interface LocationMetadata {
  region: string;
  country: string;
  coordinates?: { lat: number; lon: number };
}

export interface IngredientMetadata {
  kind: string;
  alsoKnownAs?: string[];
}

export interface ArticleTranslation {
  title?: string;
  summary?: string;
  content: string;
  wikipediaUrl?: string;
}

export interface DrinkArticle {
  id: string;
  title: string;
  category: string; // e.g., 'wine', 'beer', 'coffee', 'spirits', 'tea', 'cocktail', 'soda-tonics', 'other'
  type: ArticleType;
  summary: string;
  content: string;
  wikipediaUrl?: string;
  translations?: {
    en?: ArticleTranslation;
    de?: ArticleTranslation;
    [languageCode: string]: ArticleTranslation | undefined;
  };
  tags?: string[];
  relatedArticleIds?: string[];
  location?: LocationMetadata;
  ingredient?: IngredientMetadata;
}

export interface DrinkCategory {
  id: string;
  name: string;
  icon?: string;
  archetype?: string;
}

export interface DrinkKnowledgeData {
  meta: {
    version: string;
    lastUpdated: string;
  };
  categories: DrinkCategory[];
  articles: DrinkArticle[];
}

export interface ArticleFilterOptions {
  category?: string;
  type?: ArticleType | 'all';
  searchQuery?: string;
  language?: string;
}
