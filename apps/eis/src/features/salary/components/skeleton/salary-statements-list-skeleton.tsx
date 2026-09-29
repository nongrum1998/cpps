import React from 'react';
import { View, ScrollView } from 'react-native';
import { Skeleton } from '@components/ui/skeleton';
import { Container } from '@components/layout/container';

/**
 * Skeleton placeholder that mimics the FilterCard (year/month selector)
 * at the top of the salary statements screen.
 *
 * Layout: header row (title + chevron), year tags row, month tags row.
 */
const FilterCardSkeleton = () => (
  <View className="mb-4 rounded-md border border-border">
    <View className="flex-row items-center justify-between rounded-t-md bg-gray-50/50 p-4 dark:bg-white/5">
      <Skeleton className="h-4 w-16 rounded" />
      <Skeleton className="h-5 w-5 rounded" />
    </View>
    <View className="px-4 pb-4 pt-2">
      <Skeleton className="mb-2 h-3 w-8 rounded" />
      <View className="flex-row gap-2">
        <Skeleton className="h-8 w-16 rounded-md" />
        <Skeleton className="h-8 w-16 rounded-md" />
        <Skeleton className="h-8 w-16 rounded-md" />
      </View>
      <Skeleton className="mb-2 mt-4 h-3 w-10 rounded" />
      <View className="flex-row gap-2">
        <Skeleton className="h-8 w-20 rounded-md" />
        <Skeleton className="h-8 w-24 rounded-md" />
        <Skeleton className="h-8 w-20 rounded-md" />
      </View>
    </View>
  </View>
);

/**
 * Skeleton placeholder that mimics the Net Payable summary card.
 *
 * Layout: "Take Home / Net Payable" label, large amount, in-words text,
 * PDF + Share buttons side by side.
 */
const NetPayableSummarySkeleton = () => (
  <View className="relative mb-6 flex-col items-center justify-center overflow-hidden rounded-md border border-border bg-white p-6">
    <Skeleton className="mb-3 h-3 w-44 rounded" />
    <Skeleton className="mb-2 h-10 w-36 rounded" />
    <Skeleton className="mb-4 h-3 w-52 rounded" />
    <View className="flex-row gap-x-4">
      <Skeleton className="h-11 w-24 rounded-md" />
      <Skeleton className="h-11 w-24 rounded-md" />
    </View>
  </View>
);

/**
 * Skeleton placeholder that mimics the Earnings section card.
 *
 * Layout: header (icon + "Earnings" title), item rows, total footer.
 */
const EarningsSectionSkeleton = () => (
  <View className="overflow-hidden rounded-md border border-border bg-white">
    <View className="flex-row items-center border-b border-border bg-gray-50 p-4">
      <Skeleton className="h-5 w-5 rounded" />
      <Skeleton className="ml-3 h-5 w-24 rounded" />
    </View>
    {Array.from({ length: 4 }).map((_, i) => (
      <View
        key={i}
        className="min-h-[44px] flex-row items-center justify-between border-b border-border px-4 py-3">
        <Skeleton className="h-4 w-36 rounded" />
        <Skeleton className="h-4 w-20 rounded" />
      </View>
    ))}
    <View className="flex-row items-center justify-between border-t border-emerald-100 bg-emerald-50 p-4">
      <Skeleton className="h-5 w-28 rounded" />
      <Skeleton className="h-6 w-24 rounded" />
    </View>
  </View>
);

/**
 * Skeleton placeholder that mimics the Deductions section card.
 *
 * Layout: header (icon + "Deductions" title), item rows, total footer.
 */
const DeductionsSectionSkeleton = () => (
  <View className="overflow-hidden rounded-md border border-border bg-white">
    <View className="flex-row items-center border-b border-border bg-gray-50 p-4">
      <Skeleton className="h-5 w-5 rounded" />
      <Skeleton className="ml-3 h-5 w-28 rounded" />
    </View>
    {Array.from({ length: 4 }).map((_, i) => (
      <View
        key={i}
        className="min-h-[44px] flex-row items-center justify-between border-b border-border px-4 py-3">
        <Skeleton className="h-4 w-36 rounded" />
        <Skeleton className="h-4 w-20 rounded" />
      </View>
    ))}
    <View className="flex-row items-center justify-between border-t border-destructive/10 bg-destructive/10 p-4">
      <Skeleton className="h-5 w-32 rounded" />
      <Skeleton className="h-6 w-24 rounded" />
    </View>
  </View>
);

/**
 * Skeleton placeholder that mimics the sticky bottom bar.
 *
 * Layout: "Net Payable" label + amount on left, Download PDF button on right.
 */
export const StickyBottomBarSkeleton = () => (
  <View className="flex-row items-center justify-between border-t border-border bg-white p-4">
    <View className="gap-y-0.5">
      <Skeleton className="h-3 w-16 rounded" />
      <Skeleton className="h-6 w-28 rounded" />
    </View>
    <Skeleton className="h-12 w-40 rounded-md" />
  </View>
);

/**
 * Skeleton loading state for the salary statements screen.
 *
 * Mirrors the current layout of {@link SalaryStatement}:
 * FilterCard (year/month) → Net Payable summary card →
 * Earnings section → Deductions section → Sticky bottom bar.
 *
 * @example
 * ```tsx
 * <SalaryStatementsListSkeleton />
 * ```
 */
export const SalaryStatementsListSkeleton = () => (
  <Container className="flex-1">
    <ScrollView
      className="flex-1 pt-2"
      contentContainerStyle={{ paddingBottom: 160 }}
      showsVerticalScrollIndicator={false}>
      <FilterCardSkeleton />
      <NetPayableSummarySkeleton />
      <View className="flex-col gap-y-6">
        <EarningsSectionSkeleton />
        <DeductionsSectionSkeleton />
      </View>
    </ScrollView>
  </Container>
);
