# NPS Statement Screen Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the NPS Statement screen (Annexure-5) matching the GPF Statement screen design — member info card, monthly contribution table, summary card, skeleton, and empty state — fetching the current financial year's data via the existing `get_annex5` RPC.

**Architecture:** Mirror the `gpf-statements` feature layout exactly: a feature-scoped component/hook/types/constants structure, a screen that composes cards + a horizontal-scroll table inside a `Container`/`ScrollView`, and a skeleton for loading. The existing `useNpsStatements` hook and `NPSAnnux5` type are reused; parallel monthly arrays (`fin_mmyyy`, `basic`, `da`, `empamt`, `govt_amt`, `total`, `c_type`) are zipped into row objects via a transform helper. Financial year is derived client-side (`getCurrentFinancialYear`) — no selector, per user decision.

**Tech Stack:** React Native 0.81 / Expo 54 / Expo Router 6 / NativeWind (Tailwind classes) / TanStack Query 5 / Zustand auth store / Hugeicons.

**Decisions (confirmed with user):**

- Financial year: hardcoded to the current financial year via helper (no year selector).
- Testing: no unit tests — verify with `npx tsc --noEmit` and `npm run lint` (repo has no test framework).
- Home tab (`(drawers)/(tabs)/index.tsx`): leave the existing dev import of `NpsStatementsScreen` as-is (do not revert).
- Route wiring: replace `UnderDevelopment` at `src/app/nps-statements/index.tsx` so the drawer route renders the real screen.

---

## File Map

**Create (within `src/features/nps-statement/`):**

- `types/nps-monthly-row.ts` — derived monthly row type
- `types/nps-table-column.ts` — table column definition interface
- `types/index.ts` — type barrel
- `utils/constants/columns.ts` — monthly table column config
- `utils/constants/index.ts` — constants barrel
- `utils/financial-year.ts` — `getCurrentFinancialYear()` helper
- `utils/transform.ts` — `buildMonthlyRows()` / `buildSummaryRows()` zippers
- `utils/index.ts` — utils barrel
- `hooks/index.ts` — hooks barrel
- `components/nps-member-info-card.tsx`
- `components/nps-monthly-table.tsx`
- `components/nps-summary-card.tsx`
- `components/nps-statement-skeleton.tsx`
- `components/index.ts` — components barrel

**Modify:**

- `src/features/nps-statement/hooks/use-nps-statement.ts` — add `staleTime: STALE_TIMES.NPS`
- `src/features/nps-statement/screens/nps-statements.tsx` — full screen (replaces placeholder `<View/>`)
- `src/features/nps-statement/index.ts` — export the screen
- `src/app/nps-statements/index.tsx` — render `NpsStatementsScreen` instead of `UnderDevelopment`

**References (do not modify):**

- `src/features/gpf-statements/screens/gpf-statement-screens.tsx` — screen pattern
- `src/features/gpf-statements/components/summary-table.tsx` — table pattern
- `src/features/gpf-statements/components/skeleton.tsx` — skeleton pattern
- `src/features/gpf-statements/types/gpf-table-column.ts` — column type pattern
- `src/features/gpf-statements/utils/constants/columns.ts` — column config pattern
- `src/shared/components/ui/card.tsx`, `.../skeleton.tsx`, `.../screens/empty-screen.tsx`, `.../layout/container.tsx`

---

## Task 1: Create feature branch

**Files:** none

- [ ] **Step 1: Create branch**

```bash
git checkout -b feat/nps-statement-screen
```

- [ ] **Step 2: Verify branch**

Run: `git branch --show-current`
Expected: `feat/nps-statement-screen`

---

## Task 2: Add derived types and type barrel

**Files:**

- Create: `src/features/nps-statement/types/nps-monthly-row.ts`
- Create: `src/features/nps-statement/types/nps-table-column.ts`
- Create: `src/features/nps-statement/types/index.ts`

- [ ] **Step 1: Create `nps-monthly-row.ts`**

