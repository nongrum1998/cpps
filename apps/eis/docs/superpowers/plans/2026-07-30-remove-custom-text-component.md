# Remove Custom Text Component Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove `src/shared/components/ui/text.tsx` (CVA-based `Text` wrapper) and replace all 36 consumer files with React Native's `<Text>` directly, expanding variant/size/weight props to explicit `className` strings.

**Architecture:** The custom `Text` component wraps RN's `<Text>` with a `class-variance-authority`-based typography system providing `variant`, `size`, and `weight` shorthand props. Removing it means every consumer file must expand those shorthands into explicit Tailwind utility classes. The `cva` library stays (used by 4 other components). The tailwind `fontSize` tokens stay (used directly by 3 other files).

**Tech Stack:** React Native `Text`, NativeWind (Tailwind CSS), no more CVA dependency for text (but CVA stays for button/alert/card/fab).

---

## Variant → ClassName Reference Table

Every `<Text>` usage in the codebase falls into one of these pattern expansions. Use this table for all tasks below.

### Base Classes (add to usages that lose them)

The current component always adds `font-sans text-foreground dark:text-white` via CVA base. When converting:

| Component provides                   | Replace with                                                                                                                                                                        |
| ------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `font-sans`                          | Omit (system default font)                                                                                                                                                          |
| `text-base` (from `default` variant) | Add if the usage has no explicit text-size class in its className; omit if it already has one                                                                                       |
| `text-foreground`                    | Add `text-foreground` only if no other text-color class is present (e.g., `text-muted-foreground`, `text-primary`, `text-destructive`, `text-charcoal`, `text-ink`, `text-red-500`) |
| `dark:text-white`                    | Add `dark:text-white` only when there's no dark-mode-aware token (most semantic colors like `text-foreground` / `text-muted-foreground` already handle dark mode via CSS variables) |

### Variants (no size override)

| `variant` prop              | Expanded `className`                                          |
| --------------------------- | ------------------------------------------------------------- |
| `display-xxl`               | `text-7xl`                                                    |
| `display-xl`                | `text-6xl`                                                    |
| `display-lg`                | `text-5xl`                                                    |
| `display-md`                | `text-4xl`                                                    |
| `display-sm`                | `text-2xl`                                                    |
| `display-xs`                | `text-xl`                                                     |
| `body-lg`                   | `text-lg`                                                     |
| `body-md`                   | `text-base`                                                   |
| `body-emphasis`             | `text-base font-medium`                                       |
| `caption-md`                | `text-sm`                                                     |
| `caption-bold`              | `text-sm font-bold`                                           |
| `caption-sm`                | `text-xs`                                                     |
| `link-md`                   | `text-base font-medium text-primary`                          |
| `button-md`                 | `text-sm font-semibold uppercase tracking-wide`               |
| `button-sm`                 | `text-xs font-bold uppercase tracking-wider`                  |
| `price-md`                  | `text-2xl`                                                    |
| `default` (no variant prop) | `text-base` — omit if className already has a text-size class |
| `heading`                   | `text-2xl font-semibold`                                      |
| `subtext`                   | `text-sm text-muted-foreground`                               |
| `error`                     | `text-sm text-destructive`                                    |
| `link`                      | `text-base font-medium text-primary`                          |
| `label`                     | `text-sm font-medium text-foreground/70`                      |

### Size override (when `size` prop provided alongside `variant`)

The component strips the text-size class from the variant's output and replaces it with the size's text-size class. All non-size classes from the variant (color, weight, transform) are preserved.

| `size` prop | Expands to |
| ----------- | ---------- |
| `xs`        | `text-xs`  |
| `sm`        | `text-sm`  |
| `lg`        | `text-lg`  |
| `xl`        | `text-xl`  |
| `2xl`       | `text-2xl` |
| `3xl`       | `text-4xl` |

**Example:** `variant="heading" size="3xl"` → `font-semibold` (from heading, minus `text-2xl`) + `text-4xl` (from size=3xl) = `font-semibold text-4xl`

### Weight override (when `weight` prop provided)

| `weight` prop | Expands to      |
| ------------- | --------------- |
| `light`       | `font-light`    |
| `medium`      | `font-medium`   |
| `semibold`    | `font-semibold` |
| `bold`        | `font-bold`     |

