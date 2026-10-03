import AsyncStorage from '@react-native-async-storage/async-storage';
import { DrinkEntry } from '@/types/drink';

const STORAGE_KEY = '@tasteney/drink_entries_v1';

export async function getDrinkEntries(): Promise<DrinkEntry[]> {
  try {
    const rawData = await AsyncStorage.getItem(STORAGE_KEY);
    if (!rawData) {
      return [];
    }
    const entries: DrinkEntry[] = JSON.parse(rawData);
    // Sort descending by creation date
    return entries.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  } catch (error) {
    console.error('Failed to load drink entries from storage:', error);
    return [];
  }
}

export async function getDrinkEntryById(id: string): Promise<DrinkEntry | null> {
  try {
    const entries = await getDrinkEntries();
    return entries.find((entry) => entry.id === id) || null;
  } catch (error) {
    console.error('Failed to load drink entry by id from storage:', error);
    return null;
  }
}

export async function saveDrinkEntry(
  entryData: Omit<DrinkEntry, 'id' | 'createdAt'> & { id?: string; createdAt?: string }
): Promise<DrinkEntry> {
  try {
    const entries = await getDrinkEntries();
    const newEntry: DrinkEntry = {
      ...entryData,
      id: entryData.id || `drink_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      createdAt: entryData.createdAt || new Date().toISOString(),
      images: entryData.images && entryData.images.length > 0 ? entryData.images : [],
    };

    const existingIndex = entries.findIndex((e) => e.id === newEntry.id);
    let updatedEntries: DrinkEntry[];
    if (existingIndex >= 0) {
      updatedEntries = [...entries];
      updatedEntries[existingIndex] = newEntry;
    } else {
      updatedEntries = [newEntry, ...entries];
    }

    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedEntries));
    return newEntry;
  } catch (error) {
    console.error('Failed to save drink entry to storage:', error);
    throw error;
  }
}

export async function deleteDrinkEntry(id: string): Promise<void> {
  try {
    const entries = await getDrinkEntries();
    const updatedEntries = entries.filter((entry) => entry.id !== id);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedEntries));
  } catch (error) {
    console.error('Failed to delete drink entry from storage:', error);
    throw error;
  }
}

export async function clearAllDrinkEntries(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear drink entries:', error);
    throw error;
  }
}
