import AsyncStorage from '@react-native-async-storage/async-storage';
import { DrinkEntry } from '@/types/drink';
import { persistImage, resolveImageUri, deleteImageFile } from '@/services/image-storage';
import { generateUuid } from '@/utils/uuid';

const STORAGE_KEY = '@tasteney/drink_entries_v1';

/**
 * Resolves relative and legacy image paths in a drink entry to active runtime URIs.
 */
function resolveEntryImages(entry: DrinkEntry): DrinkEntry {
  if (!entry) return entry;
  return {
    ...entry,
    images: Array.isArray(entry.images)
      ? entry.images.map((img) => resolveImageUri(img) || img).filter(Boolean)
      : [],
  };
}

/**
 * Internal helper to read raw serialized entries directly from AsyncStorage.
 */
async function getRawDrinkEntries(): Promise<DrinkEntry[]> {
  try {
    const rawData = await AsyncStorage.getItem(STORAGE_KEY);
    if (!rawData) {
      return [];
    }
    const entries: DrinkEntry[] = JSON.parse(rawData);
    return Array.isArray(entries) ? entries : [];
  } catch (error) {
    console.error('Failed to load raw drink entries from storage:', error);
    return [];
  }
}

export async function getDrinkEntries(): Promise<DrinkEntry[]> {
  try {
    const rawEntries = await getRawDrinkEntries();
    // Resolve relative image paths for runtime consumption and sort descending
    return rawEntries
      .map(resolveEntryImages)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    console.error('Failed to load drink entries from storage:', error);
    return [];
  }
}

export async function getDrinkEntryById(id: string): Promise<DrinkEntry | null> {
  try {
    const rawEntries = await getRawDrinkEntries();
    const entry = rawEntries.find((e) => e.id === id);
    return entry ? resolveEntryImages(entry) : null;
  } catch (error) {
    console.error('Failed to load drink entry by id from storage:', error);
    return null;
  }
}

export async function saveDrinkEntry(
  entryData: Omit<DrinkEntry, 'id' | 'createdAt'> & { id?: string; createdAt?: string }
): Promise<DrinkEntry> {
  try {
    const rawEntries = await getRawDrinkEntries();
    const targetId = entryData.id;
    const existingIndex = targetId ? rawEntries.findIndex((e) => e.id === targetId) : -1;
    const existingEntry = existingIndex >= 0 ? rawEntries[existingIndex] : null;

    // Persist all incoming images to persistent document storage
    const incomingImages = Array.isArray(entryData.images) ? entryData.images : [];
    const persistedImages = await Promise.all(
      incomingImages.map(async (imgUri) => {
        return await persistImage(imgUri);
      })
    );

    // Clean up any images that were removed during an edit
    if (existingEntry && Array.isArray(existingEntry.images)) {
      const removedImages = existingEntry.images.filter(
        (oldImg) => !persistedImages.includes(oldImg) && !incomingImages.includes(oldImg)
      );
      await Promise.all(removedImages.map((img) => deleteImageFile(img)));
    }

    const newRawEntry: DrinkEntry = {
      ...entryData,
      id: targetId || generateUuid(),
      createdAt: entryData.createdAt || existingEntry?.createdAt || new Date().toISOString(),
      images: persistedImages,
    };

    let updatedEntries: DrinkEntry[];
    if (existingIndex >= 0) {
      updatedEntries = [...rawEntries];
      updatedEntries[existingIndex] = newRawEntry;
    } else {
      updatedEntries = [newRawEntry, ...rawEntries];
    }

    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedEntries));
    return resolveEntryImages(newRawEntry);
  } catch (error) {
    console.error('Failed to save drink entry to storage:', error);
    throw error;
  }
}

export async function deleteDrinkEntry(id: string): Promise<void> {
  try {
    const rawEntries = await getRawDrinkEntries();
    const existingEntry = rawEntries.find((entry) => entry.id === id);

    if (existingEntry && Array.isArray(existingEntry.images)) {
      // Remove physical image files from disk to prevent storage leaks
      await Promise.all(existingEntry.images.map((img) => deleteImageFile(img)));
    }

    const updatedEntries = rawEntries.filter((entry) => entry.id !== id);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedEntries));
  } catch (error) {
    console.error('Failed to delete drink entry from storage:', error);
    throw error;
  }
}

export async function clearAllDrinkEntries(): Promise<void> {
  try {
    const rawEntries = await getRawDrinkEntries();
    // Clean up all local image files
    for (const entry of rawEntries) {
      if (Array.isArray(entry.images)) {
        await Promise.all(entry.images.map((img) => deleteImageFile(img)));
      }
    }
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear drink entries:', error);
    throw error;
  }
}
