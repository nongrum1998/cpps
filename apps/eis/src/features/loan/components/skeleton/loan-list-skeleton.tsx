import React from 'react';
import { FlatList, View } from 'react-native';
import { Skeleton } from '@components/ui/skeleton';
import { SectionHeaderSkeleton } from '@components/skeleton/section-header';
import { Container } from '@components/layout/container';

/**
 * Placeholder that mimics the {@link LoanCard} row layout while the loan
 * list is loading.
 */
const LoanCardSkeleton = () => (
  <View className="mb-4 rounded-md border border-border bg-white p-4 shadow-sm dark:border-border dark:bg-gray-900">
    <View className="mb-2 flex-row items-start justify-between">
      <View className="flex-1 gap-y-1.5 pr-2">
        <Skeleton className="h-5 w-40 rounded-md" />
        <Skeleton className="h-3 w-28 rounded" />
      </View>
      <Skeleton className="h-6 w-16 rounded-md" />
    </View>
    <View className="my-2 h-[1px] bg-gray-100 dark:bg-gray-800" />
    <View className="mt-1 flex-row items-center justify-between">
      <Skeleton className="h-4 w-24 rounded" />
      <Skeleton className="h-4 w-20 rounded" />
    </View>
  </View>
);

interface LoanListSkeletonProps {
  /** Number of skeleton cards to render. Defaults to 10. */
  count?: number;
}

/**
 * Skeleton loading state for the loan list screen. Renders a `Container` with
 * a `SectionHeader` placeholder and `count` skeleton cards mirroring `LoanCard`.
 */
export const LoanListSkeleton = ({ count = 10 }: LoanListSkeletonProps) => (
  <Container className="flex-1">
    <SectionHeaderSkeleton hasSubtitle titleWidth="w-32" subtitleWidth="w-48" />
    <FlatList
      contentContainerClassName="pb-20"
      data={Array.from({ length: count })}
      renderItem={() => <LoanCardSkeleton />}
    />
  </Container>
);
