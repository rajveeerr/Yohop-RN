import * as Location from 'expo-location';
import { useCallback, useEffect, useState } from 'react';

const DEFAULT_LOCATION = {
  latitude: 33.749,
  longitude: -84.388,
  label: 'Atlanta, GA',
};

export type UserLocation = {
  latitude: number;
  longitude: number;
  label: string;
};

export type LocationPermission = 'undetermined' | 'granted' | 'denied';

export type UseLocationResult = {
  location: UserLocation;
  setLocation: (loc: UserLocation) => void;
  /** Re-request permission (if needed) and refresh the device location. */
  refresh: () => Promise<void>;
  loading: boolean;
  permission: LocationPermission;
};

async function labelFor(latitude: number, longitude: number): Promise<string> {
  try {
    const [place] = await Location.reverseGeocodeAsync({ latitude, longitude });
    if (place) {
      const parts = [place.city ?? place.subregion, place.region].filter(Boolean);
      if (parts.length) return parts.join(', ');
    }
  } catch {
    // Reverse geocoding is best-effort; fall through to the coordinate label.
  }
  return 'Current location';
}

/**
 * Resolves the user's real device location (foreground permission) and feeds it
 * to the home feed. Falls back to a default city if permission is denied or the
 * lookup fails, so the feed always has coordinates to query with.
 */
export function useLocation(): UseLocationResult {
  const [location, setLocation] = useState<UserLocation>(DEFAULT_LOCATION);
  const [loading, setLoading] = useState(false);
  const [permission, setPermission] = useState<LocationPermission>('undetermined');

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setPermission('denied');
        return;
      }
      setPermission('granted');
      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const { latitude, longitude } = pos.coords;
      const label = await labelFor(latitude, longitude);
      setLocation({ latitude, longitude, label });
    } catch {
      // Keep whatever location we already have (default or previous).
    } finally {
      setLoading(false);
    }
  }, []);

  // Resolve the device location once on mount.
  useEffect(() => {
    refresh();
  }, [refresh]);

  return { location, setLocation, refresh, loading, permission };
}

export { DEFAULT_LOCATION };
