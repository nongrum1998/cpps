# Income Tax Skeleton Components — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create animated skeleton loading placeholders for all Income Tax feature screens (list, detail, edit, create) that mirror each screen's layout, replacing the generic `LoadingScreen` spinner.

**Architecture:** Four skeleton components under `src/features/income-tax/components/skeleton/`, each matching the layout of its corresponding screen. Screens updated to render the skeleton while data loads. Follows established patterns from `salary-statements-list-skeleton.tsx`, `salary-statements-detail-skeleton.tsx`, and announcement skeleton components.

**Tech Stack:** React Native, `@components/ui/skeleton` (Reanimated-powered pulse), NativeWind `cn()` utility.

## Global Constraints

- All new files must follow existing skeleton pattern: sub-component skeletons composed into a full-page skeleton export
- All exports must have JSDoc comments
- Named exports preferred
- Use `Skeleton` from `@components/ui/skeleton` (Reanimated pulse animation)
- Follow shadcn/hp card pattern: `rounded-md border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900`
- Dark mode support via `dark:` variants
- Each skeleton card uses `View` wrappers with `gap-y-*` for vertical spacing
- Screens replace `if (isLoading) return <LoadingScreen />` with `if (isLoading) return <TaxXxxSkeleton />`

---

## File Structure

| Action | File                                                                  | Purpose                                              |
| ------ | --------------------------------------------------------------------- | ---------------------------------------------------- |
| Create | `src/features/income-tax/components/skeleton/tax-list-skeleton.tsx`   | Skeleton for tax list screen (FlatList of cards)     |
| Create | `src/features/income-tax/components/skeleton/tax-detail-skeleton.tsx` | Skeleton for tax detail screen (scrollable sections) |
| Create | `src/features/income-tax/components/skeleton/edit-tax-skeleton.tsx`   | Skeleton for edit tax form screen                    |
| Create | `src/features/income-tax/components/skeleton/create-tax-skeleton.tsx` | Skeleton for create tax form screen                  |
| Create | `src/features/income-tax/components/skeleton/index.ts`                | Barrel export for skeleton components                |
| Modify | `src/features/income-tax/screens/tax-list-screen.tsx`                 | Use `TaxListSkeleton` instead of `LoadingScreen`     |
| Modify | `src/app/tax/detail.tsx`                                              | Use `TaxDetailSkeleton` instead of `LoadingScreen`   |
| Modify | `src/app/tax/edit.tsx`                                                | Use `EditTaxSkeleton` instead of `LoadingScreen`     |
| Modify | `src/app/tax/create.tsx`                                              | Use `CreateTaxSkeleton` (for mutation loading state) |

---

### Task 1: Create Tax List Skeleton

**Files:**

- Create: `src/features/income-tax/components/skeleton/tax-list-skeleton.tsx`

**Interfaces:**

- Consumes: `Skeleton` from `@components/ui/skeleton`, `SectionHeaderSkeleton` from `@components/skeleton/section-header`
- Produces: `TaxListSkeleton` (named export) — renders a `Container` with a `SectionHeaderSkeleton` and a `FlatList` of skeleton tax cards

- [ ] Step 1: Write the skeleton card sub-component

The list screen shows `TaxSummaryCard` items in a `FlatList`. Each card has:

- Row 1: Employee name + designation (left) | Filing status badge (right)
- Row 2: PAN label + value (left) | Gross Income label + value (right)
- Row 3: Regime dot + label (left) | Tax amount (right)

Write `src/features/income-tax/components/skeleton/tax-list-skeleton.tsx`:

````typescript
import React from 'react';
import { FlatList, View } from 'react-native';
import { Skeleton } from '@components/ui/skeleton';
import { SectionHeaderSkeleton } from '@components/skeleton/section-header';
import { Container } from '@components/layout/container';

/**
 * A single skeleton card that mimics the {@link TaxSummaryCard} layout
 * used in the income tax list screen.
 *
 * Renders placeholder blocks for:
 * - Employee name + designation (left) and filing status badge (right)
 * - PAN label/value (left) and Gross Income label/value (right)
 * - Regime indicator dot + label (left) and Tax amount (right)
 */