**Note:** When `weight` conflicts with a weight class already in the variant (e.g., `variant="heading"` has `font-semibold` and `weight="bold"` is also specified), `tailwind-merge` deduplicates — the last `font-*` class wins. In practice, just include both expanded values; `cn`/`twMerge` resolves conflicts correctly.

### Import Replacement Patterns

| Current import                                         | Replace with                                                                             |
| ------------------------------------------------------ | ---------------------------------------------------------------------------------------- |
| `import { Text } from './text'`                        | `import { Text } from 'react-native'`                                                    |
| `import { Text } from '../ui/text'`                    | `import { Text } from 'react-native'`                                                    |
| `import { Text } from '@components/ui/text'`           | `import { Text } from 'react-native'`                                                    |
| `import { Input, Text } from '@components/ui'`         | `import { Input } from '@components/ui'` + `import { Text } from 'react-native'`         |
| `import { Button, Input, Text } from '@components/ui'` | `import { Button, Input } from '@components/ui'` + `import { Text } from 'react-native'` |

---

## Global Constraints

- The `cva` npm dependency cannot be removed (still used by `button.tsx`, `card.tsx`, `alert.tsx`, `fab.tsx`)
- The `tailwind.config.js` `fontSize` block cannot be removed (tokens used directly by `button.tsx`, `gpf-statements/*`, `login-screen.tsx`)
- `React.ComponentProps<typeof Text>` references in `dialog.tsx` do NOT need to change — after the import swap to `'react-native'`, `typeof Text` still resolves to the RN Text component type
- After each task, verify with `npx tsc --noEmit` — no new type errors should appear
- After all tasks, `import { textVariants }` has zero external importers (already confirmed)

---

### Task 1: Shared UI Components (dialog, alert, accordion, card)

**Files:** (4 files)

- Modify: `src/shared/components/ui/dialog.tsx`
- Modify: `src/shared/components/ui/alert.tsx`
- Modify: `src/shared/components/ui/accordion.tsx`
- Modify: `src/shared/components/ui/card.tsx`

These are the closest consumers of Text and use it to compose their own compound components (DialogTitle, AlertTitle, CardTitle, etc.).

- [ ] **Step 1: Convert `dialog.tsx`**

Change import:

```tsx
// Before
import { Text } from './text';
// After
import { Text } from 'react-native';
```

Convert usages:

```tsx
// Before (line 112)
export const DialogTitle = ({ className, ...props }: React.ComponentProps<typeof Text>) => (
  <Text variant="display-xs" className={className} {...props} />
);
// After — type reference stays valid since Text is now RN Text.
// IMPORTANT: React.ComponentProps<typeof Text> narrows to RNTextProps after swap,
// which does NOT include variant/size/weight. Verify no callers pass these to
// DialogTitle/DialogDescription — they should only receive standard RN Text props + className.
export const DialogTitle = ({ className, ...props }: React.ComponentProps<typeof Text>) => (
  <Text className="text-xl" {...props} />
);
```

```tsx
// Before (line 115-116)
export const DialogDescription = ({ className, ...props }: React.ComponentProps<typeof Text>) => (
  <Text variant="caption-md" className={cn('text-muted-foreground', className)} {...props} />
);
// After — variant caption-md → text-sm. 'text-muted-foreground' in cn() is redundant
// but harmless; keep it for clarity.
export const DialogDescription = ({ className, ...props }: React.ComponentProps<typeof Text>) => (
  <Text className={cn('text-sm text-muted-foreground', className)} {...props} />
);
```

- [ ] **Step 2: Convert `alert.tsx`**

Change import: `import { Text } from './text'` → `import { Text } from 'react-native'`

`alert.tsx` has 3 Text usages with variants: `body-emphasis`, `caption-md`, `caption-bold`. No `size` or `weight` overrides. Simple one-to-one replacement using the reference table — add `text-base font-medium`, `text-sm`, and `text-sm font-bold` classes respectively.

- [ ] **Step 3: Convert `accordion.tsx`**

Change import: `import { Text } from './text'` → `import { Text } from 'react-native'`

Usages use `variant="body-emphasis"` with `className`. One-to-one replacement — `variant="body-emphasis"` → `className="text-base font-medium"`.