```typescript
/** One row of the NPS monthly contribution table (zipped from NPSAnnux5 parallel arrays). */
export type NPSMonthlyRow = {
  fin_mmyyy: string;
  basic: string;
  da: string;
  empamt: number;
  govt_amt: number;
  total: number;
  c_type: string;
};
```

- [ ] **Step 2: Create `nps-table-column.ts`**

```typescript
import type { NPSMonthlyRow } from './nps-monthly-row';

/** Column definition for the NPS monthly contribution table. */
export interface NPSMonthlyColumn {
  /** The key in NPSMonthlyRow to display. */
  key: keyof NPSMonthlyRow;
  /** The human-readable column header label. */
  label: string;
  /** Minimum width in px to keep columns readable when scrolling. */
  minWidth: number;
  /** When true, renders the cell with emphasis styling (bold, primary color). */
  emphasis?: boolean;
}
```

- [ ] **Step 3: Create `index.ts`**

```typescript
export * from './nps';
export * from './nps-monthly-row';
export * from './nps-table-column';
```

- [ ] **Step 4: Verify types compile**

Run: `npx tsc --noEmit`
Expected: no errors

---

## Task 3: Add monthly column constants

**Files:**

- Create: `src/features/nps-statement/utils/constants/columns.ts`
- Create: `src/features/nps-statement/utils/constants/index.ts`

- [ ] **Step 1: Create `columns.ts`**

```typescript
import type { NPSMonthlyColumn } from '../../types';

/** Column definitions for the NPS monthly contribution table. */
export const NPS_MONTHLY_COLUMNS: NPSMonthlyColumn[] = [
  { key: 'fin_mmyyy', label: 'Financial Month', minWidth: 120 },
  { key: 'basic', label: 'Basic', minWidth: 90 },
  { key: 'da', label: 'DA', minWidth: 90 },
  { key: 'empamt', label: 'Employee', minWidth: 100 },
  { key: 'govt_amt', label: 'Government', minWidth: 110 },
  { key: 'total', label: 'Total', minWidth: 100, emphasis: true },
  { key: 'c_type', label: 'Type', minWidth: 70 },
];
```

- [ ] **Step 2: Create `index.ts`**

```typescript
export * from './columns';
```

- [ ] **Step 3: Verify types compile**

Run: `npx tsc --noEmit`
Expected: no errors

---

## Task 4: Add financial-year and transform helpers

**Files:**

- Create: `src/features/nps-statement/utils/financial-year.ts`
- Create: `src/features/nps-statement/utils/transform.ts`
- Create: `src/features/nps-statement/utils/index.ts`

- [ ] **Step 1: Create `financial-year.ts`**

```typescript
/**
 * Returns the current Indian financial year as a "YYYY-YYYY" string.
 *
 * The financial year runs April–March, so for Jan–Mar the start year is the
 * previous calendar year. E.g. on 17 Aug 2026 → "2026-2027".
 */
export function getCurrentFinancialYear(): string {
  const now = new Date();
  const startYear = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
  return `${startYear}-${startYear + 1}`;
}
```

- [ ] **Step 2: Create `transform.ts`**

```typescript
import { transformData } from '@utils/helpers';
import type { NPSAnnux5, NPSMonthlyRow } from '../types';

/**
 * Zips the parallel monthly arrays of an NPS Annexure-5 statement into rows.
 *
 * Each array index corresponds to one month (fin_mmyyy, basic, da, empamt,
 * govt_amt, total, c_type). Missing cells fall back to '-' or 0. Each row is
 * augmented with a unique `id` via {@link transformData} for list rendering.
 *
 * @param data - The raw NPS statement payload.
 * @returns Monthly rows with stable ids, or [] when no monthly data exists.
 */
export function buildMonthlyRows(data: NPSAnnux5): (NPSMonthlyRow & { id: string })[] {
  const rows: NPSMonthlyRow[] = (data.fin_mmyyy ?? []).map((month, index) => ({
    fin_mmyyy: month,
    basic: data.basic?.[index] ?? '-',
    da: data.da?.[index] ?? '-',
    empamt: data.empamt?.[index] ?? 0,
    govt_amt: data.govt_amt?.[index] ?? 0,
    total: data.total?.[index] ?? 0,
    c_type: data.c_type?.[index] ?? '-',
  }));
  return transformData<NPSMonthlyRow>(rows);
}

/**
 * Builds label/value summary rows from the scalar fields of an NPS statement.
 *
 * @param data - The raw NPS statement payload.
 * @returns Summary rows in display order.
 */
export function buildSummaryRows(data: NPSAnnux5): { label: string; value: string }[] {
  return [
    { label: 'Opening Balance', value: data.opening_bal },
    { label: 'Total Employee Contribution', value: String(data.tot_ampamt) },
    { label: 'Total Govt. Contribution', value: String(data.tot_gvtamt) },
    { label: 'Total Tier-I Amount', value: String(data.tot_tier1amt) },
    { label: 'Closing Balance', value: data.closing_bal },
    { label: 'Deposit', value: data.deposit },
  ];
}
```

