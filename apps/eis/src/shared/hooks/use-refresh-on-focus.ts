import React from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useQueryClient, QueryKey } from '@tanstack/react-query';

type Props = { queryKey: QueryKey };

/**
 * Custom hook to refetch TanStack Query data when a screen gains focus.
 *
 * This hook leverages React Navigation's `useFocusEffect` to trigger a refetch
 * of specific queries whenever the user navigates back to the screen.
 * It purposefully skips the refetch on the initial mount to avoid redundant
 * network calls, as TanStack Query typically handles the first fetch.
 *
 * @param {Props} props - The hook properties.
 * @param {QueryKey} props.queryKey - The specific query key or key pattern to refetch.
 *
 * @example
 * ```tsx
 * useRefreshOnFocus({ queryKey: ['employees', id] });
 * ```
 */
export function useRefreshOnFocus({ queryKey }: Props = { queryKey: [''] }) {
  const queryClient = useQueryClient();
  const firstTimeRef = React.useRef(true);

  useFocusEffect(
    React.useCallback(() => {
      if (firstTimeRef.current) {
        firstTimeRef.current = false;
        return;
      }

      // Refetch all stale active queries matching the provided queryKey
      queryClient.refetchQueries({
        queryKey: queryKey,
        stale: true,
        type: 'active',
      });
    }, [queryClient, queryKey])
  );
}