- [ ] **Step 4: Convert `card.tsx`**

Change import: `import { Text } from './text'` → `import { Text } from 'react-native'`

Two usages:

- CardTitle uses `variant="display-xs"` with `className` → `className={cn('text-xl', className)}`
- CardDescription uses `variant="caption-md"` with `className` → `className={cn('text-sm', className)}`

- [ ] **Step 5: TypeScript verification**

Run: `npx tsc --noEmit`
Expected: No new errors. If errors exist, fix and re-run.

---

### Task 2: Common Components — Part 1 (search-input, govt-header, money-row, detail-row, summary-card, section-header)

**Files:** (6 files)

- Modify: `src/shared/components/common/search-input.tsx`
- Modify: `src/shared/components/common/govt-header.tsx`
- Modify: `src/shared/components/common/money-row.tsx`
- Modify: `src/shared/components/common/detail-row.tsx`
- Modify: `src/shared/components/common/summary-card.tsx`
- Modify: `src/shared/components/common/section-header.tsx`

All import from `'../ui/text'`.

- [ ] **Step 1: Convert `search-input.tsx`**

Change import: `import { Text } from '../ui/text'` → `import { Text } from 'react-native'`

Inspect Text usages — convert variant/size/weight to className per reference table.

- [ ] **Step 2: Convert `govt-header.tsx`**

Change import: `import { Text } from '../ui/text'` → `import { Text } from 'react-native'`

Notable: uses `variant="heading"` with `className`. Expand `heading` → `text-2xl font-semibold` in className.

Also uses `variant="subtext"`. Expand `subtext` → `text-sm text-muted-foreground`.

- [ ] **Step 3: Convert `money-row.tsx`**

Change import: `import { Text } from '../ui/text'` → `import { Text } from 'react-native'`

Key concern: No variant prop used — relies on `default` variant (which adds `text-base` via base). The className already has `text-sm` which overrides `text-base`. But the base `text-foreground` and `dark:text-white` are lost.

**Add `text-foreground`** to both Text usages' className calls since neither has an explicit text-color class:

```tsx
// Before (line 23-24)
<Text className={cn('text-sm', isBold ? 'font-bold text-foreground' : 'font-medium text-charcoal')}>
// After
<Text className={cn('text-sm text-foreground', isBold ? 'font-bold text-foreground' : 'font-medium text-charcoal')}>
```

> [!NOTE]
> This is redundant `text-foreground` when `isBold` is true, but `tailwind-merge` deduplicates identical classes. The redundancy is harmless and keeps the code cleaner than conditional logic.

```tsx
// Before (line 27-31)
<Text className={cn('text-sm font-medium tabular-nums', isBold ? 'text-base font-bold text-foreground' : 'text-foreground', isDeduction && !isBold && 'text-red-500')}>
// After — text-red-500 is NOT dark-mode-aware (stock Tailwind color).
// The original base dark:text-white overrode it to white in dark mode.
// Add dark:text-white to preserve dark mode behavior for deduction rows.
<Text className={cn('text-sm font-medium tabular-nums text-foreground dark:text-white', isBold ? 'text-base font-bold text-foreground' : 'text-foreground', isDeduction && !isBold && 'text-red-500')}>
```

- [ ] **Step 4: Convert `detail-row.tsx`**

Change import: `import { Text } from '../ui/text'` → `import { Text } from 'react-native'`

Two usages:

- `variant="subtext"` with `className="text-sm font-medium"` → `className="text-sm text-muted-foreground font-medium"` (tailwind-merge deduplicates `text-sm`). Simplify to `className="text-sm font-medium text-muted-foreground"`.
- `className="text-sm font-semibold text-foreground"` — already has `text-foreground`, no change needed beyond import switch.

- [ ] **Step 5: Convert `summary-card.tsx`**

Change import: `import { Text } from '../ui/text'` → `import { Text } from 'react-native'`

Inspect and convert per reference table. Likely uses default variant with className.

- [ ] **Step 6: Convert `section-header.tsx`**

Change import: `import { Text } from '../ui/text'` → `import { Text } from 'react-native'`

Three usages to convert:

```tsx
// Usage 1 (line 44): Icon — no variant, just className
<Text className="text-xl">{icon}</Text>
// → Already fine, just import change needed. Add text-foreground since it relied on base default.
<Text className="text-xl text-foreground">{icon}</Text>
```