- [ ] **Step 3: Create `index.ts`**

```typescript
export * from './financial-year';
export * from './transform';
```

- [ ] **Step 4: Verify types compile**

Run: `npx tsc --noEmit`
Expected: no errors

---

## Task 5: Update NPS hook and add hooks barrel

**Files:**

- Modify: `src/features/nps-statement/hooks/use-nps-statement.ts`
- Create: `src/features/nps-statement/hooks/index.ts`

- [ ] **Step 1: Add staleTime to the hook**

The hook already imports `METHODS, QUERY_KEYS` from `@utils/constants` and already has `select: (data) => data.data` at line 30. Make two precise edits in `use-nps-statement.ts`:

1. Change the import on line 4 from:

```typescript
import { METHODS, QUERY_KEYS } from '@utils/constants';
```

to:

```typescript
import { METHODS, QUERY_KEYS, STALE_TIMES } from '@utils/constants';
```

2. Add `staleTime: STALE_TIMES.NPS,` immediately after the existing `select: (data) => data.data,` line (do NOT duplicate the `select` line — it already exists):

- [ ] **Step 2: Create `hooks/index.ts`**

Export only the statement hook — the pre-existing `use-nps-fin-year.ts` (unused GPF-duplicate scaffolding) is intentionally NOT exported:

```typescript
export * from './use-nps-statement';
```

- [ ] **Step 3: Verify types compile**

Run: `npx tsc --noEmit`
Expected: no errors

---

## Task 6: Create member info card component

**Files:**

- Create: `src/features/nps-statement/components/nps-member-info-card.tsx`

- [ ] **Step 1: Create the component**

```tsx
import React from 'react';
import { View, Text } from 'react-native';
import { Card } from '@components/ui/card';
import { HugeiconsIcon } from '@hugeicons/react-native';
import {
  BadgeCheckIcon,
  Calendar02Icon,
  IdentityCardIcon,
  LandmarkIcon,
  UserSquareIcon,
} from '@hugeicons/core-free-icons';
import type { NPSAnnux5 } from '../types';

type Props = {
  /** Raw NPS statement payload used for member identity fields. */
  data: NPSAnnux5;
};

/**
 * Member information card for the NPS statement screen.
 *
 * Renders icon + label/value rows (Name, PRAN, PPAN, DoJ, regularisation,
 * office, designation, department, DDO code) in a flex-wrap grid, mirroring
 * the GPF employee information card. Values fall back to '-' when empty.
 *
 * @param props - Component props.
 */
export function NPSMemberInfoCard({ data }: Props) {
  const rows = [
    { icon: UserSquareIcon, label: 'Name', value: data.fname },
    { icon: IdentityCardIcon, label: 'PRAN', value: data.pran },
    { icon: BadgeCheckIcon, label: 'PPAN', value: data.ppan },
    { icon: Calendar02Icon, label: 'Date of Joining', value: data.date_of_joining },
    { icon: Calendar02Icon, label: 'Date of Regularisation', value: data.date_of_regularisation },
    { icon: LandmarkIcon, label: 'Office', value: data.office_name },
    { icon: BadgeCheckIcon, label: 'Designation', value: data.desig },
    { icon: LandmarkIcon, label: 'Department', value: data.dept },
    { icon: BadgeCheckIcon, label: 'DDO Code', value: data.ddo_code },
  ];

  return (
    <Card variant="elevated" className="p-lg">
      <Text className="mb-4 text-display-xs text-ink">Member Information</Text>
      <View className="flex-row flex-wrap gap-y-5">
        {rows.map((row) => (
          <View key={row.label} className="w-full flex-row items-start gap-sm">
            <View className="bg-primary-fixed/30 mt-0.5 rounded-md p-2">
              <HugeiconsIcon icon={row.icon} size={20} color="#024ad8" />
            </View>
            <View className="flex-1 gap-y-1">
              <Text className="text-caption-md text-graphite">{row.label}</Text>
              <Text className="text-body-emphasis" numberOfLines={1}>
                {row.value || '-'}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </Card>
  );
}
```

