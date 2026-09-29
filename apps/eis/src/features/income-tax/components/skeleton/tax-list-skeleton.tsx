import React from 'react';
import { FlatList, View } from 'react-native';
import { Skeleton } from '@components/ui/skeleton';
import { SectionHeaderSkeleton } from '@components/skeleton/section-header';
import { Container } from '@components/layout/container';

/**
 * A single skeleton card that mimics the {@link TaxSummaryCard} layout
 * used in the income tax list screen.
 *
 * Renders placeholder blocks for:
 * - Employee name + designation (left) and filing status badge (right)
 * - PAN label/value (left) and Gross Income label/value (right)
 * - Regime indicator dot + label (left) and Tax amount (right)
 */
const TaxSummaryCardSkeleton = () => (
  <View className="mb-3 rounded-lg border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
    {/* Row 1: Name + Designation | Status badge */}
    <View className="mb-3 flex-row items-center justify-between">
      <View className="flex-1 gap-y-1.5">
        <Skeleton className="h-5 w-44 rounded-lg" />
        <Skeleton className="h-3 w-28 rounded" />
      </View>
      <Skeleton className="h-6 w-20 rounded-md" />
    </View>

    {/* Row 2: PAN | Gross Income */}
    <View className="mb-2 flex-row justify-between">
      <View className="gap-y-1">
        <Skeleton className="h-3 w-8 rounded" />
        <Skeleton className="h-4 w-28 rounded" />
      </View>
      <View className="items-end gap-y-1">
        <Skeleton className="h-3 w-20 rounded" />
        <Skeleton className="h-4 w-24 rounded" />
      </View>
    </View>

    {/* Row 3: Regime | Tax */}
    <View className="flex-row items-center justify-between">
      <View className="flex-row items-center gap-1">
        <Skeleton className="h-2 w-2 rounded-md" />
        <Skeleton className="h-3 w-20 rounded" />
      </View>
      <Skeleton className="h-4 w-24 rounded" />
    </View>
  </View>
);

interface TaxListSkeletonProps {
  /** Number of skeleton cards to render. Defaults to 6. */
  count?: number;
}

/**
 * Skeleton loading state for the income tax list screen.
 *
 * Renders a `Container` with a `SectionHeader` placeholder and `count`
 * skeleton cards that mirror the `TaxSummaryCard` layout. Replaces the
 * generic `LoadingScreen` while tax list data is being fetched.
 *
 * @example
 * ```tsx
 * <TaxListSkeleton count={5} />
 * ```
 */
export const TaxListSkeleton = ({ count = 6 }: TaxListSkeletonProps) => (
  <Container className="flex-1">
    <SectionHeaderSkeleton hasSubtitle titleWidth="w-32" subtitleWidth="w-44" />

    <FlatList
      contentContainerClassName="pb-20"
      data={Array.from({ length: count })}
      renderItem={() => <TaxSummaryCardSkeleton />}
    />
  </Container>
);