```tsx
// Usage 2 (line 50): Title — variant="heading" + size="3xl" + weight="bold" + className
<Text variant="heading" size="3xl" weight="bold" className="text-foreground">
  {title}
</Text>
// → heading = text-2xl font-semibold
//   size 3xl = text-4xl (overrides text-2xl)
//   weight bold = font-bold (overrides font-semibold via tailwind-merge)
//   Result: font-semibold text-4xl font-bold text-foreground
// → Simplified: text-4xl font-bold text-foreground
<Text className="text-4xl font-bold text-foreground">{title}</Text>
```

```tsx
// Usage 3 (line 54): Subtitle — variant="subtext" + size="sm" + className
<Text variant="subtext" size="sm" className="mt-1">
// → subtext = text-sm text-muted-foreground
//   size sm = text-sm (same, redundant via tailwind-merge)
//   Result: text-sm text-muted-foreground mt-1
// → Simplified: text-sm text-muted-foreground mt-1
<Text className="text-sm text-muted-foreground mt-1">
```

- [ ] **Step 7: TypeScript verification**

Run: `npx tsc --noEmit`
Expected: No new errors.

---

### Task 3: Common Components — Part 2 (stats-box, setting-row, filter-card, history-card, year-filter)

**Files:** (5 files)

- Modify: `src/shared/components/common/stats-box.tsx`
- Modify: `src/shared/components/common/setting-row.tsx`
- Modify: `src/shared/components/common/filter-card.tsx`
- Modify: `src/shared/components/common/history-card.tsx`
- Modify: `src/shared/components/common/year-filter.tsx`

- [ ] **Step 1: Convert `stats-box.tsx`**

Change import: `import { Text } from '../ui/text'` → `import { Text } from 'react-native'`

Two usages:

```tsx
// Usage 1 (line 16): no variant, cn() with color
<Text className={cn('mb-1 text-xl font-bold', color)}>{value}</Text>
// → Add text-foreground since no text-color in base className (color is dynamic)
<Text className={cn('mb-1 text-xl font-bold text-foreground', color)}>{value}</Text>
```

```tsx
// Usage 2 (line 17): variant="subtext" + className
<Text variant="subtext" className="text-xs font-medium uppercase tracking-wider">
// → subtext = text-sm text-muted-foreground
//   text-xs overrides text-sm
//   Result: text-xs font-medium uppercase tracking-wider text-muted-foreground
<Text className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
```

- [ ] **Step 2: Convert `setting-row.tsx`**

Change import: `import { Text } from '@components/ui/text'` → `import { Text } from 'react-native'`

Inspect and convert per reference table.

- [ ] **Step 3: Convert `filter-card.tsx`**

Change import: `import { Text } from '@components/ui/text'` → `import { Text } from 'react-native'`

Inspect and convert per reference table.

- [ ] **Step 4: Convert `history-card.tsx`**

Change import: `import { Text } from '@components/ui/text'` → `import { Text } from 'react-native'`

Inspect and convert per reference table.

- [ ] **Step 5: Convert `year-filter.tsx`**

Change import: `import { Text } from '@components/ui/text'` → `import { Text } from 'react-native'`

Inspect and convert per reference table.

- [ ] **Step 6: TypeScript verification**

Run: `npx tsc --noEmit`
Expected: No new errors.

---

### Task 4: Shared Screens & Layout (loading-screen, forbidden, paginated-list)

**Files:** (3 files)

- Modify: `src/shared/components/screens/loading-screen.tsx`
- Modify: `src/shared/components/screens/forbidden.tsx`
- Modify: `src/shared/components/layout/paginated-list.tsx`

- [ ] **Step 1: Convert `loading-screen.tsx`**

Change import: `import { Text } from '../ui/text'` → `import { Text } from 'react-native'`

Likely uses default variant. Add `text-foreground` to className if no text-color class present.

- [ ] **Step 2: Convert `forbidden.tsx`**

Change import: `import { Text } from '@components/ui/text'` → `import { Text } from 'react-native'`

Uses `variant="heading"`, `variant="subtext"`, and likely default variant. Expand per reference table.

- [ ] **Step 3: Convert `paginated-list.tsx`**