- [ ] **Step 2: Verify types compile**

Run: `npx tsc --noEmit`
Expected: no errors

---

## Task 7: Create monthly contribution table component

**Files:**

- Create: `src/features/nps-statement/components/nps-monthly-table.tsx`

- [ ] **Step 1: Create the component**

```tsx
import React from 'react';
import { View, Text } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import type { NPSMonthlyRow } from '../types';
import { NPS_MONTHLY_COLUMNS } from '../utils/constants';

type MonthlyRow = NPSMonthlyRow & { id: string };

type Props = {
  /** Zipped monthly rows to render. */
  data: MonthlyRow[];
};

/**
 * Horizontally scrollable NPS monthly contribution table.
 *
 * Mirrors the GPF monthly table: primary-colored header row, alternating row
 * backgrounds, and an emphasised Total column. Returns null when empty.
 *
 * @param props - Component props.
 */
export const NPSMonthlyTable = ({ data }: Props) => {
  if (!data || data.length === 0) return null;

  return (
    <View className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
      {/* Accent strip */}
      <View className="h-1 bg-primary" />

      {/* Title bar */}
      <View className="flex-row items-center justify-between px-md py-md">
        <View className="flex-row items-center gap-sm">
          <View className="h-4 w-0.5 rounded-full bg-primary" />
          <Text className="text-display-xs text-ink">NPS Monthly Contribution</Text>
        </View>
      </View>

      {/* Scrollable table */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} bounces={false}>
        <View>
          {/* Header row */}
          <View className="flex-row bg-primary">
            {NPS_MONTHLY_COLUMNS.map((col) => (
              <View key={col.key} style={{ minWidth: col.minWidth }} className="px-sm py-md">
                <Text className="text-caption-sm font-semibold uppercase tracking-wider text-white">
                  {col.label}
                </Text>
              </View>
            ))}
          </View>

          {/* Data rows */}
          {data.map((row, index) => (
            <View
              key={row.id}
              className={`flex-row border-t border-border ${
                index % 2 === 0 ? 'bg-surface' : 'bg-muted/20'
              }`}>
              {NPS_MONTHLY_COLUMNS.map((col) => {
                const value = row[col.key] ?? '-';
                return (
                  <View key={col.key} style={{ minWidth: col.minWidth }} className="px-sm py-md">
                    <Text
                      className={`text-caption-md ${
                        col.emphasis ? 'font-semibold text-primary' : 'font-medium text-ink'
                      }`}>
                      {value}
                    </Text>
                  </View>
                );
              })}
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};
```

- [ ] **Step 2: Verify types compile**

Run: `npx tsc --noEmit`
Expected: no errors

---

## Task 8: Create summary card component

**Files:**

- Create: `src/features/nps-statement/components/nps-summary-card.tsx`

- [ ] **Step 1: Create the component**

