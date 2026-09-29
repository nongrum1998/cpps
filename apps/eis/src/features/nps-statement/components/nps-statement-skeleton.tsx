import React from 'react';
import { View } from 'react-native';
import { Skeleton } from '@components/ui/skeleton';

/**
 * Skeleton placeholder for the member information card (9 rows).
 */
const MemberInfoSkeleton = () => (
  <View className="rounded-lg border border-border bg-card p-lg shadow-sm">
    <View className="flex-row flex-wrap gap-y-5">
      {Array.from({ length: 9 }).map((_, i) => (
        <View key={i} className="w-full flex-row items-start gap-sm">
          <Skeleton className="mt-0.5 h-10 w-10 rounded-md" />
          <View className="flex-1 gap-y-1.5">
            <Skeleton className="h-3 w-14 rounded" />
            <Skeleton className="h-4 w-36 rounded" />
          </View>
        </View>
      ))}
    </View>
  </View>
);

/**
 * Skeleton placeholder for the monthly contribution table (7 rows).
 */
const MonthlyTableSkeleton = () => (
  <View className="rounded-lg border border-border bg-card shadow-sm">
    <View className="gap-y-2 p-4">
      {Array.from({ length: 7 }).map((_, i) => (
        <Skeleton key={i} className="h-6 w-full rounded" />
      ))}
    </View>
  </View>
);

/**
 * Skeleton placeholder for the summary card (6 rows).
 */
const SummarySkeleton = () => (
  <View className="rounded-lg border border-border bg-card shadow-sm">
    <View className="gap-y-2 p-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-6 w-full rounded" />
      ))}
    </View>
  </View>
);

/**
 * Full-screen skeleton for the NPS statement loading state.
 *
 * Mirrors the loaded layout: member info card → monthly table → summary card.
 */
export const NpsStatementSkeleton = () => (
  <View className="gap-y-4">
    <MemberInfoSkeleton />
    <MonthlyTableSkeleton />
    <SummarySkeleton />
  </View>
);