Change import: `import { Text } from '../ui/text'` → `import { Text } from 'react-native'`

Likely uses `variant="subtext"`. Expand per reference table.

- [ ] **Step 4: TypeScript verification**

Run: `npx tsc --noEmit`
Expected: No new errors.

---

### Task 5: Feature — Auth (auth-term-text, auth-header, auth-footer, auth-divider, reset-password-form, sign-up-screen)

**Files:** (6 files)

- Modify: `src/features/auth/components/auth-term-text.tsx`
- Modify: `src/features/auth/components/auth-header.tsx`
- Modify: `src/features/auth/components/auth-footer.tsx`
- Modify: `src/features/auth/components/auth-divider.tsx`
- Modify: `src/features/auth/components/reset-password-form.tsx`
- Modify: `src/features/auth/screens/sign-up-screen.tsx` **← barrel import**

- [ ] **Step 1: Convert `auth-term-text.tsx`**

Change import: `import { Text } from '@components/ui/text'` → `import { Text } from 'react-native'`

Uses `variant="subtext"` with `size="xs"` and `weight="medium"`:

- `variant="subtext"` → `text-sm text-muted-foreground`
- `size="xs"` → `text-xs` (overrides `text-sm`)
- `weight="medium"` → `font-medium`
- Result: `text-xs text-muted-foreground font-medium`
- Also uses `variant="link"` → `text-base font-medium text-primary`

- [ ] **Step 2: Convert `auth-header.tsx`**

Change import: `import { Text } from '@components/ui/text'` → `import { Text } from 'react-native'`

Uses `variant="heading"` with `size="3xl"` and `weight="semibold"`:

