# GPF Statement Screen Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a GPF statement screen showing employee info and a monthly data table.

**Architecture:** A screen component fetches data via the existing `useGpfStatements` hook, then delegates to an `EmployeeInfoCard` (using shared `Card` + `DetailRow`) and a new `MonthlyTable` component for the 12-row scrollable table.

**Tech Stack:** Expo React Native, NativeWind, TanStack React Query

## Global Constraints

- All new components use named exports
- Use the existing Text component from `@components/ui/text`
- Use Card/DetailRow from `@components/ui/card` / `@components/common`
- Follow the same Container → ScrollView → RefreshControl pattern as salary-statements-screen.tsx
- All column widths minimum 100px for readability

---

### Task 1: Create MonthlyTable Component

**Files:**

- Create: `src/features/gpf-statements/components/monthly-table.tsx`
- Create: `src/features/gpf-statements/components/index.ts`

**Interfaces:**

- Consumes: `MonthlyData` type from `../../types`
- Produces: `MonthlyTable` component accepting `data: MonthlyData[]` and `isFetching: boolean`

- [ ] **Step 1: Create the component barrel export**

`src/features/gpf-statements/components/index.ts`:

```typescript
export * from './monthly-table';
```

- [ ] **Step 2: Create MonthlyTable component**

`src/features/gpf-statements/components/monthly-table.tsx`:

```tsx
import React from 'react';
import { View, ScrollView } from 'react-native';
import { Card, CardContent } from '@components/ui/card';
import { Text } from '@components/ui/text';
import type { MonthlyData } from '../types';

const COLUMNS = [
  { key: 'Month', label: 'Month', minWidth: 100 },
  { key: 'Subscription', label: 'Subscription', minWidth: 120 },
  { key: 'Refund', label: 'Refund', minWidth: 100 },
  { key: 'Other', label: 'Other', minWidth: 100 },
  { key: 'Category', label: 'Category', minWidth: 100 },
  { key: 'Total', label: 'Total', minWidth: 100 },
  { key: 'Debit', label: 'Debit', minWidth: 100 },
  { key: 'Type', label: 'Type', minWidth: 100 },
] as const;

/**
 * Renders a horizontally scrollable table of monthly GPF data.
 *
 * Displays 12 rows (one per month) with alternating background colors.
 * The header row is rendered separately and scrolls horizontally along
 * with the data rows.
 *
 * @param data - Array of MonthlyData objects to display.
 */
export const MonthlyTable = ({ data }: { data: MonthlyData[] }) => {
  if (!data || data.length === 0) return null;

  return (
    <Card variant="bordered">
      <CardContent className="p-0">
        <ScrollView horizontal showsHorizontalScrollIndicator>
          <View>
            {/* Header row */}
            <View className="flex-row border-b border-gray-300 bg-gray-100">
              {COLUMNS.map((col) => (
                <View key={col.key} style={{ minWidth: col.minWidth }} className="px-3 py-2">
                  <Text variant="caption-bold" className="text-gray-700">
                    {col.label}
                  </Text>
                </View>
              ))}
            </View>

            {/* Data rows */}
            {data.map((row, index) => (
              <View
                key={row.Month}
                className={`flex-row border-b border-gray-200 ${
                  index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                }`}>
                {COLUMNS.map((col) => (
                  <View key={col.key} style={{ minWidth: col.minWidth }} className="px-3 py-2">
                    <Text variant="caption-md" className="text-foreground">
                      {row[col.key as keyof MonthlyData] || '-'}
                    </Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
        </ScrollView>
      </CardContent>
    </Card>
  );
};
```

- [ ] **Step 3: Commit**

```bash
git add src/features/gpf-statements/components/monthly-table.tsx src/features/gpf-statements/components/index.ts
git commit -m "feat: create MonthlyTable component for GPF statements"
```

---

### Task 2: Update GpfStatementScreen

**Files:**

- Modify: `src/features/gpf-statements/screens/gpf-statement-screens.tsx`

- [ ] **Step 1: Write the updated screen**

Replace the stub with the full screen implementation:

