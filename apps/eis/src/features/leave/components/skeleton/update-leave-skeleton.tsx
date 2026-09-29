import React from 'react';
import { View, ScrollView } from 'react-native';
import { Skeleton } from '@components/ui/skeleton';
import { SectionHeaderSkeleton } from '@components/skeleton/section-header';
import { Container, KeyboardSafeView } from '@components/layout';

/**
 * Renders a single form field skeleton with a label placeholder above
 * an input-shaped block.
 */
const FieldSkeleton = ({ labelWidth = 20 }: { labelWidth?: number }) => (
  <View className="my-2 w-full gap-y-2">
    <View className="h-3" style={{ width: labelWidth }}>
      <Skeleton className="h-3 w-full rounded" />
    </View>
    <Skeleton className="h-11 w-full rounded" />
  </View>
);

/**
 * Skeleton loading state for the update leave form screen.
 *
 * Matches the layout of {@link UpdateLeaveScreen}:
 * section header → type dropdown → from/to dates (side-by-side) →
 * number of days → order number → order date → reason dropdown →
 * remarks → submit button.
 *
 * @example
 * ```tsx
 * <UpdateLeaveSkeleton />
 * ```
 */
export const UpdateLeaveSkeleton = () => (
  <Container className="flex-1">
    <KeyboardSafeView className="flex-1">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        className="px-4">
        <View className="mt-4">
          <SectionHeaderSkeleton hasSubtitle titleWidth="w-36" subtitleWidth="w-56" />
        </View>

        {/* Form fields — gap-y-2 matches the FormProvider wrapper in UpdateLeaveScreen */}
        <View className="w-full gap-y-2">
          {/* Leave Type dropdown */}
          <FieldSkeleton labelWidth={16} />

          {/* From Date + To Date — side by side */}
          <View className="flex-row gap-x-3">
            <View className="flex-1">
              <View className="my-2 w-full gap-y-2">
                <Skeleton className="h-3 w-16 rounded" />
                <Skeleton className="h-11 w-full rounded" />
              </View>
            </View>
            <View className="flex-1">
              <View className="my-2 w-full gap-y-2">
                <Skeleton className="h-3 w-12 rounded" />
                <Skeleton className="h-11 w-full rounded" />
              </View>
            </View>
          </View>

          {/* Number of Days */}
          <FieldSkeleton labelWidth={24} />

          {/* Order Number */}
          <FieldSkeleton labelWidth={20} />

          {/* Order Date */}
          <FieldSkeleton labelWidth={16} />

          {/* Reason dropdown */}
          <FieldSkeleton labelWidth={14} />

          {/* Remarks (multiline) */}
          <View className="my-2 w-full gap-y-2">
            <Skeleton className="h-3 w-14 rounded" />
            <Skeleton className="h-24 w-full rounded" />
          </View>

          {/* Spacer before button — matches UpdateLeaveScreen spacing */}
          <View className="h-4" />

          {/* Submit Button — h-11 matches Button default size */}
          <Skeleton className="h-11 w-full rounded" />

          {/* Bottom Spacer — matches UpdateLeaveScreen spacing */}
          <View className="h-8" />
        </View>
      </ScrollView>
    </KeyboardSafeView>
  </Container>
);