```tsx
import React from 'react';
import { View, Text } from 'react-native';
import { Card } from '@components/ui/card';

type SummaryRow = {
  label: string;
  value: string;
};

type Props = {
  /** Label/value rows in display order (from buildSummaryRows). */
  rows: SummaryRow[];
};

/**
 * Vertical summary card for the NPS statement screen.
 *
 * Renders label/value rows with hairline separators. Returns null when empty.
 *
 * @param props - Component props.
 */
export const NPSSummaryCard = ({ rows }: Props) => {
  if (!rows || rows.length === 0) return null;

  return (
    <Card variant="elevated" className="p-lg">
      <Text className="mb-4 text-display-xs text-ink">Summary</Text>
      <View className="flex-col">
        {rows.map((row, index) => (
          <View
            key={row.label}
            className={`flex-row items-center justify-between py-md ${
              index < rows.length - 1 ? 'border-b border-border' : ''
            }`}>
            <Text className="text-caption-md text-graphite">{row.label}</Text>
            <Text className="text-body-emphasis text-ink">{row.value || '-'}</Text>
          </View>
        ))}
      </View>
    </Card>
  );
};
```

- [ ] **Step 2: Verify types compile**

Run: `npx tsc --noEmit`
Expected: no errors

---

## Task 9: Create skeleton component and components barrel

**Files:**

- Create: `src/features/nps-statement/components/nps-statement-skeleton.tsx`
- Create: `src/features/nps-statement/components/index.ts`

- [ ] **Step 1: Create the skeleton**

```tsx
import React from 'react';
import { View } from 'react-native';
import { Card } from '@components/ui/card';
import { Skeleton } from '@components/ui/skeleton';

/**
 * Skeleton placeholder for the member information card (9 rows).
 */
const MemberInfoSkeleton = () => (
  <Card variant="elevated" className="p-lg">
    <View className="flex-row flex-wrap gap-y-5">
      {Array.from({ length: 9 }).map((_, i) => (
        <View key={i} className="w-full flex-row items-start gap-sm">
          <Skeleton className="mt-0.5 h-10 w-10 rounded-md" />
          <View className="flex-1 gap-y-1.5">
            <Skeleton className="h-3 w-14 rounded" />
            <Skeleton className="h-4 w-36 rounded" />
          </View>
        </View>
      ))}
    </View>
  </Card>
);

/**
 * Skeleton placeholder for the monthly contribution table (7 rows).
 */
const MonthlyTableSkeleton = () => (
  <Card variant="elevated">
    <View className="gap-y-2 p-4">
      {Array.from({ length: 7 }).map((_, i) => (
        <Skeleton key={i} className="h-6 w-full rounded" />
      ))}
    </View>
  </Card>
);

/**
 * Skeleton placeholder for the summary card (6 rows).
 */
const SummarySkeleton = () => (
  <Card variant="elevated">
    <View className="gap-y-2 p-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-6 w-full rounded" />
      ))}
    </View>
  </Card>
);

/**
 * Full-screen skeleton for the NPS statement loading state.
 *
 * Mirrors the loaded layout: member info card → monthly table → summary card.
 */
export const NpsStatementSkeleton = () => (
  <View className="gap-y-4">
    <MemberInfoSkeleton />
    <MonthlyTableSkeleton />
    <SummarySkeleton />
  </View>
);
```

- [ ] **Step 2: Create `index.ts`**

Export only the new components — the pre-existing `nps-fin-years.tsx` (unused GPF-duplicate scaffolding) is intentionally NOT exported:

```typescript
export * from './nps-member-info-card';
export * from './nps-monthly-table';
export * from './nps-summary-card';
export * from './nps-statement-skeleton';
```

- [ ] **Step 3: Verify types compile**

Run: `npx tsc --noEmit`
Expected: no errors

---

## Task 10: Build the screen

**Files:**

- Modify: `src/features/nps-statement/screens/nps-statements.tsx` (replace placeholder body)

- [ ] **Step 1: Replace the screen file content**

