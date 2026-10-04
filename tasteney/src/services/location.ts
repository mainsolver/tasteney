import * as Location from 'expo-location';
import type { ImagePickerAsset } from 'expo-image-picker';

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface ResolvedLocation {
  country?: string;
  city?: string;
}

/**
 * Converts DMS (Degrees, Minutes, Seconds) coordinate representation to Decimal Degrees.
 */
function parseDmsCoordinate(dms: any): number | null {
  if (typeof dms === 'number' && !isNaN(dms)) {
    return dms;
  }

  if (Array.isArray(dms) && dms.length >= 1) {
    const deg = typeof dms[0] === 'number' ? dms[0] : parseFloat(dms[0]);
    const min = typeof dms[1] === 'number' ? dms[1] : parseFloat(dms[1] || '0');
    const sec = typeof dms[2] === 'number' ? dms[2] : parseFloat(dms[2] || '0');
    if (!isNaN(deg)) {
      return deg + (isNaN(min) ? 0 : min / 60) + (isNaN(sec) ? 0 : sec / 3600);
    }
  }

  if (typeof dms === 'string') {
    const parsed = parseFloat(dms);
    if (!isNaN(parsed)) {
      return parsed;
    }
  }

  return null;
}

/**
 * Extracts GPS latitude and longitude from EXIF metadata.
 * Handles iOS, Android, nested {GPS} tags, and DMS array formats.
 */
export function extractCoordinatesFromExif(exif?: Record<string, any> | null): Coordinates | null {
  if (!exif || typeof exif !== 'object') {
    return null;
  }

  // Check nested GPS dictionary if present (e.g., iOS native EXIF "{GPS}" or "GPS")
  const gpsObj = exif['{GPS}'] || exif.GPS || exif;

  const rawLat = gpsObj.GPSLatitude ?? gpsObj.Latitude ?? exif.GPSLatitude ?? exif.Latitude;
  const rawLng = gpsObj.GPSLongitude ?? gpsObj.Longitude ?? exif.GPSLongitude ?? exif.Longitude;

  if (rawLat === undefined || rawLat === null || rawLng === undefined || rawLng === null) {
    return null;
  }

  let lat = parseDmsCoordinate(rawLat);
  let lng = parseDmsCoordinate(rawLng);

  if (lat === null || lng === null) {
    return null;
  }

  const latRef = (gpsObj.GPSLatitudeRef ?? gpsObj.LatitudeRef ?? exif.GPSLatitudeRef ?? exif.LatitudeRef ?? '').toString().toUpperCase();
  const lngRef = (gpsObj.GPSLongitudeRef ?? gpsObj.LongitudeRef ?? exif.GPSLongitudeRef ?? exif.LongitudeRef ?? '').toString().toUpperCase();

  if (latRef === 'S' && lat > 0) {
    lat = -lat;
  }
  if (lngRef === 'W' && lng > 0) {
    lng = -lng;
  }

  // Sanity check coordinates validity range
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    return null;
  }

  return { latitude: lat, longitude: lng };
}

/**
 * Reverse geocodes coordinates to a country and city using expo-location.
 */
export async function resolveLocationFromCoordinates(coords: Coordinates): Promise<ResolvedLocation | null> {
  try {
    const addresses = await Location.reverseGeocodeAsync({
      latitude: coords.latitude,
      longitude: coords.longitude,
    });

    if (!addresses || addresses.length === 0) {
      return null;
    }

    const primary = addresses[0];
    const country = primary.country || undefined;
    const city = primary.city || primary.subregion || primary.region || primary.district || undefined;

    if (!country && !city) {
      return null;
    }

    return { country, city };
  } catch {
    // Fail gracefully on network errors or platform issues
    return null;
  }
}

/**
 * Requests foreground location permissions if not already granted.
 */
export async function requestLocationPermissions(): Promise<boolean> {
  try {
    const { status: existingStatus } = await Location.getForegroundPermissionsAsync();
    if (existingStatus === 'granted') {
      return true;
    }
    const { status } = await Location.requestForegroundPermissionsAsync();
    return status === 'granted';
  } catch (err) {
    console.error('Failed to request location permissions:', err);
    return false;
  }
}

/**
 * Retrieves the current device location and reverse-geocodes it to country and city.
 * Returns null if permissions are denied or if location resolution fails.
 */
export async function getCurrentDeviceLocation(): Promise<ResolvedLocation | null> {
  try {
    const hasPermission = await requestLocationPermissions();
    if (!hasPermission) {
      return null;
    }

    const position = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    if (!position || !position.coords) {
      return null;
    }

    return resolveLocationFromCoordinates({
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
    });
  } catch (err) {
    console.error('Failed to get current device location:', err);
    return null;
  }
}

/**
 * Extracts coordinates from an ImagePickerAsset and reverse-geocodes to country and city.
 */
export async function resolveLocationFromAsset(asset: ImagePickerAsset): Promise<ResolvedLocation | null> {
  if (!asset || !asset.exif) {
    return null;
  }

  const coords = extractCoordinatesFromExif(asset.exif);
  if (!coords) {
    return null;
  }

  return resolveLocationFromCoordinates(coords);
}