const TaxSummaryCardSkeleton = () => (
  <View className="mb-3 rounded-md border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
    {/* Row 1: Name + Designation | Status badge */}
    <View className="mb-3 flex-row items-center justify-between">
      <View className="flex-1 gap-y-1.5">
        <Skeleton className="h-5 w-44 rounded-md" />
        <Skeleton className="h-3 w-28 rounded" />
      </View>
      <Skeleton className="h-6 w-20 rounded-md" />
    </View>

    {/* Row 2: PAN | Gross Income */}
    <View className="mb-2 flex-row justify-between">
      <View className="gap-y-1">
        <Skeleton className="h-3 w-8 rounded" />
        <Skeleton className="h-4 w-28 rounded" />
      </View>
      <View className="items-end gap-y-1">
        <Skeleton className="h-3 w-20 rounded" />
        <Skeleton className="h-4 w-24 rounded" />
      </View>
    </View>

    {/* Row 3: Regime | Tax */}
    <View className="flex-row items-center justify-between">
      <View className="flex-row items-center gap-1">
        <Skeleton className="h-2 w-2 rounded-md" />
        <Skeleton className="h-3 w-20 rounded" />
      </View>
      <Skeleton className="h-4 w-24 rounded" />
    </View>
  </View>
);

interface TaxListSkeletonProps {
  /** Number of skeleton cards to render. Defaults to 6. */
  count?: number;
}

/**
 * Skeleton loading state for the income tax list screen.
 *
 * Renders a `Container` with a `SectionHeader` placeholder and `count`
 * skeleton cards that mirror the `TaxSummaryCard` layout. Replaces the
 * generic `LoadingScreen` while tax list data is being fetched.
 *
 * @example
 * ```tsx
 * <TaxListSkeleton count={5} />
 * ```
 */
export const TaxListSkeleton = ({ count = 6 }: TaxListSkeletonProps) => (
  <Container className="flex-1">
    <SectionHeaderSkeleton hasSubtitle titleWidth="w-32" subtitleWidth="w-44" />

    <FlatList
      contentContainerClassName="px-4 pb-20"
      data={Array.from({ length: count })}
      renderItem={() => <TaxSummaryCardSkeleton />}
    />
  </Container>
);
````

- [ ] Step 2: Commit

```bash
git add src/features/income-tax/components/skeleton/tax-list-skeleton.tsx
git commit -m "feat(tax): add tax list skeleton component"
```

---

### Task 2: Create Tax Detail Skeleton

**Files:**

- Create: `src/features/income-tax/components/skeleton/tax-detail-skeleton.tsx`

**Interfaces:**

- Consumes: `Skeleton` from `@components/ui/skeleton`, `Container` from `@components/layout/container`
- Produces: `TaxDetailSkeleton` (named export) — renders a scrollable view with skeleton sections matching the detail screen layout

- [ ] Step 1: Write the section skeleton sub-components

The detail screen has these sections in order:

