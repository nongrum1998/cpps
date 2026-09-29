import React from 'react';
import { View, ScrollView } from 'react-native';
import { Skeleton } from '@components/ui/skeleton';
import { Container } from '@components/layout/container';
import { SectionHeaderSkeleton } from '@components/skeleton';

/**
 * Skeleton placeholder that mimics the Tax Regime selector card in the
 * create form.
 *
 * Layout:
 * - "Tax Regime" section title
 * - Two regime buttons (New Regime / Old Regime)
 */
const RegimeSelectorSkeleton = () => (
  <View className="mb-6 border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
    <Skeleton className="mb-4 h-4 w-24 rounded" />
    <View className="flex-row gap-3">
      <Skeleton className="h-12 flex-1 rounded-lg" />
      <Skeleton className="h-12 flex-1 rounded-lg" />
    </View>
  </View>
);

/**
 * Skeleton placeholder that mimics a single form input field.
 *
 * Layout:
 * - Label text line
 * - Input box (full width rounded rectangle)
 */
const FormFieldSkeleton = () => (
  <View className="mb-4">
    <Skeleton className="mb-2 h-3 w-32 rounded" />
    <Skeleton className="h-12 w-full rounded-lg" />
  </View>
);

/**
 * Skeleton placeholder that mimics the Deductions card in the create form.
 *
 * Layout:
 * - "Deductions" section title
 * - 6 form field skeletons (80C, 80D, HRA, LTA, Home Loan, NPS)
 */
const DeductionsCardSkeleton = () => (
  <View className="mb-6 rounded-lg border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
    <Skeleton className="mb-4 h-4 w-24 rounded" />
    {Array.from({ length: 6 }).map((_, i) => (
      <FormFieldSkeleton key={i} />
    ))}
  </View>
);

/**
 * Skeleton loading state for the create tax record screen.
 *
 * Renders skeleton placeholders that mirror the form layout:
 * Tax Regime selector → Deductions card with 6 fields → Create button.
 *
 * @example
 * ```tsx
 * <CreateTaxSkeleton />
 * ```
 */
export const CreateTaxSkeleton = () => (
  <Container className="flex-1">
    <SectionHeaderSkeleton />
    <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
      <RegimeSelectorSkeleton />
      <DeductionsCardSkeleton />
      <Skeleton className="mb-10 h-12 w-full rounded-lg" />
    </ScrollView>
  </Container>
);
