import { useEffect, useState } from 'react';
import { onlineManager } from '@tanstack/react-query';

/**
 * Tracks the device's online/offline status by subscribing to React Query's
 * global `onlineManager`.
 *
 * Returns a reactive `isOnline` boolean that updates when connectivity changes.
 * The `onlineManager` itself is kept in sync with the device by
 * `setupOnlineManager()` (initialized in TQueryProvider).
 *
 * @returns {{ isOnline: boolean }} Current connectivity state.
 *
 * @example
 * ```tsx
 * const { isOnline } = useOnlineStatus();
 * if (!isOnline) return <OfflineIndicator />;
 * ```
 */
export function useOnlineStatus(): { isOnline: boolean } {
  const [isOnline, setIsOnline] = useState(onlineManager.isOnline());

  useEffect(() => {
    const unsubscribe = onlineManager.subscribe((online) => {
      setIsOnline(Boolean(online));
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return { isOnline };
}
