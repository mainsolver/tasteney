import { useEffect, useRef } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import { pingConnection } from '@/services/network';

const CONNECTION_POLL_INTERVAL_MS = 30_000;

/**
 * Periodically connects to the backend test endpoint (https://api.tasteney.com/api/v1/connection)
 * every 30 seconds while the application is running.
 */
export function useConnectionPolling(): void {
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);

  useEffect(() => {
    // Initial ping on mount
    pingConnection().catch(() => {});

    // Periodic ping every 30 seconds while running
    const intervalId = setInterval(() => {
      if (appStateRef.current === 'active') {
        pingConnection().catch(() => {});
      }
    }, CONNECTION_POLL_INTERVAL_MS);

    // Re-check when app returns to foreground
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (appStateRef.current.match(/inactive|background/) && nextAppState === 'active') {
        pingConnection().catch(() => {});
      }
      appStateRef.current = nextAppState;
    });

    return () => {
      clearInterval(intervalId);
      subscription.remove();
    };
  }, []);
}
