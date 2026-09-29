import React from 'react';
import { View, ScrollView } from 'react-native';
import { Skeleton } from '@components/ui/skeleton';
import { Container } from '@components/layout/container';
import { GovtHeaderSkeleton } from '@components/skeleton/govt-header';

/**
 * Skeleton placeholder that mimics the {@link GovtHeader} component.
 *
 * Layout:
 * - Employee name (large title)
 * - Designation (subtitle)
 * - FY badge (right-aligned pill)
 */

/**
 * Skeleton placeholder that mimics the {@link SummaryCard} component.
 *
 * Layout:
 * - "Total Income Tax" label
 * - Large rupee amount
 */
const SummaryCardSkeleton = () => (
  <View className="mb-6 rounded-lg border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
    <Skeleton className="mb-2 h-3 w-32 rounded" />
    <Skeleton className="h-8 w-44 rounded-md" />
  </View>
);

/**
 * Skeleton placeholder that mimics a card with labeled rows (e.g., Employee
 * Particulars, Income Summary, Payment Summary).
 *
 * Layout:
 * - Section title
 * - `rowCount` detail rows (label + value pairs)
 */
const DetailCardSkeleton = ({
  titleWidth = 'w-36',
  rows = 4,
}: {
  titleWidth?: string;
  rows?: number;
}) => (
  <View className="mb-6 rounded-lg border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
    <Skeleton className={`mb-4 h-4 ${titleWidth} rounded`} />
    {Array.from({ length: rows }).map((_, i) => (
      <View key={i} className="mb-4 flex-row items-center justify-between">
        <Skeleton className="h-3 w-20 rounded" />
        <Skeleton className="h-4 w-32 rounded" />
      </View>
    ))}
  </View>
);

/**
 * Skeleton placeholder that mimics the Tax Computation section.
 *
 * Layout:
 * - Section title + regime badge (right-aligned)
 * - Slab table header (4 columns: Slab, Rate, Amount, Tax)
 * - 4 slab rows
 * - Bottom summary rows (base tax, rebate, surcharge, cess, total, effective rate)
 */
const TaxComputationSkeleton = () => (
  <View className="mb-6 rounded-lg border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
    <View className="mb-4 flex-row items-center justify-between">
      <Skeleton className="h-4 w-32 rounded" />
      <Skeleton className="h-6 w-24 rounded-md" />
    </View>

    {/* Slab table */}
    <View className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
      {/* Table header */}
      <View className="mb-2 flex-row border-b border-gray-200 pb-2 dark:border-gray-700">
        <Skeleton className="h-3 flex-[2] rounded" />
        <Skeleton className="ml-auto h-3 flex-1 rounded" />
        <Skeleton className="ml-auto h-3 flex-1 rounded" />
        <Skeleton className="ml-auto h-3 flex-1 rounded" />
      </View>
      {/* Slab rows */}
      {Array.from({ length: 4 }).map((_, i) => (
        <View key={i} className="flex-row border-b border-gray-100 py-2 dark:border-gray-700/50">
          <Skeleton className="h-3 flex-[2] rounded" />
          <Skeleton className="ml-auto h-3 flex-1 rounded" />
          <Skeleton className="ml-auto h-3 flex-1 rounded" />
          <Skeleton className="ml-auto h-3 flex-1 rounded" />
        </View>
      ))}
    </View>

    {/* Bottom summary rows */}
    <View className="mt-4 rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
      {Array.from({ length: 6 }).map((_, i) => (
        <View key={i} className="mb-3 flex-row items-center justify-between">
          <Skeleton className="h-3 w-36 rounded" />
          <Skeleton className="h-4 w-24 rounded" />
        </View>
      ))}
    </View>
  </View>
);

/**
 * Full-page skeleton loading state for the employee tax detail screen.
 *
 * Renders stacked skeleton cards that mirror the detail screen layout:
 * `GovtHeader` → `SummaryCard` → Employee Particulars → Income Summary →
 * Tax Computation → Deductions → Payment Summary → Edit button.
 *
 * @example
 * ```tsx
 * <TaxDetailSkeleton />
 * ```
 */
export const TaxDetailSkeleton = () => (
  <Container className="flex-1">
    <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
      {/* GovtHeader placeholder */}
      <GovtHeaderSkeleton />

      {/* SummaryCard placeholder */}
      <SummaryCardSkeleton />

      {/* Employee Particulars placeholder */}
      <DetailCardSkeleton titleWidth="w-36" rows={4} />

      {/* Income Summary placeholder */}
      <DetailCardSkeleton titleWidth="w-28" rows={3} />

      {/* Tax Computation placeholder */}
      <TaxComputationSkeleton />

      {/* Deductions Claimed placeholder (shown always during loading) */}
      <DetailCardSkeleton titleWidth="w-32" rows={6} />

      {/* Payment Summary placeholder */}
      <DetailCardSkeleton titleWidth="w-28" rows={4} />

      {/* Edit button placeholder */}
      <Skeleton className="mb-10 h-12 w-full rounded-lg" />
    </ScrollView>
  </Container>
);
