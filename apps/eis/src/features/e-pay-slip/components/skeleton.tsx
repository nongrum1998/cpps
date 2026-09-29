import React from 'react';
import { View } from 'react-native';
import { Container } from '@components/layout';
import { Skeleton } from '@components/ui';
import { cn } from '@utils/helpers/cn';

/**
 * Loading skeleton for a single e-pay slip list card. Mirrors the layout
 * of {@link EPayslipListItemCard}: header row with date + action button,
 * divider, and a details grid.
 */
const EPaySlipCardSkeleton = () => (
  <View className="mb-4 rounded-md border border-border bg-white p-4">
    {/* Card header: date label + action button */}
    <View className="flex-row items-start justify-between">
      <View className="flex-col gap-1.5">
        <Skeleton className="h-3 w-20 rounded" />
        <Skeleton className="h-5 w-28 rounded" />
      </View>
      <Skeleton className="h-10 w-10 rounded-full" />
    </View>

    {/* Divider */}
    <View className="my-3 h-[1px] w-full bg-border/50" />

    {/* Details grid */}
    <View className="flex-row flex-wrap">
      <View className="mb-3 w-1/2">
        <Skeleton className="h-2.5 w-14 rounded" />
        <Skeleton className="mt-1 h-3.5 w-20 rounded" />
      </View>
      <View className="mb-3 w-1/2">
        <Skeleton className="w-18 h-2.5 rounded" />
        <Skeleton className="mt-1 h-3.5 w-24 rounded" />
      </View>
      <View className="w-full">
        <Skeleton className="h-2.5 w-16 rounded" />
        <Skeleton className="mt-1 h-3.5 w-36 rounded" />
      </View>
    </View>
  </View>
);

/**
 * Loading placeholder for the e-pay slip list screen: a title bar,
 * subtitle, and three skeleton cards matching the list item layout.
 */
export const EPaySlipListSkeleton = () => (
  <Container>
    <View className="pb-10">
      {/* Header text section */}
      <View className="mb-6">
        <Skeleton className="mb-1 h-7 w-32 rounded" />
        <Skeleton className="h-4 w-56 rounded" />
      </View>

      {/* Skeleton cards */}
      {Array.from({ length: 3 }).map((_, index) => (
        <EPaySlipCardSkeleton key={index} />
      ))}
    </View>
  </Container>
);

/**
 * Loading skeleton for the e-pay slip details screen: a title bar,
 * six detail rows, and the download button.
 */
export const EPaySlipDetailsSkeleton = () => (
  <Container className="gap-y-6 pt-6">
    <Skeleton className="h-6 w-40 rounded" />
    <View className="overflow-hidden rounded-md border border-border">
      {Array.from({ length: 6 }).map((_, index) => (
        <View
          key={index}
          className={cn(
            'flex-row items-center justify-between border-b border-border p-4',
            index === 5 && 'border-b-0'
          )}>
          <Skeleton className="h-3 w-24 rounded" />
          <Skeleton className="h-3 w-32 rounded" />
        </View>
      ))}
    </View>
    <Skeleton className="h-11 w-full rounded-md" />
  </Container>
);