```tsx
import React from 'react';
import { ScrollView, RefreshControl, View } from 'react-native';
import { Container } from '@components/layout/container';
import { SectionHeader } from '@components/common';
import { Card, CardHeader, CardTitle, CardContent } from '@components/ui/card';
import { DetailRow } from '@components/common';
import { Text } from '@components/ui/text';
import { EmptyScreen } from '@components/screens';
import { useGpfStatements } from '../hooks';
import { MonthlyTable } from '../components/monthly-table';
import { GpfStatementSkeleton } from '../components/skeleton';

/**
 * Displays a GPF statement for the selected financial year.
 *
 * Renders employee information (treasury, DDO, DOB, interest rate)
 * followed by a horizontally scrollable table of monthly subscription,
 * refund, and deduction data.
 *
 * - Loading state: Skeleton placeholder
 * - Empty state: EmptyScreen with message and refresh action
 * - Data state: Employee info card + monthly data table
 * - Refreshing: Pull-to-refresh via RefreshControl
 */
export const GpfStatementScreen = () => {
  const {
    data: gpfStatements,
    isFetching,
    isLoading,
    refetch,
  } = useGpfStatements({
    financialYear: '2024-2025',
  });

  if (isLoading) {
    return (
      <Container className="flex-1">
        <SectionHeader title="GPF Statement" />
        <GpfStatementSkeleton />
      </Container>
    );
  }

  if (!gpfStatements) {
    return (
      <Container className="flex-1">
        <SectionHeader title="GPF Statement" />
        <EmptyScreen
          title="No GPF Statement Found"
          message="No GPF statement is available for the selected financial year."
          refresh={refetch}
        />
      </Container>
    );
  }

  const { emp, monthly_data } = gpfStatements;

  return (
    <Container className="flex-1">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl onRefresh={refetch} refreshing={isFetching} />}>
        <SectionHeader title="GPF Statement" />

        {/* Employee Information Card */}
        <Card variant="bordered" className="mb-4">
          <CardHeader>
            <CardTitle>Employee Information</CardTitle>
          </CardHeader>
          <CardContent>
            <DetailRow label="Treasury" value={emp.treasury} />
            <DetailRow label="DDO" value={emp.ddo} />
            <DetailRow label="Date of Birth" value={emp.dob} />
            <DetailRow label="Interest Rate" value={emp.interest_rate} />
          </CardContent>
        </Card>

        {/* Monthly Statement Section */}
        <Text variant="heading" size="lg" weight="semibold" className="mb-3 text-foreground">
          Monthly Statement
        </Text>

        <MonthlyTable data={monthly_data} />
      </ScrollView>
    </Container>
  );
};
```

- [ ] **Step 2: Commit**

```bash
git add src/features/gpf-statements/screens/gpf-statement-screens.tsx
git commit -m "feat: implement GPF statement screen with employee info and monthly table"
```

---

### Task 3: Create Skeleton Component

**Files:**

- Create: `src/features/gpf-statements/components/skeleton.tsx`

- [ ] **Step 1: Create the skeleton loading component**

`src/features/gpf-statements/components/skeleton.tsx`:

```tsx
import React from 'react';
import { View } from 'react-native';
import { Card, CardHeader, CardContent } from '@components/ui/card';
import { Skeleton } from '@components/ui/skeleton';

/**
 * Loading placeholder for the GPF statement screen.
 *
 * Renders a skeleton card for employee info and a skeleton table
 * area while the GPF statement data is being fetched.
 */
export const GpfStatementSkeleton = () => {
  return (
    <View className="gap-y-4">
      {/* Employee info skeleton */}
      <Card variant="bordered">
        <CardHeader>
          <Skeleton className="h-5 w-48" />
        </CardHeader>
        <CardContent className="gap-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-2/3" />
        </CardContent>
      </Card>

      {/* Table skeleton */}
      <Card variant="bordered">
        <CardContent className="gap-y-2">
          <Skeleton className="h-8 w-full" />
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-6 w-full" />
          ))}
        </CardContent>
      </Card>
    </View>
  );
};
```

- [ ] **Step 2: Update the components barrel export**

Add to `src/features/gpf-statements/components/index.ts`:

```typescript
export * from './monthly-table';
export * from './skeleton';
```

- [ ] **Step 3: Commit**

```bash
git add src/features/gpf-statements/components/skeleton.tsx src/features/gpf-statements/components/index.ts
git commit -m "feat: add GPF statement skeleton loading component"
```

---

### Task 4: Wire Route and Feature Exports

**Files:**

- Modify: `src/features/gpf-statements/index.ts`
- Modify: `src/app/gpf-statements/index.tsx`

- [ ] **Step 1: Export the screen from the feature barrel**

`src/features/gpf-statements/index.ts`:

```typescript
export { GpfStatementScreen } from './screens/gpf-statement-screens';
```

- [ ] **Step 2: Update the app route to use the screen**

`src/app/gpf-statements/index.tsx`:

```tsx
import { GpfStatementScreen } from '@features/gpf-statements';

export default function page() {
  return <GpfStatementScreen />;
}
```

- [ ] **Step 3: Commit**

```bash
git add src/features/gpf-statements/index.ts src/app/gpf-statements/index.tsx
git commit -m "feat: wire GPF statement screen to app route"
```
