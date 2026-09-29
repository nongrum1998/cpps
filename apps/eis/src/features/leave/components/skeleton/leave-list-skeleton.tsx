import React from 'react';
import { FlatList, View } from 'react-native';
import { Skeleton } from '@components/ui/skeleton';
import { SectionHeaderSkeleton } from '@components/skeleton/section-header';
import { Container } from '@components/layout/container';

/**
 * A single skeleton card that mimics the {@link LeaveCard} layout.
 *
 * Renders placeholder blocks for:
 * - Leave type icon (rounded square)
 * - Leave description + applied date
 * - Status badge (rounded pill)
 * - Duration bar (from → to dates + day count)
 * - Reason line (optional-style box)
 */
const LeaveCardSkeleton = () => (
  <View className="mb-4 rounded-md border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
    {/* Row 1: Icon + Title + Badge */}
    <View className="mb-2 flex-row items-center justify-between">
      <View className="flex-row items-center gap-2">
        <Skeleton className="h-12 w-12 rounded-lg" />
        <View className="gap-y-1.5">
          <Skeleton className="h-5 w-40 rounded-md" />
          <Skeleton className="h-3 w-28 rounded" />
        </View>
      </View>
      <Skeleton className="h-6 w-20 rounded-md" />
    </View>

    {/* Divider */}
    <View className="my-2 h-[1px] bg-gray-100 dark:bg-gray-800" />

    {/* Row 2: Duration */}
    <View className="mt-1 gap-y-1.5">
      <Skeleton className="h-3 w-16 rounded" />
      <View className="flex-row items-center gap-2">
        <Skeleton className="h-4 w-28 rounded" />
        <Skeleton className="h-4 w-4 rounded" />
        <Skeleton className="h-4 w-28 rounded" />
      </View>
      <Skeleton className="h-4 w-14 rounded" />
    </View>

    {/* Row 3: Reason (always visible in skeleton) */}
    <View className="mt-3 rounded-lg bg-gray-50 p-2 dark:bg-gray-800/50">
      <Skeleton className="h-3 w-3/4 rounded" />
    </View>
  </View>
);

interface LeaveListSkeletonProps {
  /** Number of skeleton cards to render. Defaults to 4. */
  count?: number;
}

/**
 * Skeleton loading state for the leave list screen.
 *
 * Renders a `Container` with a `SectionHeader` placeholder and `count`
 * skeleton cards that mirror the `LeaveCard` layout. Replaces the generic
 * `LoadingScreen` when leave data is being fetched.
 *
 * @example
 * ```tsx
 * <LeaveListSkeleton count={5} />
 * ```
 */
export const LeaveListSkeleton = ({ count = 10 }: LeaveListSkeletonProps) => (
  <Container className="flex-1">
    <SectionHeaderSkeleton hasSubtitle titleWidth="w-32" subtitleWidth="w-48" />

    {/* Skeleton cards */}
    <FlatList
      contentContainerClassName="pb-20"
      data={Array.from({ length: count })}
      renderItem={() => <LeaveCardSkeleton />}
    />
  </Container>
);
