import React from 'react';
import { View } from 'react-native';
import { Card } from '@components/ui/card';
import { Skeleton } from '@components/ui/skeleton';

/**
 * Skeleton placeholder for the GPF Year Select Sheet at the top.
 *
 * Layout: a row with a label and a selectable pill.
 */
export const GPFYearSelectSkeleton = () => (
  <View className="mb-4">
    <Skeleton className="h-11 w-full rounded-md" />
  </View>
);

/**
 * Skeleton placeholder for the Employee Information card.
 *
 * Mirrors the 6-item icon+label flex-wrap layout:
 * Treasury, DDO, GPF Number, GPF Series, DOB, Interest Rate.
 * Each row: icon container + label column.
 */
const EmployeeInfoSkeleton = () => (
  <Card variant="elevated" className="p-lg">
    <View className="flex-row flex-wrap gap-y-5">
      {/* Treasury - full width */}
      <View className="w-full flex-row items-start gap-sm">
        <Skeleton className="mt-0.5 h-10 w-10 rounded-md" />
        <View className="flex-1 gap-y-1.5">
          <Skeleton className="h-3 w-14 rounded" />
          <Skeleton className="h-4 w-36 rounded" />
        </View>
      </View>
      {/* DDO - full width */}
      <View className="w-full flex-row items-start gap-sm">
        <Skeleton className="mt-0.5 h-10 w-10 rounded-md" />
        <View className="flex-1 gap-y-1.5">
          <Skeleton className="h-3 w-10 rounded" />
          <Skeleton className="h-4 w-32 rounded" />
        </View>
      </View>
      {/* GPF Number & Series - side by side */}
      <View className="w-1/2 flex-row items-start gap-sm pr-xs">
        <Skeleton className="mt-0.5 h-10 w-10 rounded-md" />
        <View className="flex-1 gap-y-1.5">
          <Skeleton className="h-3 w-16 rounded" />
          <Skeleton className="h-4 w-20 rounded" />
        </View>
      </View>
      <View className="w-1/2 flex-row items-start gap-sm pl-xs">
        <Skeleton className="mt-0.5 h-10 w-10 rounded-md" />
        <View className="flex-1 gap-y-1.5">
          <Skeleton className="h-3 w-16 rounded" />
          <Skeleton className="h-4 w-16 rounded" />
        </View>
      </View>
      {/* DOB & Interest Rate - side by side */}
      <View className="w-1/2 flex-row items-start gap-sm pr-xs">
        <Skeleton className="mt-0.5 h-10 w-10 rounded-md" />
        <View className="flex-1 gap-y-1.5">
          <Skeleton className="h-3 w-14 rounded" />
          <Skeleton className="h-4 w-24 rounded" />
        </View>
      </View>
      <View className="w-1/2 flex-row items-start gap-sm pl-xs">
        <Skeleton className="mt-0.5 h-10 w-10 rounded-md" />
        <View className="flex-1 gap-y-1.5">
          <Skeleton className="h-3 w-20 rounded" />
          <Skeleton className="h-4 w-12 rounded" />
        </View>
      </View>
    </View>
  </Card>
);

/**
 * Skeleton placeholder for the monthly contribution table.
 *
 * Layout: header row + 6 data rows.
 */
const MonthlyTableSkeleton = () => (
  <Card variant="elevated">
    <View className="gap-y-2 p-4">
      {Array.from({ length: 7 }).map((_, i) => (
        <Skeleton key={i} className="h-6 w-full rounded" />
      ))}
    </View>
  </Card>
);

/**
 * Skeleton placeholder for the summary vertical view.
 *
 * Layout: header row + 3 data rows.
 */
const SummaryTableSkeleton = () => (
  <Card variant="elevated">
    <View className="gap-y-2 p-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-6 w-full rounded" />
      ))}
    </View>
  </Card>
);

/**
 * Renders placeholder skeletons for the GPF statement screen while data is loading.
 *
 * Mirrors the current layout of {@link GPFStatementScreen}:
 * - GPF Year Select Sheet
 * - Employee info card (6 items in flex-wrap grid with themed icon backgrounds)
 * - Monthly contribution table
 * - Summary vertical view
 *
 * @example
 * ```tsx
 * // In gpf-statement-screens.tsx:
 * if (isLoading) return <GpfStatementSkeleton />;
 * ```
 */
export const GpfStatementSkeleton = () => (
  <View className="gap-y-4">
    <GPFYearSelectSkeleton />
    <EmployeeInfoSkeleton />
    <MonthlyTableSkeleton />
    <SummaryTableSkeleton />
  </View>
);