```tsx
import { Container } from '@components/layout';
import { EmptyScreen } from '@components/screens';
import React from 'react';
import { RefreshControl, ScrollView } from 'react-native';
import {
  NPSMemberInfoCard,
  NPSMonthlyTable,
  NPSSummaryCard,
  NpsStatementSkeleton,
} from '../components';
import { useNpsStatements } from '../hooks';
import { buildMonthlyRows, buildSummaryRows, getCurrentFinancialYear } from '../utils';

/**
 * NPS Statement (Annexure-5) screen.
 *
 * Fetches the current financial year's NPS statement via `get_annex5` RPC and
 * renders: member info card, monthly contribution table, and summary card.
 * Loading shows a skeleton; no data shows an empty state with a refresh action;
 * pull-to-refresh triggers a refetch.
 */
export const NpsStatementsScreen = () => {
  const financialYear = getCurrentFinancialYear();
  const { data, isLoading, refetch, isFetching } = useNpsStatements({ financialYear });

  if (isLoading) {
    return (
      <Container>
        <NpsStatementSkeleton />
      </Container>
    );
  }

  if (!data) {
    return (
      <Container>
        <EmptyScreen
          title="No NPS Statement"
          message={`No NPS Statement found for financial year ${financialYear}.`}
          refresh={refetch}
        />
      </Container>
    );
  }

  const monthlyRows = buildMonthlyRows(data);
  const summaryRows = buildSummaryRows(data);

  return (
    <Container>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ gap: 16 }}
        refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} />}
        showsVerticalScrollIndicator={false}>
        <NPSMemberInfoCard data={data} />
        {monthlyRows.length > 0 && <NPSMonthlyTable data={monthlyRows} />}
        {summaryRows.length > 0 && <NPSSummaryCard rows={summaryRows} />}
      </ScrollView>
    </Container>
  );
};
```

- [ ] **Step 2: Verify types compile**

Run: `npx tsc --noEmit`
Expected: no errors

---

## Task 11: Export from feature barrel and wire the route

**Files:**

- Modify: `src/features/nps-statement/index.ts`
- Modify: `src/app/nps-statements/index.tsx`

- [ ] **Step 1: Update feature barrel**

Replace the content of `src/features/nps-statement/index.ts` (currently just `// public exports`):

```typescript
// public exports
export * from './screens/nps-statements';
```

- [ ] **Step 2: Wire the route**

Replace the content of `src/app/nps-statements/index.tsx`:

```tsx
import { NpsStatementsScreen } from '@features/nps-statement';

export default function page() {
  return <NpsStatementsScreen />;
}
```

- [ ] **Step 3: Verify types compile**

Run: `npx tsc --noEmit`
Expected: no errors

---

## Task 12: Final verification and commit

**Files:** none

- [ ] **Step 1: Run lint**

Run: `npm run lint`
Expected: no errors (auto-fixes trivial issues)

- [ ] **Step 2: Run full type check**

Run: `npx tsc --noEmit`
Expected: no errors

- [ ] **Step 3: Verify no debug leftovers**

Check `src/features/nps-statement/screens/nps-statements.tsx` — confirm no stray `console.log` and no unused placeholder code remains (it was fully replaced in Task 10).

- [ ] **Step 4: Commit**

```bash
git add src/features/nps-statement src/app/nps-statements/index.tsx
git commit -m "feat: build NPS statement screen with member info, monthly table, and summary"
```

---

## Out of Scope / Notes

- **Financial year selector** intentionally omitted (user decision — hardcode current year). Two pre-existing scaffolding files, `components/nps-fin-years.tsx` and `hooks/use-nps-fin-year.ts`, are GPF-duplicate placeholders that reference GPF methods (`get_financial_year`) and GPF query keys; they are intentionally left unexported (hooks barrel and components barrel skip them) and unused. Do NOT delete them (out of scope), but do not wire them in.
- **Home tab** (`(drawers)/(tabs)/index.tsx`) left untouched (user decision).
- **Unit tests** not added — repo has no test framework; verification is tsc + lint + manual QA.
- `docs/design/prompt-nps-statements.md` already exists and documents this screen's target design; no doc changes needed.
- **`fin_year` format risk (validated manually)**: The plan sends `fin_year` = `"YYYY-YYYY"` (e.g. `2026-2027`). The only in-repo evidence is the pre-existing placeholder, which passed a bare year `'2025'`. If the backend expects a bare year instead of a range, change `getCurrentFinancialYear()` to return `String(getCurrentYear())` — one-line change, do it before/at Task 10 verification and confirm against a real logged-in session.
