# GovtHeaderSkeleton Layout Match Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rewrite `GovtHeaderSkeleton` to precisely mirror the layout structure of the `GovtHeader` component, following the established skeleton pattern used by `SectionHeaderSkeleton`.

**Architecture:** The current skeleton uses a card wrapper (`rounded-md bg-white p-6 shadow-sm border`) with a horizontal flex-row layout — completely different from the actual `GovtHeader` which uses a centered vertical stack (`items-center gap-y-2`) with no card wrapper. The fix is a single-file rewrite of the skeleton component, plus adding it to the barrel export. No consumer changes needed since all optional props default to their non-rendering state.

**Tech Stack:** React Native (Expo), TypeScript

**Plan save date:** 2026-07-09

---

### Task 1: Rewrite GovtHeaderSkeleton to match GovtHeader layout

**Files:**

- Modify: `src/shared/components/skeleton/govt-header.tsx`
- Modify: `src/shared/components/skeleton/index.ts` (add barrel export)

**Interfaces:**

- Consumes: `Skeleton` from `@components/ui`, `cn` from `@utils/helpers/cn`
- Produces: `GovtHeaderSkeleton` component with interface `GovtHeaderSkeletonProps`

**Problem:** The current skeleton (`skeleton/govt-header.tsx`) renders a card with a horizontal flex-row layout. The actual `GovtHeader` (`common/govt-header.tsx`) is a centered vertical stack:

| Aspect                | Actual GovtHeader                     | Current Skeleton                                         |
| --------------------- | ------------------------------------- | -------------------------------------------------------- |
| Outer container       | `mb-8 items-center gap-y-2` (no card) | `mb-6 rounded-md border bg-white p-6 shadow-sm` (card)   |
| Layout direction      | Centered vertical (`items-center`)    | Horizontal row (`flex-row items-center justify-between`) |
| Icon                  | Emoji in `h-16 w-16` centered view    | Missing                                                  |
| "Govt of India" label | `text-[11px]` subtext variant         | Missing (replaced by left-aligned skeleton lines)        |
| Title                 | Centered `heading` variant            | Below the row                                            |
| Badge                 | Below title in `rounded-md` pill      | Right-aligned in the top row                             |
| Bottom margin         | `mb-8`                                | `mb-6`                                                   |

- [ ] **Step 1: Rewrite `skeleton/govt-header.tsx`**

Replace the entire file content with a skeleton that mirrors the actual component layout. Add optional props for subtitle/badge (matching the `SectionHeaderSkeleton` pattern) so consumers that skip them get the right layout.

````tsx
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
````

**Key rationale for each skeleton element:**

- **Icon:** `h-16 w-16 rounded-md` — matches the `h-16 w-16` icon container. `rounded-md` follows the `SectionHeaderSkeleton` icon convention.
- **Govt of India label:** `h-3 w-28 rounded` — `h-3` approximates `text-[11px]` (~14px line height), `w-28` (~112px) accommodates "Government of India" at that font size.
- **Title:** `h-7 rounded-md` — matches `variant="heading"` (~28px line height). Width defaults to `w-56` (~224px) which covers most title lengths.
- **Subtitle:** `h-4 rounded` — matches `variant="subtext"` (~16px line height). Width defaults to `w-40` (~160px).
- **Badge:** `h-6 rounded-md` with `mt-4` — matches the badge's `mt-4 rounded-md`. Width defaults to `w-24` (~96px).

- [ ] **Step 2: Add GovtHeaderSkeleton to the skeleton barrel export**

Modify `src/shared/components/skeleton/index.ts` to export the new component:

```
export * from './section-header';
export * from './govt-header';
```

This ensures consumers can import via `@components/skeleton` instead of deep-importing `@components/skeleton/govt-header`.

- [ ] **Step 3: Verify backward compatibility**

Confirm both consumers still work without changes:

| Consumer                                | Usage                    | Impact                                                                                                          |
| --------------------------------------- | ------------------------ | --------------------------------------------------------------------------------------------------------------- |
| `tax-detail-skeleton.tsx`               | `<GovtHeaderSkeleton />` | No props passed — renders minimal skeleton (icon + govt label + title). Same as before but with correct layout. |
| `salary-statements-detail-skeleton.tsx` | `<GovtHeaderSkeleton />` | Same — no props, matches original visual scope.                                                                 |

**Verification commands:**

```bash
npx tsc --noEmit --pretty 2>&1 | head -50
```

Expected: No type errors. The component accepts zero props (all are optional) so existing usage is fully backward compatible.

---

## Self-Review Checklist

- [x] **Spec coverage:** The single requirement ("match this skeleton to the actual component") is fully addressed by Task 1. Every visual element from `GovtHeader` has a corresponding skeleton placeholder.
- [x] **Placeholder scan:** No TBDs, TODOs, or "implement later" patterns. All code is complete.
- [x] **Type consistency:** `GovtHeaderSkeletonProps` uses the same naming patterns as `SectionHeaderSkeletonProps`. The barrel re-export name matches the component export name exactly.