- `variant="heading"` → `text-2xl font-semibold`
- `size="3xl"` → `text-4xl` (overrides `text-2xl`)
- `weight="semibold"` → `font-semibold` (redundant with heading's `font-semibold`)
- Also uses `variant="subtext"`
- Result: `text-4xl font-semibold`

- [ ] **Step 3: Convert `auth-footer.tsx`**

Change import: `import { Text } from '@components/ui/text'` → `import { Text } from 'react-native'`

Uses `variant="subtext"` and `variant="link"` with `weight="semibold"`. Expand per reference table.

- [ ] **Step 4: Convert `auth-divider.tsx`**

Change import: `import { Text } from '@components/ui/text'` → `import { Text } from 'react-native'`

Uses `variant="subtext"` with `weight="medium"`. Expand per reference table.

- [ ] **Step 5: Convert `reset-password-form.tsx`**

Change import: `import { Text } from '@components/ui/text'` → `import { Text } from 'react-native'`

Uses pattern: `variant={fieldError ? 'error' : 'label'}` with conditional className. Expand:

- `error` → `text-sm text-destructive`
- `label` → `text-sm font-medium text-foreground/70`

Also uses `variant="caption-sm"` for validation messages, with `className="ml-1 mt-2 text-destructive"`, so replace `variant="caption-sm"` with `text-xs` in className.

- [ ] **Step 6: Convert `sign-up-screen.tsx`**

Change import: `import { Button, Input, Text } from '@components/ui'` → `import { Button, Input } from '@components/ui'` + `import { Text } from 'react-native'`

Same `error`/`label` pattern as reset-password-form. Expand per reference table.

- [ ] **Step 7: TypeScript verification**

Run: `npx tsc --noEmit`
Expected: No new errors.

---

### Task 6: Feature — Leave & Home (leave-detail-info, leave-detail-header, leave-balance-card, home-quick-actions, home-leave-history, update-leave-screen)

**Files:** (6 files)

- Modify: `src/features/leave/components/leave-detail-info.tsx`
- Modify: `src/features/leave/components/leave-detail-header.tsx`
- Modify: `src/features/leave/components/leave-balance-card.tsx`
- Modify: `src/features/home/components/home-quick-actions.tsx`
- Modify: `src/features/home/components/home-leave-history.tsx`
- Modify: `src/features/leave/screens/update-leave-screen.tsx` **← barrel import**

- [ ] **Step 1: Convert `leave-detail-info.tsx`**

Change import: `import { Text } from '@components/ui/text'` → `import { Text } from 'react-native'`

Uses `variant="subtext"` with `size="xs"`, plus default variant. Expand per reference table.

- [ ] **Step 2: Convert `leave-detail-header.tsx`**

Change import: `import { Text } from '@components/ui/text'` → `import { Text } from 'react-native'`

Uses `variant="heading"`, `variant="subtext"` with `size="sm"`, and `variant="heading"` with `size="2xl"`. Expand per reference table.

- [ ] **Step 3: Convert `leave-balance-card.tsx`**

Change import: `import { Text } from '@components/ui/text'` → `import { Text } from 'react-native'`

Uses `variant="subtext"`. Expand per reference table.

- [ ] **Step 4: Convert `home-quick-actions.tsx`**

Change import: `import { Text } from '@components/ui/text'` → `import { Text } from 'react-native'`

Uses default variant with className. Add `text-foreground` if no text-color class present.

- [ ] **Step 5: Convert `home-leave-history.tsx`**

Change import: `import { Text } from '@components/ui/text'` → `import { Text } from 'react-native'`

This file has **6 `<Text>` usages**, all with no `variant` prop (uses `default` → `text-base`). Convert each:

| Usage            | Current `className`                                            | Replace with                                                                                                                                 |
| ---------------- | -------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| Line 40          | `text-center text-lg font-bold tracking-wider text-black`      | Change to `text-center text-lg font-bold tracking-wider text-foreground`. `text-black` is NOT dark-mode-aware; `text-foreground` handles it. |
| Line 43          | `text-center text-lg font-medium tracking-wider text-graphite` | `text-graphite` IS dark-mode-aware. Add `text-foreground` (redundant but harmless).                                                          |
| Line 64          | `text-sm text-primary`                                         | Already correct — `text-primary` handles dark mode.                                                                                          |
| Line 65          | `text-lg font-semibold`                                        | Add `text-foreground` — no explicit text-color class present.                                                                                |
| Lines 68-71 (×3) | `text-gray-500`                                                | Change to `text-muted-foreground` (dark-mode-aware) or add `dark:text-white`. `text-gray-500` is NOT dark-mode-aware.                        |

- [ ] **Step 6: Convert `update-leave-screen.tsx`**

Change import: `import { Input, Text } from '@components/ui'` → `import { Input } from '@components/ui'` + `import { Text } from 'react-native'`

Uses the `error`/`label` pattern and `caption-sm` for form validation. Expand per reference table.

- [ ] **Step 7: TypeScript verification**

Run: `npx tsc --noEmit`
Expected: No new errors.

---

### Task 7: Feature — Announcements & Income Tax (announcement-card, tax-summary-card, create-tax-record-screen, edit-tax-detail-screen, tax-detail-screen, create.tsx)

**Files:** (6 files)

- Modify: `src/features/announcements/components/announcement-card.tsx`
- Modify: `src/features/income-tax/components/tax-summary-card.tsx`
- Modify: `src/features/income-tax/screens/create-tax-record-screen.tsx`
- Modify: `src/features/income-tax/screens/edit-tax-detail-screen.tsx`
- Modify: `src/features/income-tax/screens/tax-detail-screen.tsx`
- Modify: `src/app/tax/create.tsx`

All import from `'@components/ui/text'`.

- [ ] **Step 1: Convert `announcement-card.tsx`**

Change import to `'react-native'`. Key usages:

a) `variant="heading"` with `size="sm"` (no `weight` prop):

- `heading` → `text-2xl font-semibold`
- `size="sm"` → `text-sm` (overrides `text-2xl`)
- Result: `text-sm font-semibold`

b) `variant="subtext"` → `text-sm text-muted-foreground`

c) 3 variant-less usages (lines 31, 36, 37): No variant prop — used `default` variant (`text-base`). Add `text-base text-foreground` unless they already have explicit text-size/color. Check for stock Tailwind colors that would lose `dark:text-white`.

- [ ] **Step 2: Convert `tax-summary-card.tsx`**

Change import to `'react-native'`. Uses `variant="subtext"` and default variant. Expand per reference table.

- [ ] **Step 3: Convert `create-tax-record-screen.tsx`**

Change import to `'react-native'`. Uses `error`/`label` pattern and `caption-sm` for form validation. Same pattern as reset-password-form Task 5 Step 5.