1. `GovtHeader` — title + subtitle + badge
2. `SummaryCard` — Total Income Tax label + amount
3. Employee Particulars card — name, designation, PAN, department
4. Income Summary card — gross income, standard deduction, taxable income
5. Tax Computation card — regime badge, slab table header + 4 rows, then base tax, rebate, surcharge, cess, total, effective rate
6. Deductions Claimed card (Old Regime only) — 6 deduction rows (shown in skeleton always since we can't know regime before data loads)
7. Payment Summary card — TDS, tax paid, tax payable, filing status
8. Edit button

Write `src/features/income-tax/components/skeleton/tax-detail-skeleton.tsx`:

````typescript
import React from 'react';
import { View, ScrollView } from 'react-native';
import { Skeleton } from '@components/ui/skeleton';
import { Container } from '@components/layout/container';

/**
 * Skeleton placeholder that mimics the {@link GovtHeader} component.
 *
 * Layout:
 * - Employee name (large title)
 * - Designation (subtitle)
 * - FY badge (right-aligned pill)
 */
const GovtHeaderSkeleton = () => (
  <View className="mb-6 rounded-md border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
    <View className="mb-3 flex-row items-center justify-between">
      <View className="gap-y-1.5">
        <Skeleton className="h-4 w-44 rounded" />
        <Skeleton className="h-3 w-28 rounded" />
      </View>
      <Skeleton className="h-6 w-20 rounded-md" />
    </View>
    <Skeleton className="h-7 w-56 rounded-md" />
  </View>
);

/**
 * Skeleton placeholder that mimics the {@link SummaryCard} component.
 *
 * Layout:
 * - "Total Income Tax" label
 * - Large rupee amount
 */
const SummaryCardSkeleton = () => (
  <View className="mb-6 rounded-md border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
    <Skeleton className="mb-2 h-3 w-32 rounded" />
    <Skeleton className="h-8 w-44 rounded-md" />
  </View>
);

/**
 * Skeleton placeholder that mimics a card with labeled rows (e.g., Employee
 * Particulars, Income Summary, Payment Summary).
 *
 * Layout:
 * - Section title
 * - `rowCount` detail rows (label + value pairs)
 */
const DetailCardSkeleton = ({
  titleWidth = 'w-36',
  rows = 4,
}: {
  titleWidth?: string;
  rows?: number;
}) => (
  <View className="mb-6 rounded-md border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
    <Skeleton className={`mb-4 h-4 ${titleWidth} rounded`} />
    {Array.from({ length: rows }).map((_, i) => (
      <View key={i} className="mb-4 flex-row items-center justify-between">
        <Skeleton className="h-3 w-20 rounded" />
        <Skeleton className="h-4 w-32 rounded" />
      </View>
    ))}
  </View>
);

/**
 * Skeleton placeholder that mimics the Tax Computation section.
 *
 * Layout:
 * - Section title + regime badge (right-aligned)
 * - Slab table header (4 columns: Slab, Rate, Amount, Tax)
 * - 4 slab rows
 * - Bottom summary rows (base tax, rebate, surcharge, cess, total, effective rate)
 */
const TaxComputationSkeleton = () => (
  <View className="mb-6 rounded-md border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
    <View className="mb-4 flex-row items-center justify-between">
      <Skeleton className="h-4 w-32 rounded" />
      <Skeleton className="h-6 w-24 rounded-md" />
    </View>

    {/* Slab table */}
    <View className="rounded-md bg-gray-50 p-3 dark:bg-gray-800">
      {/* Table header */}
      <View className="mb-2 flex-row border-b border-gray-200 pb-2 dark:border-gray-700">
        <Skeleton className="flex-[2] h-3 rounded" />
        <Skeleton className="flex-1 ml-auto h-3 rounded" />
        <Skeleton className="flex-1 ml-auto h-3 rounded" />
        <Skeleton className="flex-1 ml-auto h-3 rounded" />
      </View>
      {/* Slab rows */}
      {Array.from({ length: 4 }).map((_, i) => (
        <View
          key={i}
          className="flex-row py-2 border-b border-gray-100 dark:border-gray-700/50">
          <Skeleton className="flex-[2] h-3 rounded" />
          <Skeleton className="flex-1 ml-auto h-3 rounded" />
          <Skeleton className="flex-1 ml-auto h-3 rounded" />
          <Skeleton className="flex-1 ml-auto h-3 rounded" />
        </View>
      ))}
    </View>

    {/* Bottom summary rows */}
    <View className="mt-4 rounded-md bg-gray-50 p-3 dark:bg-gray-800">
      {Array.from({ length: 6 }).map((_, i) => (
        <View key={i} className="mb-3 flex-row items-center justify-between">
          <Skeleton className="h-3 w-36 rounded" />
          <Skeleton className="h-4 w-24 rounded" />
        </View>
      ))}
    </View>
  </View>
);

/**
 * Full-page skeleton loading state for the employee tax detail screen.
 *
 * Renders stacked skeleton cards that mirror the detail screen layout:
 * `GovtHeader` → `SummaryCard` → Employee Particulars → Income Summary →
 * Tax Computation → Deductions → Payment Summary → Edit button.
 *
 * @example
 * ```tsx
 * <TaxDetailSkeleton />
 * ```
 */
export const TaxDetailSkeleton = () => (
  <Container className="flex-1">
    <ScrollView className="flex-1 px-6 pt-6" showsVerticalScrollIndicator={false}>
      {/* GovtHeader placeholder */}
      <GovtHeaderSkeleton />

      {/* SummaryCard placeholder */}
      <SummaryCardSkeleton />

      {/* Employee Particulars placeholder */}
      <DetailCardSkeleton titleWidth="w-36" rows={4} />

      {/* Income Summary placeholder */}
      <DetailCardSkeleton titleWidth="w-28" rows={3} />

      {/* Tax Computation placeholder */}
      <TaxComputationSkeleton />

      {/* Deductions Claimed placeholder (shown always during loading) */}
      <DetailCardSkeleton titleWidth="w-32" rows={6} />

      {/* Payment Summary placeholder */}
      <DetailCardSkeleton titleWidth="w-28" rows={4} />

      {/* Edit button placeholder */}
      <Skeleton className="mb-10 h-12 w-full rounded-md" />
    </ScrollView>
  </Container>
);
````

- [ ] Step 2: Commit

```bash
git add src/features/income-tax/components/skeleton/tax-detail-skeleton.tsx
git commit -m "feat(tax): add tax detail skeleton component"
```

---

### Task 3: Create Edit Tax Skeleton

**Files:**

- Create: `src/features/income-tax/components/skeleton/edit-tax-skeleton.tsx`

**Interfaces:**

- Consumes: `Skeleton` from `@components/ui/skeleton`, `Container` from `@components/layout/container`
- Produces: `EditTaxSkeleton` (named export) — renders a scrollable view with skeleton form fields matching the edit screen layout

- [ ] Step 1: Write the edit form skeleton

The edit screen shows:

- Tax Regime card: section title + description + 2 regime selector buttons (New/Old)
- Deductions card: section title + description + 6 `FieldInput` fields (80C, 80D, HRA, LTA, Home Loan, NPS)
- Save button

Write `src/features/income-tax/components/skeleton/edit-tax-skeleton.tsx`:

````typescript
import React from 'react';
import { View, ScrollView } from 'react-native';
import { Skeleton } from '@components/ui/skeleton';
import { Container } from '@components/layout/container';

/**
 * Skeleton placeholder that mimics the Tax Regime selector card in the
 * edit form.
 *
 * Layout:
 * - "Tax Regime" section title
 * - Description text
 * - Two regime buttons (New Regime / Old Regime)
 */
const RegimeSelectorSkeleton = () => (
  <View className="mb-6 rounded-md border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
    <Skeleton className="mb-2 h-4 w-24 rounded" />
    <Skeleton className="mb-4 h-3 w-64 rounded" />
    <View className="flex-row gap-3">
      <Skeleton className="flex-1 h-12 rounded-md" />
      <Skeleton className="flex-1 h-12 rounded-md" />
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
 * Skeleton placeholder that mimics the Deductions card in the edit form.
 *
 * Layout:
 * - "Deductions (Old Regime)" section title
 * - Description text
 * - 6 form field skeletons (80C, 80D, HRA, LTA, Home Loan, NPS)
 */
const DeductionsCardSkeleton = () => (
  <View className="mb-6 rounded-md border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
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
 * Tax Regime selector → Deductions card with 6 fields → Save button.
 * Replaces the generic `LoadingScreen` while tax data is being fetched.
 *
 * @example
 * ```tsx
 * <EditTaxSkeleton />
 * ```
 */
export const EditTaxSkeleton = () => (
  <Container className="flex-1">
    <ScrollView className="flex-1 px-6 pt-6" showsVerticalScrollIndicator={false}>
      <RegimeSelectorSkeleton />
      <DeductionsCardSkeleton />
      <Skeleton className="mb-10 h-12 w-full rounded-md" />
    </ScrollView>
  </Container>
);
````

- [ ] Step 2: Commit

```bash
git add src/features/income-tax/components/skeleton/edit-tax-skeleton.tsx
git commit -m "feat(tax): add edit tax skeleton component"
```

---

### Task 4: Create Create Tax Skeleton

**Files:**

- Create: `src/features/income-tax/components/skeleton/create-tax-skeleton.tsx`

**Interfaces:**

- Consumes: `Skeleton` from `@components/ui/skeleton`, `Container` from `@components/layout/container`
- Produces: `CreateTaxSkeleton` (named export) — same form layout as edit skeleton without regime selector description

- [ ] Step 1: Write the create form skeleton

The create screen has the same form layout as edit (same card pattern), minus the description text under the regime card. This skeleton can share structure from edit but is separate per the established pattern (see `create-leave-skeleton.tsx` vs `update-leave-skeleton.tsx`).

Write `src/features/income-tax/components/skeleton/create-tax-skeleton.tsx`:

````typescript
import React from 'react';
import { View, ScrollView } from 'react-native';
import { Skeleton } from '@components/ui/skeleton';
import { Container } from '@components/layout/container';

/**
 * Skeleton placeholder that mimics the Tax Regime selector card in the
 * create form.
 *
 * Layout:
 * - "Tax Regime" section title
 * - Two regime buttons (New Regime / Old Regime)
 */
const RegimeSelectorSkeleton = () => (
  <View className="mb-6 rounded-md border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
    <Skeleton className="mb-4 h-4 w-24 rounded" />
    <View className="flex-row gap-3">
      <Skeleton className="flex-1 h-12 rounded-md" />
      <Skeleton className="flex-1 h-12 rounded-md" />
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
  <View className="mb-6 rounded-md border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
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
    <ScrollView className="flex-1 px-6 pt-6" showsVerticalScrollIndicator={false}>
      <RegimeSelectorSkeleton />
      <DeductionsCardSkeleton />
      <Skeleton className="mb-10 h-12 w-full rounded-md" />
    </ScrollView>
  </Container>
);
````

- [ ] Step 2: Commit

```bash
git add src/features/income-tax/components/skeleton/create-tax-skeleton.tsx
git commit -m "feat(tax): add create tax skeleton component"
```

---

### Task 5: Create Skeleton Barrel Export

**Files:**

- Create: `src/features/income-tax/components/skeleton/index.ts`

**Interfaces:**

- Consumes: All 4 skeleton components from Tasks 1-4
- Produces: Barrel export for all skeleton components

- [ ] Step 1: Write the barrel export

Write `src/features/income-tax/components/skeleton/index.ts`:

```typescript
export { TaxListSkeleton } from './tax-list-skeleton';
export { TaxDetailSkeleton } from './tax-detail-skeleton';
export { EditTaxSkeleton } from './edit-tax-skeleton';
export { CreateTaxSkeleton } from './create-tax-skeleton';
```

- [ ] Step 2: Commit

```bash
git add src/features/income-tax/components/skeleton/index.ts
git commit -m "feat(tax): add skeleton barrel export"
```

---

### Task 6: Update Tax List Screen to Use Skeleton

**Files:**

- Modify: `src/features/income-tax/screens/tax-list-screen.tsx`

**Interfaces:**

- Consumes: `TaxListSkeleton` from `../components/skeleton`
- Produces: Updated screen that renders skeleton instead of `LoadingScreen`

- [ ] Step 1: Update the import and loading condition

In `src/features/income-tax/screens/tax-list-screen.tsx`:

Replace:

```typescript
import { LoadingScreen } from '@components/screens/loading-screen';
```

With:

```typescript
import { TaxListSkeleton } from '../components/skeleton';
```

Replace:

```typescript
  if (isLoading) return <LoadingScreen />;
```

With:

```typescript
  if (isLoading) return <TaxListSkeleton />;
```

- [ ] Step 2: Commit

```bash
git add src/features/income-tax/screens/tax-list-screen.tsx
git commit -m "feat(tax): replace LoadingScreen with TaxListSkeleton"
```

---

### Task 7: Update Tax Detail Screen to Use Skeleton

**Files:**

- Modify: `src/app/tax/detail.tsx`

**Interfaces:**

- Consumes: `TaxDetailSkeleton` from `@features/income-tax/components/skeleton`
- Produces: Updated screen that renders skeleton instead of `LoadingScreen`

- [ ] Step 1: Update the import and loading condition

In `src/app/tax/detail.tsx`:

Replace:

```typescript
import { LoadingScreen } from '@components/screens/loading-screen';
```

With:

```typescript
import { TaxDetailSkeleton } from '@features/income-tax/components/skeleton';
```

Replace:

```typescript
  if (isLoading) return <LoadingScreen />;
```

With:

```typescript
  if (isLoading) return <TaxDetailSkeleton />;
```

- [ ] Step 2: Commit

```bash
git add "src/app/tax/detail.tsx"
git commit -m "feat(tax): replace LoadingScreen with TaxDetailSkeleton"
```

---

### Task 8: Update Edit Tax Screen to Use Skeleton

**Files:**

- Modify: `src/app/tax/edit.tsx`

**Interfaces:**

- Consumes: `EditTaxSkeleton` from `@features/income-tax/components/skeleton`
- Produces: Updated screen that renders skeleton instead of `LoadingScreen`

- [ ] Step 1: Update the import and loading condition

In `src/app/tax/edit.tsx`:

Replace:

```typescript
import { LoadingScreen } from '@components/screens/loading-screen';
```

With:

```typescript
import { EditTaxSkeleton } from '@features/income-tax/components/skeleton';
```

Replace:

```typescript
  if (isLoading) return <LoadingScreen />;
```

With:

```typescript
  if (isLoading) return <EditTaxSkeleton />;
```

- [ ] Step 2: Commit

```bash
git add "src/app/tax/edit.tsx"
git commit -m "feat(tax): replace LoadingScreen with EditTaxSkeleton"
```

---

### Task 9: Update Create Tax Screen to Use Skeleton

**Files:**

- Modify: `src/app/tax/create.tsx`

**Interfaces:**

- Consumes: `CreateTaxSkeleton` from `@features/income-tax/components/skeleton`
- Produces: Updated screen that renders skeleton during submission

- [ ] Step 1: Add import for skeleton

In `src/app/tax/create.tsx`, add import alongside existing imports:

```typescript
import { CreateTaxSkeleton } from '@features/income-tax/components/skeleton';
```

Then update the render to show skeleton while the mutation is pending — wrap the main return in a conditional:

Replace the render section with:

```typescript
  if (isSubmitting || updateMutation.isPending) return <CreateTaxSkeleton />;

  return (
    <Container className="flex-1">
      ...
    </Container>
  );
```

- [ ] Step 2: Commit

```bash
git add "src/app/tax/create.tsx"
git commit -m "feat(tax): replace LoadingScreen with CreateTaxSkeleton"
```

---

### Task 10: TypeScript Verification

**Files:** No file changes — verification only.

- [ ] Step 1: Run TypeScript check

```bash
npx tsc --noEmit
```

Expected: 0 new errors in the income-tax feature files (pre-existing errors elsewhere are acceptable).

- [ ] Step 2: Commit verification

```bash
git commit --allow-empty -m "chore(tax): skeleton components TypeScript verification"
```

---

## Summary of Files Created/Modified

| Action | File                                                                  |
| ------ | --------------------------------------------------------------------- |
| Create | `src/features/income-tax/components/skeleton/tax-list-skeleton.tsx`   |
| Create | `src/features/income-tax/components/skeleton/tax-detail-skeleton.tsx` |
| Create | `src/features/income-tax/components/skeleton/edit-tax-skeleton.tsx`   |
| Create | `src/features/income-tax/components/skeleton/create-tax-skeleton.tsx` |
| Create | `src/features/income-tax/components/skeleton/index.ts`                |
| Modify | `src/features/income-tax/screens/tax-list-screen.tsx`                 |
| Modify | `src/app/tax/detail.tsx`                                              |
| Modify | `src/app/tax/edit.tsx`                                                |
| Modify | `src/app/tax/create.tsx`                                              |

## Self-Review Checklist

- Spec coverage: 4 skeleton components + barrel export + 4 screen updates = all requirements mapped
- Placeholder scan: No TBD, TODO, or incomplete sections
- Pattern consistency: Follows existing skeleton structure (sub-component skeletons → composed full-page export), uses same `Skeleton` component and `SectionHeaderSkeleton`
- Import paths: Correct relative/absolute paths used for each screen's location
- Screen update accuracy: Each loading condition replaced with correct skeleton variant
