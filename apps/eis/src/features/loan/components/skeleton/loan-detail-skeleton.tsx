import React from 'react';
import { View } from 'react-native';
import { Skeleton } from '@components/ui/skeleton';
import { Container } from '@components/layout/container';

/**
 * Skeleton placeholder that mimics the recovery status banner atop the
 * {@link LoanDetailScreen}.
 */
const StatusBannerSkeleton = () => (
  <View className="mb-6 w-full flex-row items-center justify-center gap-2 rounded-md border p-4">
    <Skeleton className="h-4 w-24 rounded" />
  </View>
);

/**
 * Skeleton placeholder that mimics the primary-colored loan header card.
 */
const LoanHeaderSkeleton = () => (
  <View className="rounded-t-md bg-primary p-4">
    <View className="gap-y-2">
      <Skeleton className="h-3 w-32 rounded" />
      <Skeleton className="h-5 w-48 rounded" />
      <Skeleton className="h-3 w-28 rounded" />
    </View>
  </View>
);

/**
 * Skeleton placeholder that mimics the loan summary card (disbursed amount,
 * recovery of, recovery status rows).
 */
const SummaryCardSkeleton = () => (
  <View className="mb-6 flex-col overflow-hidden rounded-b-md border border-border bg-white p-4">
    <View className="gap-y-3 pt-2">
      <View className="flex-row justify-between">
        <Skeleton className="h-3 w-28 rounded" />
        <Skeleton className="h-4 w-20 rounded" />
      </View>
      <View className="flex-row justify-between">
        <Skeleton className="h-3 w-24 rounded" />
        <Skeleton className="h-4 w-24 rounded" />
      </View>
      <View className="flex-row justify-between">
        <Skeleton className="h-3 w-28 rounded" />
        <Skeleton className="h-4 w-16 rounded" />
      </View>
    </View>
  </View>
);

/**
 * Skeleton placeholder that mimics the Interest & Recovery details card.
 */
const InterestCardSkeleton = () => (
  <View className="mb-6 flex-col rounded-md border border-border p-5">
    <Skeleton className="mb-4 h-3 w-32 rounded" />
    <View className="gap-y-3">
      <View className="flex-row justify-between">
        <Skeleton className="h-3 w-28 rounded" />
        <Skeleton className="h-4 w-20 rounded" />
      </View>
      <View className="flex-row justify-between">
        <Skeleton className="h-3 w-32 rounded" />
        <Skeleton className="h-4 w-20 rounded" />
      </View>
      <View className="flex-row justify-between">
        <Skeleton className="h-3 w-36 rounded" />
        <Skeleton className="h-4 w-20 rounded" />
      </View>
    </View>
  </View>
);

/**
 * Skeleton loading state for the loan detail screen. Mirrors {@link LoanDetailScreen}:
 * status banner → primary header card → loan summary → interest & recovery.
 */
export const LoanDetailSkeleton = () => (
  <Container className="flex-1">
    <View className="flex-1">
      <StatusBannerSkeleton />
      <LoanHeaderSkeleton />
      <SummaryCardSkeleton />
      <InterestCardSkeleton />
    </View>
  </Container>
);
