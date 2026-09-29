import React from 'react';
import { View, ScrollView } from 'react-native';
import { Container } from '@components/layout/container';
import { Skeleton } from '@components/ui/skeleton';

/**
 * Skeleton placeholder that mimics a single {@link AnnouncementCard}.
 *
 * Renders a card with an unread dot skeleton, title line, two description
 * lines, a divider, and a footer with date + priority badge placeholders.
 */
export const AnnouncementCardSkeleton = () => (
  <View className="mb-4 rounded-lg border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
    {/* Unread dot */}
    <View className="mb-3">
      <Skeleton className="h-2 w-2 rounded-md" />
    </View>

    {/* Title */}
    <Skeleton className="mb-2 h-5 w-3/4 rounded-md" />
    {/* Description line 1 */}
    <Skeleton className="mb-1 h-4 w-full rounded" />
    {/* Description line 2 */}
    <Skeleton className="mb-3 h-4 w-2/3 rounded" />

    {/* Divider */}
    <View className="h-px bg-gray-50 dark:bg-gray-800" />

    {/* Footer: date + priority */}
    <View className="flex-row items-center justify-between pt-3">
      <Skeleton className="h-3 w-24 rounded" />
      <Skeleton className="h-4 w-14 rounded-md" />
    </View>
  </View>
);

/**
 * Full-page skeleton loading state for the announcement board screen.
 *
 * Mirrors the layout of {@link AnnouncementBoardScreen} with shimmer
 * placeholders for multiple announcement cards in a scrollable list.
 *
 * Replace the generic loading check in `announcement-board-screen.tsx`
 * with this component to provide a content-aware loading experience.
 *
 * @example
 * ```tsx
 * // In announcement-board-screen.tsx:
 * if (isLoading) return <AnnouncementBoardSkeleton />;
 * ```
 */
export const AnnouncementBoardSkeleton = () => (
  <Container className="flex-1">
    <ScrollView showsVerticalScrollIndicator={false}>
      <AnnouncementCardSkeleton />
      <AnnouncementCardSkeleton />
      <AnnouncementCardSkeleton />
      <AnnouncementCardSkeleton />
    </ScrollView>
  </Container>
);
