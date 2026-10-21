import AsyncStorage from '@react-native-async-storage/async-storage';
import { BeverageArchetype } from '@/types/drink';

const USER_PREFERENCES_KEY = '@tasteney/user_preferences_v1';

export interface UserPreferences {
  hasCompletedWelcome: boolean;
  showAlcoholInfo: boolean;
}

const DEFAULT_PREFERENCES: UserPreferences = {
  hasCompletedWelcome: false,
  showAlcoholInfo: false,
};

type PreferencesListener = (prefs: UserPreferences) => void;
const listeners = new Set<PreferencesListener>();

let cachedPreferences: UserPreferences | null = null;

export async function getUserPreferences(): Promise<UserPreferences> {
  if (cachedPreferences) {
    return cachedPreferences;
  }
  try {
    const rawData = await AsyncStorage.getItem(USER_PREFERENCES_KEY);
    if (!rawData) {
      cachedPreferences = { ...DEFAULT_PREFERENCES };
      return cachedPreferences;
    }
    const parsed = JSON.parse(rawData);
    cachedPreferences = {
      hasCompletedWelcome: Boolean(parsed.hasCompletedWelcome),
      showAlcoholInfo: Boolean(parsed.showAlcoholInfo),
    };
    return cachedPreferences;
  } catch (error) {
    console.error('Failed to load user preferences:', error);
    cachedPreferences = { ...DEFAULT_PREFERENCES };
    return cachedPreferences;
  }
}

export async function setUserPreferences(
  updates: Partial<UserPreferences>
): Promise<UserPreferences> {
  try {
    const current = await getUserPreferences();
    const updated: UserPreferences = {
      ...current,
      ...updates,
    };
    cachedPreferences = updated;
    await AsyncStorage.setItem(USER_PREFERENCES_KEY, JSON.stringify(updated));
    listeners.forEach((listener) => {
      try {
        listener(updated);
      } catch (err) {
        console.error('Error in preferences listener:', err);
      }
    });
    return updated;
  } catch (error) {
    console.error('Failed to save user preferences:', error);
    throw error;
  }
}

export function subscribeUserPreferences(listener: PreferencesListener): () => void {
  listeners.add(listener);
  getUserPreferences().then((prefs) => {
    try {
      listener(prefs);
    } catch (err) {
      console.error('Error in initial preferences subscriber call:', err);
    }
  });
  return () => {
    listeners.delete(listener);
  };
}

const NON_ALCOHOLIC_ARCHETYPES: BeverageArchetype[] = ['Coffee', 'Tea', 'Soda & Tonics'];

export function isNonAlcoholicArchetype(archetype: BeverageArchetype | string): boolean {
  return NON_ALCOHOLIC_ARCHETYPES.includes(archetype as BeverageArchetype);
}

/**
 * Returns a sorted list of archetypes according to entry counts.
 * If showAlcoholInfo is false, non-alcoholic drinks (Coffee, Tea, Soda & Tonics) are placed first
 * when the counters are the same.
 */
export function sortArchetypesWithPreferences(
  archetypes: BeverageArchetype[],
  counts: Record<string, number>,
  showAlcoholInfo: boolean
): BeverageArchetype[] {
  return [...archetypes].sort((a, b) => {
    const countA = counts[a] || 0;
    const countB = counts[b] || 0;
    const countDiff = countB - countA;

    if (countDiff !== 0) {
      return countDiff;
    }

    if (!showAlcoholInfo) {
      const isNonAlcA = isNonAlcoholicArchetype(a);
      const isNonAlcB = isNonAlcoholicArchetype(b);

      if (isNonAlcA && !isNonAlcB) {
        return -1;
      }
      if (!isNonAlcA && isNonAlcB) {
        return 1;
      }
      if (isNonAlcA && isNonAlcB) {
        const indexA = NON_ALCOHOLIC_ARCHETYPES.indexOf(a);
        const indexB = NON_ALCOHOLIC_ARCHETYPES.indexOf(b);
        if (indexA !== -1 && indexB !== -1) {
          return indexA - indexB;
        }
      }
    }

    return a.localeCompare(b);
  });
}
