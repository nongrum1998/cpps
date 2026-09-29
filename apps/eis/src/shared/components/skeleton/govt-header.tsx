import { Skeleton } from '@components/ui/skeleton';
import { View } from 'react-native';
import { cn } from '@utils/helpers/cn';

interface GovtHeaderSkeletonProps {
  /** Whether to show a subtitle skeleton. Default false. */
  hasSubtitle?: boolean;
  /** Whether to show a badge skeleton. Default false. */
  hasBadge?: boolean;
  /** Width of the title skeleton (e.g. 'w-48'). Default 'w-56'. */
  titleWidth?: string;
  /** Width of the subtitle skeleton. Default 'w-40'. */
  subtitleWidth?: string;
  /** Width of the badge skeleton. Default 'w-24'. */
  badgeWidth?: string;
  /** Additional classes for the outer container. */
  className?: string;
}

/**
 * Skeleton placeholder that mimics the {@link GovtHeader} component layout.
 *
 * Renders a centered vertical stack with:
 * - An icon placeholder (64×64 rounded container)
 * - A "Government of India" label placeholder (short line)
 * - A title skeleton line
 * - An optional subtitle skeleton line
 * - An optional badge skeleton pill
 *
 * Matches the exact spacing and alignment of `GovtHeader` to prevent layout
 * shift during loading states.
 *
 * @example
 * ```tsx
 * // Minimal — title only
 * <GovtHeaderSkeleton />
 *
 * // With subtitle + badge
 * <GovtHeaderSkeleton hasSubtitle hasBadge />
 *
 * // With subtitle and custom widths
 * <GovtHeaderSkeleton hasSubtitle titleWidth="w-64" subtitleWidth="w-48" />
 * ```
 */
export const GovtHeaderSkeleton = ({
  hasSubtitle,
  hasBadge,
  titleWidth = 'w-56',
  subtitleWidth = 'w-40',
  badgeWidth = 'w-24',
  className,
}: GovtHeaderSkeletonProps) => (
  <View className={cn('mb-8 items-center gap-y-2', className)}>
    {/* Icon placeholder — matches h-16 w-16 emoji container */}
    <Skeleton className="mb-3 h-16 w-16 rounded-md" />

    {/* "Government of India" label placeholder — matches text-[11px] */}
    <Skeleton className="h-3 w-28 rounded" />

    {/* Title placeholder — matches heading variant */}
    <Skeleton className={cn('h-7 rounded-md', titleWidth)} />

    {/* Optional subtitle — matches subtext variant */}
    {hasSubtitle && <Skeleton className={cn('h-4 rounded', subtitleWidth)} />}

    {/* Optional badge pill — matches rounded-md badge */}
    {hasBadge && <Skeleton className={cn('mt-4 h-6 rounded-md', badgeWidth)} />}
  </View>
);
