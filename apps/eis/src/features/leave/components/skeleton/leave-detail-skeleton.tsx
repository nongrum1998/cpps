import React from 'react';
import { View } from 'react-native';
import { Skeleton } from '@components/ui/skeleton';
import { Container } from '@components/layout/container';

/**
 * Skeleton placeholder that mimics the approval banner at the top of
 * {@link LeaveDetailScreen}.
 *
 * Layout: full-width banner with status icon + status text label.
 */
const ApprovalBannerSkeleton = () => (
  <View className="mb-6 w-full flex-row items-center justify-center gap-2 rounded-md border p-4">
    <Skeleton className="h-5 w-5 rounded" />
    <Skeleton className="h-4 w-24 rounded" />
  </View>
);

/**
 * Skeleton placeholder that mimics the primary-colored header card
 * with leave dates and day count badge.
 *
 * Layout:
 * - "Leave Dates" label + date range
 * - Day count badge (right-aligned)
 */
const LeaveDatesHeaderSkeleton = () => (
  <View className="rounded-t-md bg-primary p-3">
    <View className="flex-row items-center justify-between">
      <View className="gap-y-1.5">
        <Skeleton className="h-4 w-20 rounded" />
        <Skeleton className="h-5 w-40 rounded" />
      </View>
      <Skeleton className="h-7 w-20 rounded-md" />
    </View>
  </View>
);

/**
 * Skeleton placeholder that mimics the details card below the header.
 *
 * Layout:
 * - Order No. + Order Date (side by side)
 * - Type label + value (in a bordered box)
 * - Reason label + value
 */
const DetailsCardSkeleton = () => (
  <View className="flex-col overflow-hidden rounded-b-md border border-border bg-white p-4">
    {/* Order No. + Date */}
    <View className="flex-row justify-between pt-4">
      <View className="flex-1 flex-col gap-y-1 pr-2">
        <Skeleton className="h-3 w-14 rounded" />
        <Skeleton className="h-5 w-28 rounded" />
      </View>
      <View className="flex-1 flex-col gap-y-1">
        <Skeleton className="h-3 w-16 rounded" />
        <Skeleton className="h-5 w-24 rounded" />
      </View>
    </View>
    {/* Type */}
    <View className="flex-col gap-y-1.5 pt-4">
      <Skeleton className="h-3 w-10 rounded" />
      <Skeleton className="h-10 w-full rounded-md" />
    </View>
    {/* Reason */}
    <View className="flex-col gap-y-1 pt-4">
      <Skeleton className="h-3 w-12 rounded" />
      <Skeleton className="h-5 w-40 rounded" />
    </View>
  </View>
);

/**
 * Skeleton placeholder that mimics the Leave Balance section.
 *
 * Layout: "Leave Balance" section title with icon, then Opening/Closing
 * value cards side by side.
 */
const LeaveBalanceSectionSkeleton = () => (
  <View className="mb-6 flex-col">
    {/* Title */}
    <View className="mb-3 flex-row items-center gap-2">
      <Skeleton className="h-5 w-5 rounded" />
      <Skeleton className="h-5 w-32 rounded" />
    </View>
    {/* Side-by-side value cards */}
    <View className="flex-row flex-wrap justify-between gap-y-3">
      <View className="w-[48%] flex-col items-center gap-y-1 rounded-md border p-3">
        <Skeleton className="h-3 w-12 rounded" />
        <Skeleton className="h-6 w-8 rounded" />
      </View>
      <View className="w-[48%] flex-col items-center gap-y-1 rounded-md border p-3">
        <Skeleton className="h-3 w-12 rounded" />
        <Skeleton className="h-6 w-8 rounded" />
      </View>
    </View>
  </View>
);

/**
 * Skeleton placeholder that mimics the Verification section.
 *
 * Layout: "Verification" section title with icon, status row, divider, remarks.
 */
const VerificationSectionSkeleton = () => (
  <View className="mb-8 flex-col">
    {/* Title */}
    <View className="mb-3 flex-row items-center gap-2">
      <Skeleton className="h-5 w-5 rounded" />
      <Skeleton className="h-5 w-24 rounded" />
    </View>
    {/* Card */}
    <View className="flex-col gap-y-3 rounded-md border border-border p-4">
      {/* Status row */}
      <View className="flex-row items-center justify-between">
        <Skeleton className="h-4 w-12 rounded" />
        <View className="flex-row items-center gap-2">
          <Skeleton className="h-4 w-4 rounded" />
          <Skeleton className="h-4 w-20 rounded" />
        </View>
      </View>
      {/* Divider */}
      <View className="h-px w-full bg-border" />
      {/* Remarks */}
      <View className="flex-col gap-y-1">
        <Skeleton className="h-3 w-14 rounded" />
        <Skeleton className="h-4 w-40 rounded" />
      </View>
    </View>
  </View>
);

/**
 * Skeleton placeholder that mimics the action button at the bottom
 * (Download Order or Update Leave).
 */
const ActionButtonSkeleton = () => <Skeleton className="h-12 w-full rounded-md" />;

/**
 * Skeleton loading state for the leave detail screen.
 *
 * Mirrors the current layout of {@link LeaveDetailScreen}:
 * Approval banner → Primary-colored header card (leave dates + day count) →
 * Details card (order info, type, reason) → Leave Balance (opening/closing) →
 * Verification (status + remarks) → Action button.
 *
 * @example
 * ```tsx
 * if (isLoading || isFetching) return <LeaveDetailSkeleton />;
 * ```
 */
export const LeaveDetailSkeleton = () => (
  <Container className="flex-1">
    <View className="flex-1 px-0">
      <ApprovalBannerSkeleton />
      <LeaveDatesHeaderSkeleton />
      <DetailsCardSkeleton />
      <View className="mt-6">
        <LeaveBalanceSectionSkeleton />
      </View>
      <VerificationSectionSkeleton />
      <ActionButtonSkeleton />
    </View>
  </Container>
);
