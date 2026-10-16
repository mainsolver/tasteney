import * as Crypto from 'expo-crypto';

const UUID_V4_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Generates an RFC 4122 version 4 UUID.
 */
export function generateUuid(): string {
  if (typeof Crypto.randomUUID === 'function') {
    return Crypto.randomUUID();
  }
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  // Fallback generator in case crypto APIs are unavailable
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Validates if a string matches the standard UUID format.
 */
export function isValidUuid(id: string | null | undefined): boolean {
  if (!id || typeof id !== 'string') {
    return false;
  }
  return UUID_V4_REGEX.test(id.trim());
}