Also uses `weight="medium"` with `label` variant: `variant="label" weight="medium"` → `text-sm font-medium text-foreground/70` (deduped).

- [ ] **Step 4: Convert `edit-tax-detail-screen.tsx`**

Change import to `'react-native'`. Same form validation pattern (`error`/`label`, `caption-sm`). Expand per reference table.

- [ ] **Step 5: Convert `tax-detail-screen.tsx`**

Change import to `'react-native'`. Uses `variant="subtext"` with `size="xs"`, plus `variant="body-emphasis"` and `variant="heading"`. Expand per reference table.

- [ ] **Step 6: Convert `create.tsx`**

Change import to `'react-native'`. Same form validation pattern (`error`/`label`, `caption-sm`). Expand per reference table.

- [ ] **Step 7: TypeScript verification**

Run: `npx tsc --noEmit`
Expected: No new errors.

---

### Task 8: Cleanup — Remove Barrel Export & Delete text.tsx

**Files:**

- Modify: `src/shared/components/ui/index.ts` — remove line 3: `export * from './text';`
- Delete: `src/shared/components/ui/text.tsx`

- [ ] **Step 1: Update barrel file**

Remove the Text re-export from the barrel:

```tsx
// Before (src/shared/components/ui/index.ts)
export * from './button';
export * from './input';
export * from './text';
export * from './skeleton';
...

// After
export * from './button';
export * from './input';
export * from './skeleton';
...
```

- [ ] **Step 2: Verify no remaining imports of `textVariants`**

Run: `grep -rn "textVariants" src/ --include="*.ts" --include="*.tsx"`
Expected: Empty result (already confirmed, but re-verify).

- [ ] **Step 3: Verify no remaining imports from custom Text**

Run these checks to confirm all imports are converted:

```bash
# Check direct imports from ./text or @components/ui/text
grep -rn "from.*['\"].*/text['\"]" src/ --include="*.tsx" --include="*.ts"
# Expected: No results (or only unrelated RN-native text references)
```

```bash
# Check barrel imports that still destructure Text
grep -rn "Text.*from.*@components/ui" src/ --include="*.tsx" --include="*.ts"
# Expected: No results (the two barrel files should have been split)
```

```bash
# Check for any remaining variant/size/weight on Text usages
grep -rn '<Text' src/ --include="*.tsx" | grep -E '\bvariant=|\bsize=|\bweight=' || echo "Clean"
# Expected: No matches in converted files (button.tsx/fab.tsx will still match — they have their own CVA, not related to the removed Text component)
```

- [ ] **Step 4: Delete `text.tsx`**

```bash
rm src/shared/components/ui/text.tsx
```

- [ ] **Step 5: Full TypeScript verification**

Run: `npx tsc --noEmit`
Expected: No errors. If any file still imports from the removed component, fix those imports.

---

## Verification

After all tasks are complete, run the full verification:

1. **No remaining variant/size/weight props** — confirm all custom Text props are converted:

   ```bash
   grep -rn "variant=\|size=\|weight=" src/ --include="*.tsx" | grep -v "node_modules" | grep -v "\.tsx\.bak" || echo "No remaining custom props"
   ```

   > [!TIP]
   > `button.tsx` and `fab.tsx` also use `variant` from CVA — those are expected. Focus on any matches in files that previously used the custom `Text`.

2. `npx tsc --noEmit` — type-check passes

3. `npx expo run:ios` or `npx expo run:android` — app builds and runs (if applicable)

4. **Dark mode visual regression check** — the highest-risk changes are in files that lost `dark:text-white` from the base:
   - **auth screens** (auth-header, auth-footer, auth-term-text, auth-divider, sign-up-screen, reset-password-form)
   - **leave screens** (leave-detail-info, leave-detail-header, leave-balance-card)
   - **home** (home-leave-history — has `text-black`/`text-gray-500`)
   - **money-row** (has `text-red-500` for deductions)
   - **settings** (setting-row)
   - Toggle dark mode and verify text contrast in these screens

## Execution Handoff

Plan complete. Two execution options:

1. **Subagent-Driven (recommended)** — Dispatch a fresh subagent per task, review between tasks, fast iteration
2. **Inline Execution** — Execute tasks in this session using executing-plans, batch execution with checkpoints

Which approach?
