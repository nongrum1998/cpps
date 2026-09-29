import React from 'react';
import { View, ScrollView } from 'react-native';
import { Skeleton } from '@components/ui/skeleton';
import { Container } from '@components/layout/container';
import { SectionHeaderSkeleton } from '@components/skeleton';

/**
 * Skeleton placeholder that mimics a single form input field
 * in the edit tax form.
 *
 * Layout:
 * - Label text line
 * - Input box (full width rounded rectangle)
 *
 * The absence of horizontal padding matches the bare `FieldInput`
 * components used in the actual edit screen.
 */
const FormFieldSkeleton = () => (
  <View className="mb-4">
    <Skeleton className="mb-2 h-3 w-32 rounded" />
    <Skeleton className="h-12 w-full rounded-lg" />
  </View>
);

/**
 * Skeleton placeholder that mimics the Tax Regime section in the
 * edit form.
 *
 * Layout:
 * - "Tax Regime" section title
 * - Description text
 * - Two regime buttons (New Regime / Old Regime)
 */
const RegimeSelectorSkeleton = () => (
  <View className="mb-6">
    <Skeleton className="mb-2 h-4 w-24 rounded" />
    <Skeleton className="mb-3 h-3 w-64 rounded" />
    <View className="flex-row gap-3">
      <Skeleton className="h-12 flex-1 rounded-lg" />
      <Skeleton className="h-12 flex-1 rounded-lg" />
    </View>
  </View>
);

/**
 * Skeleton placeholder that mimics the Deductions section in the
 * edit form.
 *
 * Layout:
 * - "Deductions (Old Regime)" section title
 * - Description text
 * - 6 form field skeletons (80C, 80D, HRA, LTA, Home Loan, NPS)
 */
const DeductionsCardSkeleton = () => (
  <View className="mb-6">
    <Skeleton className="mb-2 h-4 w-44 rounded" />
    <Skeleton className="mb-4 h-3 w-64 rounded" />
    {Array.from({ length: 6 }).map((_, i) => (
      <FormFieldSkeleton key={i} />
    ))}
  </View>
);

/**
 * Skeleton loading state for the edit tax detail screen.
 *
 * Renders skeleton placeholders that mirror the form layout:
 * Tax Regime selector → Deductions section with 6 fields → Save button.
 * Replaces the generic `LoadingScreen` while tax data is being fetched.
 *
 * @example
 * ```tsx
 * <EditTaxSkeleton />
 * ```
 */
export const EditTaxSkeleton = () => (
  <Container className="flex-1">
    <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
      <SectionHeaderSkeleton />
      <RegimeSelectorSkeleton />
      <SectionHeaderSkeleton />
      <DeductionsCardSkeleton />
      <Skeleton className="mb-10 h-12 w-full rounded-lg" />
    </ScrollView>
  </Container>
);
