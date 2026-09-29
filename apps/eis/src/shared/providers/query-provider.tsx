import React, { useEffect } from 'react';
import { queryClient, setupFocusManager, setupOnlineManager } from '@utils/react-query';
import { QueryClientProvider } from '@tanstack/react-query';
import { logger } from '@utils/logger';

type Props = {
  children: React.ReactNode;
};

/**
 * AsyncStorage-based persister for the React Query cache.
 *
 * - Key: `@employee/query-cache`
 * - Throttle-writes at 1-second intervals to avoid excessive I/O.
 * - Data older than 24 hours is discarded on hydration.
 */

/**
 * Configures React Query app-wide.
 *
 * Wraps children in `PersistQueryClientProvider` so the query cache survives
 * app restarts. Also initializes the focus manager (auto-refetch on app resume)
 * and online manager (pause/resume on connectivity changes) in a one-time
 * `useEffect`.
 */
export const TQueryProvider = ({ children }: Props) => {
  useEffect(() => {
    const cleanups: (() => void)[] = [];

    try {
      const cleanupFocus = setupFocusManager();
      cleanups.push(cleanupFocus);
    } catch (error) {
      logger.error('Failed to setup focus manager', error);
    }

    try {
      const cleanupOnline = setupOnlineManager();
      cleanups.push(cleanupOnline);
    } catch (error) {
      logger.error('Failed to setup online manager', error);
    }

    return () => {
      cleanups.forEach((cleanup) => cleanup());
    };
  }, []);

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};
