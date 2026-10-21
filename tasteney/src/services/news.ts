import AsyncStorage from '@react-native-async-storage/async-storage';
import { ENDPOINTS } from './network';

export const WELCOME_NEWS_STORAGE_KEY = '@tasteney/news_welcome_message_v1';

export interface NewsArticle {
  id: string;
  headline: string;
  text: string;
  imagePath?: string | null;
  link?: string | null;
  active?: boolean;
  createdAt: string;
  updatedAt?: string;
  isWelcomeMessage?: boolean;
}

export async function getOrCreateWelcomeMessage(
  defaultHeadline: string,
  defaultText: string
): Promise<NewsArticle> {
  try {
    const json = await AsyncStorage.getItem(WELCOME_NEWS_STORAGE_KEY);
    if (json) {
      const parsed = JSON.parse(json) as NewsArticle;
      return parsed;
    }
  } catch (err) {
    console.error('Failed to read stored welcome news message:', err);
  }

  const welcomeArticle: NewsArticle = {
    id: 'welcome-tasteney-news',
    headline: defaultHeadline,
    text: defaultText,
    createdAt: new Date().toISOString(),
    isWelcomeMessage: true,
    active: true,
  };

  try {
    await AsyncStorage.setItem(WELCOME_NEWS_STORAGE_KEY, JSON.stringify(welcomeArticle));
  } catch (err) {
    console.error('Failed to save welcome news message:', err);
  }

  return welcomeArticle;
}

export async function fetchNewsArticles(limit: number = 5): Promise<NewsArticle[]> {
  try {
    const url = `${ENDPOINTS.latestNews}?limit=${limit}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Failed to fetch news: ${response.status}`);
    }

    const data = (await response.json()) as NewsArticle[];
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.warn('Could not fetch news from backend:', error);
    return [];
  }
}

export function combineNewsWithWelcome(
  backendNews: NewsArticle[],
  welcomeMessage: NewsArticle | null
): NewsArticle[] {
  const articles = [...backendNews];
  if (welcomeMessage) {
    if (!articles.some((a) => a.id === welcomeMessage.id)) {
      articles.push(welcomeMessage);
    }
  }
  return articles.sort((a, b) => {
    const timeA = new Date(a.createdAt).getTime();
    const timeB = new Date(b.createdAt).getTime();
    return timeB - timeA;
  });
}
