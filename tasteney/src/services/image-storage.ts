import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import { generateUuid } from '@/utils/uuid';

export const IMAGE_DIR_NAME = 'drink_images';

/**
 * Returns the persistent drink images directory URI ending with a trailing slash.
 */
export function getImageDirectory(): string | null {
  if (Platform.OS === 'web' || !FileSystem.documentDirectory) {
    return null;
  }
  return `${FileSystem.documentDirectory}${IMAGE_DIR_NAME}/`;
}

/**
 * Ensures the persistent image directory exists on disk.
 */
export async function ensureImageDirectory(): Promise<string | null> {
  const dir = getImageDirectory();
  if (!dir) {
    return null;
  }

  try {
    const dirInfo = await FileSystem.getInfoAsync(dir);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
    }
    return dir;
  } catch (error) {
    console.error('Failed to create image storage directory:', error);
    return null;
  }
}

/**
 * Extracts a file extension from a URI, falling back to 'jpg'.
 */
function getFileExtension(uri: string): string {
  try {
    const cleanUri = uri.split('?')[0].split('#')[0];
    const match = cleanUri.match(/\.([a-zA-Z0-9]+)$/);
    if (match && match[1]) {
      const ext = match[1].toLowerCase();
      if (['jpg', 'jpeg', 'png', 'webp', 'heic', 'gif'].includes(ext)) {
        return ext;
      }
    }
  } catch {
    // fallback
  }
  return 'jpg';
}

/**
 * Extracts a UUID from a stored image relative path or filename.
 * Returns the UUID string if found, or null otherwise.
 */
export function extractImageUuid(storedUri: string | null | undefined): string | null {
  if (!storedUri || typeof storedUri !== 'string') {
    return null;
  }
  const match = storedUri.match(/([0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})/i);
  return match ? match[1] : null;
}

/**
 * Checks if a URI is already a relative path or remote/web URI that does not require copying.
 */
export function isRemoteOrDataUri(uri: string): boolean {
  if (!uri) return false;
  return (
    uri.startsWith('http://') ||
    uri.startsWith('https://') ||
    uri.startsWith('data:') ||
    uri.startsWith('blob:') ||
    uri.startsWith('ph://') ||
    uri.startsWith('assets-library://')
  );
}

/**
 * Persists an image from a temporary camera/picker URI to the persistent document directory.
 * Returns the relative path (e.g. `drink_images/img_12345_abc.jpg`) to store in AsyncStorage.
 */
export async function persistImage(sourceUri: string): Promise<string> {
  if (!sourceUri || typeof sourceUri !== 'string') {
    return '';
  }

  const trimmedUri = sourceUri.trim();
  if (!trimmedUri) {
    return '';
  }

  // Bypass on web or for remote/data URIs
  if (Platform.OS === 'web' || !FileSystem.documentDirectory || isRemoteOrDataUri(trimmedUri)) {
    return trimmedUri;
  }

  // If already relative path inside drink_images
  if (trimmedUri.startsWith(`${IMAGE_DIR_NAME}/`)) {
    return trimmedUri;
  }

  // If it is an absolute URI that already points to drink_images, convert to relative
  const dir = getImageDirectory();
  if (dir && trimmedUri.startsWith(dir)) {
    return `${IMAGE_DIR_NAME}/${trimmedUri.substring(dir.length)}`;
  }
  const imageDirIndex = trimmedUri.indexOf(`/${IMAGE_DIR_NAME}/`);
  if (imageDirIndex !== -1) {
    return trimmedUri.substring(imageDirIndex + 1);
  }

  try {
    await ensureImageDirectory();

    const ext = getFileExtension(trimmedUri);
    const filename = `img_${generateUuid()}.${ext}`;
    const relativePath = `${IMAGE_DIR_NAME}/${filename}`;
    const targetUri = `${FileSystem.documentDirectory}${relativePath}`;

    await FileSystem.copyAsync({
      from: trimmedUri,
      to: targetUri,
    });

    return relativePath;
  } catch (error) {
    console.error(`Failed to persist image from URI "${trimmedUri}":`, error);
    // Return original URI as fallback to avoid blocking user operations
    return trimmedUri;
  }
}

/**
 * Resolves a stored relative path or legacy absolute path to a valid, current runtime file URI.
 */
export function resolveImageUri(storedUri: string | null | undefined): string | null {
  if (!storedUri || typeof storedUri !== 'string') {
    return null;
  }

  const trimmedUri = storedUri.trim();
  if (!trimmedUri) {
    return null;
  }

  // Remote, data, asset URIs or web platform
  if (Platform.OS === 'web' || !FileSystem.documentDirectory || isRemoteOrDataUri(trimmedUri)) {
    return trimmedUri;
  }

  // Relative path format: "drink_images/img_xxx.jpg"
  if (trimmedUri.startsWith(`${IMAGE_DIR_NAME}/`)) {
    return `${FileSystem.documentDirectory}${trimmedUri}`;
  }

  // Legacy absolute path containing "/drink_images/"
  const imageDirIndex = trimmedUri.indexOf(`/${IMAGE_DIR_NAME}/`);
  if (imageDirIndex !== -1) {
    const relativePart = trimmedUri.substring(imageDirIndex + 1);
    return `${FileSystem.documentDirectory}${relativePart}`;
  }

  // Plain filename without directory: "img_<uuid>.jpg" or "<uuid>.jpg"
  if (/^(?:img_)?[0-9a-fA-F-]+\.[a-zA-Z0-9]+$/.test(trimmedUri)) {
    return `${FileSystem.documentDirectory}${IMAGE_DIR_NAME}/${trimmedUri}`;
  }

  // Otherwise return as is (e.g. other file:// paths)
  return trimmedUri;
}

/**
 * Deletes a persistent image file from disk if it exists.
 */
export async function deleteImageFile(storedUri: string | null | undefined): Promise<void> {
  if (!storedUri || typeof storedUri !== 'string') {
    return;
  }

  if (Platform.OS === 'web' || !FileSystem.documentDirectory || isRemoteOrDataUri(storedUri)) {
    return;
  }

  const resolved = resolveImageUri(storedUri);
  if (!resolved || !resolved.startsWith('file://')) {
    return;
  }

  try {
    const info = await FileSystem.getInfoAsync(resolved);
    if (info.exists) {
      await FileSystem.deleteAsync(resolved, { idempotent: true });
    }
  } catch (error) {
    console.warn(`Failed to delete image file at "${resolved}":`, error);
  }
}
