import React from 'react';
import { View } from 'react-native';
import { Skeleton } from '@components/ui/skeleton';
import { cn } from '@utils/helpers/cn';

interface SectionHeaderSkeletonProps {
  /** Whether to show an icon placeholder. Default false. */
  hasIcon?: boolean;
  /** Whether to show a subtitle placeholder. Default false. */
  hasSubtitle?: boolean;
  /** Width of the title skeleton line (e.g. 'w-48'). Default 'w-48'. */
  titleWidth?: string;
  /** Width of the subtitle skeleton line. Default 'w-36'. */
  subtitleWidth?: string;
  /** Additional classes for the outer container. */
  className?: string;
}

/**
 * Skeleton placeholder that mirrors the {@link SectionHeader} component layout.
 *
 * Renders the full section-header shape with:
 * - A left accent bar skeleton
 * - An optional icon placeholder (48×48 rounded container)
 * - A title skeleton line
 * - An optional subtitle skeleton line
 * - A bottom separator line
 *
 * Use this wherever SectionHeader is shown during loading states to provide
 * a seamless content-aware placeholder that prevents layout shift.
 *
 * @example
 * ```tsx
 * // Minimal — title only (e.g. "Staff Directory")
 * <SectionHeaderSkeleton />
 *
 * // With subtitle (e.g. greeting + user name)
 * <SectionHeaderSkeleton hasSubtitle />
 *
 * // With icon + subtitle + custom widths
 * <SectionHeaderSkeleton hasIcon hasSubtitle titleWidth="w-56" subtitleWidth="w-44" />
 * ```
 */
export const SectionHeaderSkeleton = ({
  hasIcon,
  hasSubtitle,
  titleWidth = 'w-48',
  subtitleWidth = 'w-36',
  className,
}: SectionHeaderSkeletonProps) => (
  <View className={cn('mb-7', className)}>
    <View className="flex-row items-center gap-x-4">
      {/* Left accent bar */}
      <Skeleton className="h-10 w-[3px] rounded-md" />

      {/* Icon */}
      {hasIcon && <Skeleton className="h-12 w-12 rounded-md" />}

      {/* Title + subtitle */}
      <View className="flex-1 gap-y-2">
        <Skeleton className={cn('h-7 rounded-md', titleWidth)} />
        {hasSubtitle && <Skeleton className={cn('h-4 rounded', subtitleWidth)} />}
      </View>
    </View>

    {/* Separator */}
    <View className="ml-[23px] mt-4 h-[2px] rounded-md bg-gray-100 dark:bg-gray-800" />
  </View>
);
