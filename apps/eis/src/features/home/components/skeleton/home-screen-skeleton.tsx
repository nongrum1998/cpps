import React from 'react';
import { View, ScrollView } from 'react-native';
import { Container } from '@components/layout/container';
import { Skeleton } from '@components/ui/skeleton';

/**
 * Skeleton placeholder that mimics the welcome header in {@link HomeScreen}.
 *
 * Layout:
 * - Left: name (two lines) + dept line
 * - Right: initials square box
 */
const WelcomeHeaderSkeleton = () => (
  <View className="flex-1 flex-row items-center justify-between">
    <View className="flex-1 items-start justify-center gap-y-1.5">
      <Skeleton className="h-7 w-48 rounded-md" />
      <Skeleton className="h-4 w-32 rounded" />
    </View>
    <Skeleton className="h-16 w-16 rounded-md" />
  </View>
);

/**
 * Skeleton placeholder that mimics the active leave card in the
 * "Active Applications" section.
 *
 * Layout: leave description line, reason line, date range, status badge.
 */
const ActiveLeaveCardSkeleton = () => (
  <View className="mb-3 rounded-md border border-border bg-white p-4">
    <View className="flex-row justify-between">
      <View className="flex-1 gap-y-1.5">
        <Skeleton className="h-4 w-28 rounded" />
        <Skeleton className="h-5 w-40 rounded" />
        <View className="flex-row gap-x-2">
          <Skeleton className="h-4 w-28 rounded" />
        </View>
      </View>
      <Skeleton className="h-7 w-20 rounded-md" />
    </View>
  </View>
);

/**
 * Skeleton placeholder that mimics the 2×2 quick actions grid.
 *
 * Renders two rows of two action button skeletons each.
 */
const QuickActionsGridSkeleton = () => (
  <View className="flex-row flex-wrap justify-between">
    {Array.from({ length: 4 }).map((_, i) => (
      <Skeleton key={i} className="mb-4 h-28 w-[48%] rounded-md" />
    ))}
  </View>
);

/**
 * Skeleton placeholder that mimics the notification banner.
 */
const NotificationBannerSkeleton = () => (
  <View className="mt-6 flex-row items-start gap-x-3 rounded-md border border-border bg-white p-4">
    <Skeleton className="h-7 w-7 rounded" />
    <View className="flex-1 gap-y-1.5">
      <Skeleton className="h-4 w-40 rounded" />
      <Skeleton className="h-3 w-56 rounded" />
    </View>
  </View>
);

/**
 * Skeleton placeholder that mimics a single leave history row.
 *
 * Layout: leave description, reason, date range, status text.
 */
const LeaveHistoryRowSkeleton = () => (
  <View className="flex-row items-center justify-between border-b border-border py-4">
    <View className="gap-y-1.5">
      <Skeleton className="h-3 w-24 rounded" />
      <Skeleton className="h-5 w-36 rounded" />
      <Skeleton className="h-4 w-32 rounded" />
    </View>
    <Skeleton className="h-4 w-16 rounded" />
  </View>
);

/**
 * Full-page skeleton loading state for the home screen.
 *
 * Mirrors the layout of {@link HomeScreen} with shimmer placeholders for:
 * - Welcome header (name, dept, initials)
 * - "Active Applications" section title + leave card
 * - "Quick Actions" section title + 2×2 grid
 * - "Recent History" section title + "View All" link + three history rows
 *
 * @example
 * ```tsx
 * // In home-screen.tsx:
 * if (isLoading) return <HomeScreenSkeleton />;
 * ```
 */
export const HomeScreenSkeleton = () => (
  <Container className="flex-1">
    <ScrollView
      className="flex-1"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 40 }}>
      {/* Welcome Header */}
      <WelcomeHeaderSkeleton />

      {/* Notification banner */}
      <NotificationBannerSkeleton />

      {/* Active Applications section */}
      <Skeleton className="mb-3 mt-8 h-5 w-44 rounded" />
      <ActiveLeaveCardSkeleton />

      {/* Quick Actions section */}
      <Skeleton className="mb-3 mt-6 h-5 w-36 rounded" />
      <QuickActionsGridSkeleton />

      {/* Recent History section + "View All" link */}
      <View className="mt-4 flex-row items-center justify-between">
        <Skeleton className="h-5 w-36 rounded" />
        <Skeleton className="h-4 w-16 rounded" />
      </View>
      <View className="mt-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <LeaveHistoryRowSkeleton key={i} />
        ))}
      </View>
    </ScrollView>
  </Container>
);
