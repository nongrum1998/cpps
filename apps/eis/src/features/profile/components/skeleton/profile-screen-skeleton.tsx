import React from 'react';
import { ScrollView, View } from 'react-native';
import { Container } from '@components/layout/container';
import { Card } from '@components/ui/card';
import { Skeleton } from '@components/ui/skeleton';

/**
 * Skeleton placeholder that mimics the identity section in {@link ProfileScreen}.
 *
 * Layout:
 * - Avatar circle (96×96)
 * - Full name (large text)
 * - Designation + department subtitle
 * - Two badges side by side (emp code + status)
 */
const IdentitySectionSkeleton = () => (
  <View className="mb-8 flex-col items-center gap-y-3">
    {/* Avatar circle */}
    <Skeleton className="h-24 w-24 rounded-full" />
    {/* Name */}
    <Skeleton className="h-7 w-44 rounded-md" />
    {/* Designation • Department */}
    <Skeleton className="h-5 w-56 rounded" />
    {/* Badges row */}
    <View className="flex-row gap-2">
      <Skeleton className="h-7 w-24 rounded-md" />
      <Skeleton className="h-7 w-20 rounded-md" />
    </View>
  </View>
);

/**
 * Skeleton placeholder that mimics a single {@link SectionCard} with
 * a blue left-border accent, icon header, and detail item rows.
 *
 * @param props.rowCount - Number of detail item pairs (default 3)
 */
const SectionCardSkeleton = ({ rowCount = 3 }: { rowCount?: number }) => (
  <Card
    variant="bordered"
    className="mb-4 overflow-hidden rounded-md border-l-2 border-l-primary p-4">
    {/* Header: icon + title */}
    <View className="mb-4 flex-row items-center">
      <Skeleton className="mr-3 h-5 w-5 rounded" />
      <Skeleton className="h-5 w-36 rounded" />
    </View>
    {/* Detail item rows in flex-wrap grid */}
    <View className="flex-row flex-wrap justify-between gap-y-4">
      {Array.from({ length: rowCount }).map((_, i) => (
        <View key={i} className="w-[48%] flex-col gap-y-1">
          <Skeleton className="h-3 w-16 rounded" />
          <Skeleton className="h-5 w-28 rounded" />
        </View>
      ))}
    </View>
  </Card>
);

/**
 * Skeleton placeholder that mimics the Employment Details section which has
 * more items plus sub-sections (Pay Information, DDO/Treasury).
 */
const EmploymentSectionSkeleton = () => (
  <Card
    variant="bordered"
    className="mb-4 overflow-hidden rounded-md border-l-2 border-l-primary p-4">
    {/* Header: icon + title */}
    <View className="mb-4 flex-row items-center">
      <Skeleton className="mr-3 h-5 w-5 rounded" />
      <Skeleton className="h-5 w-44 rounded" />
    </View>
    {/* Main detail items */}
    <View className="flex-row flex-wrap justify-between gap-y-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <View key={i} className="w-[48%] flex-col gap-y-1">
          <Skeleton className="h-3 w-16 rounded" />
          <Skeleton className="h-5 w-28 rounded" />
        </View>
      ))}
    </View>
    {/* Pay Information divider + items */}
    <View className="my-3 w-full border-t border-border" />
    <Skeleton className="mb-2 h-4 w-28 rounded" />
    <View className="mb-2 flex-row gap-x-4 gap-y-2">
      <Skeleton className="h-5 w-24 rounded" />
      <Skeleton className="h-5 w-24 rounded" />
      <Skeleton className="h-5 w-20 rounded" />
    </View>
    {/* DDO/Treasury sub-section */}
    <View className="my-3 w-full border-t border-border" />
    <Skeleton className="h-5 w-full rounded" />
  </Card>
);

/**
 * Skeleton placeholder that mimics the Bank & PF Details section.
 */
const BankSectionSkeleton = () => (
  <Card
    variant="bordered"
    className="mb-4 overflow-hidden rounded-md border-l-2 border-l-primary p-4">
    {/* Header: icon + title */}
    <View className="mb-4 flex-row items-center">
      <Skeleton className="mr-3 h-5 w-5 rounded" />
      <Skeleton className="h-5 w-32 rounded" />
    </View>
    {/* Bank items */}
    <View className="flex-row flex-wrap justify-between gap-y-4">
      <View className="w-full flex-col gap-y-1">
        <Skeleton className="h-3 w-16 rounded" />
        <Skeleton className="h-5 w-36 rounded" />
      </View>
      <View className="w-[48%] flex-col gap-y-1">
        <Skeleton className="h-3 w-20 rounded" />
        <Skeleton className="h-5 w-32 rounded" />
      </View>
      <View className="w-[48%] flex-col gap-y-1">
        <Skeleton className="h-3 w-16 rounded" />
        <Skeleton className="h-5 w-24 rounded" />
      </View>
    </View>
    {/* PF divider */}
    <View className="my-3 w-full border-t border-border" />
    <Skeleton className="mb-2 h-4 w-24 rounded" />
    <View className="flex-row flex-wrap justify-between gap-y-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <View key={i} className="w-[48%] flex-col gap-y-1">
          <Skeleton className="h-3 w-16 rounded" />
          <Skeleton className="h-5 w-28 rounded" />
        </View>
      ))}
    </View>
    {/* GIS divider */}
    <View className="my-3 w-full border-t border-border" />
    <Skeleton className="mb-2 h-4 w-24 rounded" />
    <View className="flex-row flex-wrap justify-between gap-y-4">
      <View className="w-[48%] flex-col gap-y-1">
        <Skeleton className="h-3 w-20 rounded" />
        <Skeleton className="h-5 w-24 rounded" />
      </View>
      <View className="w-[48%] flex-col gap-y-1">
        <Skeleton className="h-3 w-28 rounded" />
        <Skeleton className="h-5 w-20 rounded" />
      </View>
    </View>
  </Card>
);

/**
 * Skeleton placeholder that mimics the Logout button + footer in
 * {@link ProfileScreen}.
 */
const FooterSkeleton = () => (
  <View className="mb-4 mt-8 gap-y-4">
    {/* Logout button */}
    <Skeleton className="h-12 w-full rounded-md" />
    {/* Footer text */}
    <View className="items-center pb-8 opacity-60">
      <Skeleton className="h-3 w-52 rounded" />
    </View>
  </View>
);

/**
 * Skeleton loading state for the profile screen.
 *
 * Mirrors the modern card-based layout of {@link ProfileScreen} with shimmer
 * placeholders for:
 * - Identity section (avatar, name, designation, badges)
 * - Personal Details section card
 * - Contact Details section card
 * - Employment Details section card (with Pay Info + DDO sub-sections)
 * - Bank & PF Details section card (with PF Info + GIS Info sub-sections)
 * - Identification section card
 * - Logout button + footer
 *
 * @example
 * ```tsx
 * const { data: profile, isLoading } = useProfile();
 * if (isLoading) return <ProfileScreenSkeleton />;
 * ```
 */
export const ProfileScreenSkeleton = () => (
  <Container className="flex-1">
    <ScrollView
      className="flex-1 pt-6"
      contentContainerStyle={{ paddingBottom: 60 }}
      showsVerticalScrollIndicator={false}>
      <IdentitySectionSkeleton />
      <SectionCardSkeleton rowCount={6} />
      <SectionCardSkeleton rowCount={3} />
      <EmploymentSectionSkeleton />
      <BankSectionSkeleton />
      <SectionCardSkeleton rowCount={4} />
      <FooterSkeleton />
    </ScrollView>
  </Container>
);
