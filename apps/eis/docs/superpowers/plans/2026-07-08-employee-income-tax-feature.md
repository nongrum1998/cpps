# Employee Income Tax Feature — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a complete Income Tax feature for government employees with a tax overview list, per-employee tax computation detail, and an edit form for tax-related fields. Accessible from both the drawer and employee detail page.

**Architecture:** New `income-tax` feature module following existing feature patterns (barrel exports, React Query hooks, RPC API calls). Three Expo Router screens with data fetched from backend. Drawer entry for admin users.

**Tech Stack:** Expo Router (file-based routing), React Native, TanStack React Query, react-hook-form + Zod, shadcn/hp design system, `@react-navigation/drawer`.

**Indian Income Tax Data (FY 2025-26 / AY 2026-27) used for reference:**

- New Regime slabs: 0-4L (nil), 4-8L (5%), 8-12L (10%), 12-16L (15%), 16-20L (20%), 20-24L (25%), 24L+ (30%)
- Old Regime slabs: 0-2.5L (nil), 2.5-5L (5%), 5-10L (20%), 10L+ (30%)
- Rebate 87A: New regime Rs 60,000 (income <= Rs 12L), Old regime Rs 12,500 (income <= Rs 5L)
- Standard Deduction: New Rs 75,000, Old Rs 50,000
- Health & Education Cess: 4% on (tax + surcharge)
- Surcharge: Up to Rs 50L (nil), Rs 50L-1Cr (10%), Rs 1Cr-2Cr (15%), Rs 2Cr-5Cr (25%), 5Cr+ (25% new / 37% old)

## Global Constraints

- All new files must follow the existing feature module pattern: `types/`, `hooks/`, `screens/`, `components/`, `utils/constants/`, `validators/`
- All exports must have JSDoc comments
- Use named exports over default exports (except Expo Router page files which must have default exports)
- Follow shadcn/hp design system: `rounded-md border border-gray-100 bg-white p-5 shadow-sm` card pattern
- Dark mode support required via `dark:` variants
- Indian number formatting (e.g., `Rs 12,75,000`) using `toLocaleString('en-IN')`
- All screens must handle loading, error, empty states
- RPC method names must be added to shared `METHODS` constant
- Query keys must be added to shared `QUERY_KEYS` factory
- Route paths must be added to shared `PAGE_ROUTES` factory
- Page headers must be configured in shared `PAGE_HEADERS` config

---

### Task 1: Add Tax RPC Methods, Query Keys, and Routes to Shared Config

**Files:**

- Modify: `src/shared/utils/constants/method.ts`
- Modify: `src/shared/utils/constants/query-keys.ts`
- Modify: `src/shared/utils/constants/routes.ts`
- Modify: `src/shared/config/page-headers.ts`

**Interfaces:**

- Consumes: Existing shared config pattern (METHODS, QUERY_KEYS, PAGE_ROUTES, PAGE_HEADERS)
- Produces: Registered RPC method names, query keys, route paths, and page header configs that all later tasks depend on

- [ ] **Step 1: Add RPC methods**

Add to `src/shared/utils/constants/method.ts`:

```typescript
export const METHODS = {
  // ... existing methods ...

  GET_EMP_TAX_LIST: 'get_employee_tax_list',
  GET_EMP_TAX_DETAIL: 'get_employee_tax_detail',
  UPDATE_EMP_TAX_DETAIL: 'update_employee_tax_detail',
} as const;
```

- [ ] **Step 2: Add query keys**

Add to `src/shared/utils/constants/query-keys.ts`:

```typescript
export const QUERY_KEYS = {
  // ... existing keys ...

  TAX: {
    LIST: (...args: (string | undefined)[]) => ['income-tax', ...args].filter(Boolean),
    DETAIL: (employeeId: string) => ['income-tax', employeeId] as const,
  },
};
```

And add stale time:

```typescript
export const STALE_TIMES = {
  // ... existing ...
  TAX: 1000 * 60 * 15, // 15 minutes
} as const;
```

- [ ] **Step 3: Add route constants**

Add to `src/shared/utils/constants/routes.ts`:

```typescript
export const PAGE_ROUTES = {
  // ... existing routes ...

  TAX: {
    LIST: '/tax' as const,
    DETAIL: (id: string) => `/employees/${id}/tax` as Route,
    EDIT: (id: string) => `/employees/${id}/tax/edit` as Route,
  },
};
```

- [ ] **Step 4: Add page headers**

Add to `src/shared/config/page-headers.ts`:

```typescript
export const PAGE_HEADERS = {
  // ... existing headers ...

  '/tax': { title: 'Income Tax', showBackButton: false, showDrawer: true },
  '/employees/[id]/tax': { title: 'Tax Computation', showBackButton: true },
  '/employees/[id]/tax/edit': { title: 'Edit Tax Details', showBackButton: true },
} as const satisfies Record<string, PageHeaderConfig>;
```

- [ ] **Step 5: Commit**

```bash
git add src/shared/utils/constants/method.ts src/shared/utils/constants/query-keys.ts src/shared/utils/constants/routes.ts src/shared/config/page-headers.ts
git commit -m "feat(tax): add RPC methods, query keys, routes, and page headers"
```

---

### Task 2: Create Income Tax Feature — Types

**Files:**

- Create: `src/features/income-tax/types/index.ts`
- Create: `src/features/income-tax/utils/constants/tax.endpoint.ts`
- Create: `src/features/income-tax/utils/constants/index.ts`

**Interfaces:**

- Consumes: `METHODS` from Task 1
- Produces: `EmployeeTaxDetail`, `EmployeeTaxSummary`, `UpdateTaxPayload`, `TaxRegime`, `FilingStatus`, `TaxSlabBreakdown` types and endpoint factory

- [ ] **Step 1: Create types file**

Write `src/features/income-tax/types/index.ts`:

```typescript
/**
 * Tax regime options under Indian Income Tax Act.
 * NEW = Section 115BAC (default), OLD = optional regime with deductions.
 */
export type TaxRegime = 'NEW' | 'OLD';

/**
 * Filing status of an employee's income tax return.
 */
export type FilingStatus = 'NOT_FILED' | 'FILED' | 'PROCESSED';

/**
 * Breakdown of tax for a single income slab.
 */
export type TaxSlabBreakdown = {
  /** Human-readable label like "Rs 4,00,001 - Rs 8,00,000" */
  label: string;
  /** Lower bound of the slab (inclusive) */
  minIncome: number;
  /** Upper bound of the slab (null = unlimited) */
  maxIncome: number | null;
  /** Tax rate percentage for this slab (e.g., 5, 10, 20) */
  rate: number;
  /** Amount of income taxable under this slab */
  taxableAmount: number;
  /** Tax computed for this slab */
  taxAtSlab: number;
};

/**
 * Full tax computation detail for an employee for a financial year.
 * Returned by the backend API via RPC.
 */
export type EmployeeTaxDetail = {
  id: string;
  employeeId: string;
  financialYear: string; // e.g. "2025-26"
  employeeName: string;
  designation: string;
  panNumber: string;
  department: string;

  // Income summary
  grossAnnualIncome: number;
  standardDeduction: number;
  taxableIncome: number;

  // Computation
  regime: TaxRegime;
  slabBreakdown: TaxSlabBreakdown[];
  baseTax: number;
  rebate87A: number;
  surcharge: number;
  cess: number;
  totalTax: number;
  effectiveTaxRate: number;

  // TDS / Payment
  tdsDeducted: number;
  taxPaid: number;
  taxPayable: number;

  // Old regime deduction inputs
  deductions80C: number;
  deductions80D: number;
  hraExemption: number;
  ltaExemption: number;
  homeLoanInterest: number;
  npsContribution: number;

  // Status
  filingStatus: FilingStatus;
  filedDate: string | null;

  createdAt: string;
  updatedAt: string;
};

/**
 * Summarized tax info for the list view.
 */
export type EmployeeTaxSummary = {
  employeeId: string;
  employeeName: string;
  designation: string;
  panNumber: string;
  grossAnnualIncome: number;
  totalTax: number;
  financialYear: string;
  regime: TaxRegime;
  filingStatus: FilingStatus;
};

/**
 * Payload for updating an employee's tax-related inputs.
 * Sent via RPC to the backend.
 */
export type UpdateTaxPayload = {
  regime: TaxRegime;
  deductions80C: number;
  deductions80D: number;
  hraExemption: number;
  ltaExemption: number;
  homeLoanInterest: number;
  npsContribution: number;
};
```

- [ ] **Step 2: Create endpoint constants**

Write `src/features/income-tax/utils/constants/tax.endpoint.ts`:

```typescript
/**
 * Income Tax Feature API Endpoints
 */
export const TAX_ENDPOINT = {
  LIST: '/tax',
  DETAIL: (employeeId: string) => `/tax/${employeeId}`,
  UPDATE: (employeeId: string) => `/tax/${employeeId}`,
} as const;
```

Write `src/features/income-tax/utils/constants/index.ts`:

```typescript
export { TAX_ENDPOINT } from './tax.endpoint';
```

- [ ] **Step 3: Commit**

```bash
git add src/features/income-tax/types/ src/features/income-tax/utils/
git commit -m "feat(tax): add types and endpoint constants"
```

---

### Task 3: Create Income Tax Hooks (React Query)

**Files:**

- Create: `src/features/income-tax/hooks/use-employee-taxes.ts`
- Create: `src/features/income-tax/hooks/use-employee-tax.ts`
- Create: `src/features/income-tax/hooks/use-update-tax-detail.ts`
- Create: `src/features/income-tax/hooks/index.ts`

**Interfaces:**

- Consumes: `EmployeeTaxDetail`, `EmployeeTaxSummary`, `UpdateTaxPayload` from Task 2; `METHODS`, `QUERY_KEYS`, `STALE_TIMES` from Task 1
- Produces: `useEmployeeTaxes()`, `useEmployeeTax(id)`, `useUpdateTaxDetail()` hooks

- [ ] **Step 1: Create list hook**

Write `src/features/income-tax/hooks/use-employee-taxes.ts`:

```typescript
import { useQuery } from '@tanstack/react-query';
import { rpc } from '@utils/api';
import { METHODS, QUERY_KEYS, STALE_TIMES } from '@utils/constants';
import { useAuthStore } from '@stores/auth.store';
import { transformData } from '@utils/helpers/transform-data';
import { EmployeeTaxSummary } from '../types';

/**
 * Fetches the list of all employees with their tax summaries.
 * Used by the Tax List screen.
 */
export function useEmployeeTaxes() {
  const { emp_cd, isSignedIn } = useAuthStore();

  const { data, isFetching, isError, error, refetch, isLoading } = useQuery({
    queryKey: QUERY_KEYS.TAX.LIST(emp_cd),
    queryFn: () => rpc<EmployeeTaxSummary[]>(METHODS.GET_EMP_TAX_LIST, { emp_cd }),
    staleTime: STALE_TIMES.TAX,
    select: (res) => res?.data,
    enabled: !!emp_cd && isSignedIn,
  });

  const transformedData = transformData<EmployeeTaxSummary>(data);

  return { data: transformedData, isFetching, isError, error, refetch, isLoading };
}
```

- [ ] **Step 2: Create detail hook**

Write `src/features/income-tax/hooks/use-employee-tax.ts`:

```typescript
import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { rpc } from '@utils/api';
import { METHODS, QUERY_KEYS, STALE_TIMES } from '@utils/constants';
import { useAuthStore } from '@stores/auth.store';
import { toast } from '@components/ui';
import { EmployeeTaxDetail } from '../types';

/**
 * Fetches the full tax computation detail for a specific employee.
 */
export function useEmployeeTax(employeeId: string) {
  const { emp_cd, isSignedIn } = useAuthStore();

  const query = useQuery({
    queryKey: QUERY_KEYS.TAX.DETAIL(employeeId),
    queryFn: () =>
      rpc<EmployeeTaxDetail>(METHODS.GET_EMP_TAX_DETAIL, {
        emp_cd,
        employee_id: employeeId,
      }),
    staleTime: STALE_TIMES.TAX,
    select: (res) => res?.data,
    enabled: !!employeeId && isSignedIn,
  });

  const { data, isFetching, isError, error, refetch, isLoading } = query;

  useEffect(() => {
    if (isError) {
      toast.error('Failed to Load Tax Data', {
        description: (error as any)?.message || 'Could not retrieve tax details',
      });
    }
  }, [isError, error]);

  return { data, isFetching, isError, error, refetch, isLoading };
}
```

- [ ] **Step 3: Create update mutation hook**

Write `src/features/income-tax/hooks/use-update-tax-detail.ts`:

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { rpc } from '@utils/api';
import { METHODS, QUERY_KEYS } from '@utils/constants';
import { useAuthStore } from '@stores/auth.store';
import { UpdateTaxPayload } from '../types';

/**
 * Mutation hook to update an employee's tax-related inputs.
 * Invalidates both the detail and list queries on success.
 */
export function useUpdateTaxDetail(employeeId: string) {
  const { emp_cd } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateTaxPayload) =>
      rpc<void>(METHODS.UPDATE_EMP_TAX_DETAIL, {
        emp_cd,
        employee_id: employeeId,
        ...payload,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TAX.DETAIL(employeeId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TAX.LIST(emp_cd) });
    },
  });
}
```

- [ ] **Step 4: Create hooks barrel export**

Write `src/features/income-tax/hooks/index.ts`:

```typescript
export { useEmployeeTaxes } from './use-employee-taxes';
export { useEmployeeTax } from './use-employee-tax';
export { useUpdateTaxDetail } from './use-update-tax-detail';
```

- [ ] **Step 5: Commit**

```bash
git add src/features/income-tax/hooks/
git commit -m "feat(tax): add React Query hooks"
```

---

### Task 4: Create Zod Validator for Tax Update Form

**Files:**

- Create: `src/features/income-tax/validators/tax.validator.ts`

**Interfaces:**

- Consumes: `UpdateTaxPayload` from Task 2
- Produces: Zod schema for the tax edit form with proper number validation

- [ ] **Step 1: Write the validator**

Write `src/features/income-tax/validators/tax.validator.ts`:

```typescript
import { z } from 'zod';

/**
 * Zod schema for the tax detail update form.
 * Validates deduction amounts are non-negative and within reasonable bounds.
 */
export const updateTaxSchema = z.object({
  regime: z.enum(['NEW', 'OLD'], { required_error: 'Please select a tax regime' }),
  deductions80C: z.coerce
    .number()
    .min(0, 'Cannot be negative')
    .max(150000, 'Max Rs 1,50,000 under Section 80C'),
  deductions80D: z.coerce
    .number()
    .min(0, 'Cannot be negative')
    .max(100000, 'Max Rs 1,00,000 under Section 80D'),
  hraExemption: z.coerce.number().min(0, 'Cannot be negative'),
  ltaExemption: z.coerce.number().min(0, 'Cannot be negative'),
  homeLoanInterest: z.coerce
    .number()
    .min(0, 'Cannot be negative')
    .max(200000, 'Max Rs 2,00,000 under Section 24(b)'),
  npsContribution: z.coerce
    .number()
    .min(0, 'Cannot be negative')
    .max(50000, 'Max Rs 50,000 under Section 80CCD(1B)'),
});

export type UpdateTaxFormValues = z.infer<typeof updateTaxSchema>;
```

- [ ] **Step 2: Commit**

```bash
git add src/features/income-tax/validators/
git commit -m "feat(tax): add Zod validator for tax update form"
```

---

### Task 5: Create Tax List Screen and Route

**Files:**

- Create: `src/features/income-tax/screens/tax-list-screen.tsx`
- Create: `src/features/income-tax/screens/index.ts`
- Create: `src/app/(drawers)/tax/index.tsx` (route file)
- Create: `src/features/income-tax/components/tax-summary-card.tsx`
- Create: `src/features/income-tax/components/index.ts`

**Interfaces:**

- Consumes: `useEmployeeTaxes()` from Task 3, `EmployeeTaxSummary` from Task 2, `PAGE_ROUTES.TAX` from Task 1
- Produces: Tax list screen with FlatList, pull-to-refresh, loading/empty states

- [ ] **Step 1: Create tax summary card component**

Write `src/features/income-tax/components/tax-summary-card.tsx`:

```typescript
import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Text } from '@components/ui/text';
import { EmployeeTaxSummary } from '../types';

/**
 * Card showing a summarized view of an employee's tax data.
 * Displays name, designation, PAN (masked), gross income, total tax, and filing status.
 */
export function TaxSummaryCard({
  item,
  onPress,
}: {
  item: EmployeeTaxSummary;
  onPress: () => void;
}) {
  const maskedPan =
    item.panNumber?.length >= 10
      ? `XXXX${item.panNumber.slice(-4)}`
      : item.panNumber || '-';

  const statusColors: Record<string, string> = {
    NOT_FILED: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    FILED: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    PROCESSED: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  };

  const statusLabels: Record<string, string> = {
    NOT_FILED: 'Not Filed',
    FILED: 'Filed',
    PROCESSED: 'Processed',
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      className="mb-3 rounded-md border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <View className="mb-3 flex-row items-center justify-between">
        <View className="flex-1">
          <Text className="text-base font-bold text-gray-900 dark:text-white">
            {item.employeeName}
          </Text>
          <Text className="text-xs text-gray-500">{item.designation}</Text>
        </View>
        <View className={`rounded-md px-3 py-1 ${statusColors[item.filingStatus] || ''}`}>
          <Text className="text-xs font-semibold">
            {statusLabels[item.filingStatus] || item.filingStatus}
          </Text>
        </View>
      </View>

      <View className="flex-row justify-between">
        <View>
          <Text className="text-xs font-medium uppercase text-gray-400">PAN</Text>
          <Text className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {maskedPan}
          </Text>
        </View>
        <View className="items-end">
          <Text className="text-xs font-medium uppercase text-gray-400">Gross Income</Text>
          <Text className="text-sm font-bold text-gray-900 dark:text-white">
            Rs {item.grossAnnualIncome.toLocaleString('en-IN')}
          </Text>
        </View>
      </View>

      <View className="mt-2 flex-row justify-between">
        <View className="flex-row items-center gap-1">
          <View
            className={`h-2 w-2 rounded-md ${item.regime === 'NEW' ? 'bg-blue-500' : 'bg-amber-500'}`}
          />
          <Text className="text-xs text-gray-500">{item.regime === 'NEW' ? 'New Regime' : 'Old Regime'}</Text>
        </View>
        <Text className="text-sm font-bold text-red-600 dark:text-red-400">
          Tax: Rs {item.totalTax.toLocaleString('en-IN')}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
```

- [ ] **Step 2: Create components barrel export**

Write `src/features/income-tax/components/index.ts`:

```typescript
export { TaxSummaryCard } from './tax-summary-card';
```

- [ ] **Step 3: Create tax list screen**

Write `src/features/income-tax/screens/tax-list-screen.tsx`:

```typescript
import React from 'react';
import { FlatList, RefreshControl } from 'react-native';
import { Container } from '@components/layout/container';
import { router } from 'expo-router';
import { useEmployeeTaxes } from '../hooks';
import { TaxSummaryCard } from '../components';
import { EmptyScreen } from '@components/screens';
import { SectionHeader } from '@components/common';
import { PAGE_ROUTES } from '@utils/constants/routes';
import { LoadingScreen } from '@components/screens/loading-screen';

/**
 * Tax List Screen — shows all employees with their income tax summary.
 * Accessed from the drawer menu "Income Tax".
 */
export default function TaxListScreen() {
  const { data: taxList, isLoading, isFetching, refetch } = useEmployeeTaxes();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!taxList || taxList.length === 0) {
    return (
      <EmptyScreen
        title="No Tax Records Found"
        message="Tax data is not yet available for any employee."
        refresh={refetch}
      />
    );
  }

  return (
    <Container className="flex-1">
      <FlatList
        data={taxList}
        keyExtractor={(item) => item.employeeId}
        refreshControl={
          <RefreshControl onRefresh={refetch} refreshing={isFetching} />
        }
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <TaxSummaryCard
            item={item}
            onPress={() => router.push(PAGE_ROUTES.TAX.DETAIL(item.employeeId))}
          />
        )}
      />
    </Container>
  );
}
```

- [ ] **Step 4: Create screen barrel export**

Write `src/features/income-tax/screens/index.ts`:

```typescript
export { default as TaxListScreen } from './tax-list-screen';
```

- [ ] **Step 5: Create route file**

Write `src/app/(drawers)/tax/index.tsx`:

```typescript
import TaxListScreen from '@features/income-tax/screens/tax-list-screen';
export default TaxListScreen;
```

- [ ] **Step 6: Commit**

```bash
git add src/features/income-tax/screens/tax-list-screen.tsx src/features/income-tax/screens/index.ts src/features/income-tax/components/tax-summary-card.tsx src/features/income-tax/components/index.ts "src/app/(drawers)/tax/index.tsx"
git commit -m "feat(tax): add tax list screen and route"
```

---

### Task 6: Create Employee Tax Detail Screen and Route

**Files:**

- Create: `src/features/income-tax/screens/employee-tax-detail-screen.tsx`
- Create: `src/features/income-tax/components/tax-slab-breakdown.tsx`
- Create: `src/app/employees/[id]/tax/index.tsx` (route file)

**Interfaces:**

- Consumes: `useEmployeeTax(id)` from Task 3, `EmployeeTaxDetail` from Task 2, `PAGE_ROUTES.TAX` from Task 1
- Produces: Full tax computation breakdown screen with slab table, regime badge, payment summary, edit button

- [ ] **Step 1: Create tax slab breakdown component**

Write `src/features/income-tax/components/tax-slab-breakdown.tsx`:

```typescript
import React from 'react';
import { View } from 'react-native';
import { Text } from '@components/ui/text';
import { TaxSlabBreakdown } from '../types';

/**
 * Displays the tax slab-by-slab breakdown table.
 * Each row shows: slab label, rate, taxable amount, and tax at slab.
 */
export function TaxSlabBreakdownTable({ slabs }: { slabs: TaxSlabBreakdown[] }) {
  return (
    <View className="rounded-md bg-gray-50 p-3 dark:bg-gray-800">
      {/* Header */}
      <View className="mb-2 flex-row border-b border-gray-200 pb-2 dark:border-gray-700">
        <Text className="flex-[2] text-xs font-bold uppercase text-gray-500">Slab</Text>
        <Text className="flex-1 text-right text-xs font-bold uppercase text-gray-500">Rate</Text>
        <Text className="flex-1 text-right text-xs font-bold uppercase text-gray-500">Amount</Text>
        <Text className="flex-1 text-right text-xs font-bold uppercase text-gray-500">Tax</Text>
      </View>
      {/* Rows */}
      {slabs.map((slab, index) => (
        <View
          key={index}
          className={`flex-row py-2 ${index < slabs.length - 1 ? 'border-b border-gray-100 dark:border-gray-700/50' : ''}`}>
          <Text className="flex-[2] text-xs text-gray-700 dark:text-gray-300">
            {slab.label}
          </Text>
          <Text className="flex-1 text-right text-xs font-medium text-gray-700 dark:text-gray-300">
            {slab.rate}%
          </Text>
          <Text className="flex-1 text-right text-xs text-gray-600 dark:text-gray-400">
            Rs {slab.taxableAmount.toLocaleString('en-IN')}
          </Text>
          <Text className="flex-1 text-right text-xs font-semibold text-gray-900 dark:text-white">
            Rs {slab.taxAtSlab.toLocaleString('en-IN')}
          </Text>
        </View>
      ))}
    </View>
  );
}
```

- [ ] **Step 2: Create employee tax detail screen**

Write `src/features/income-tax/screens/employee-tax-detail-screen.tsx`:

```typescript
import React from 'react';
import { View, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { Container } from '@components/layout/container';
import { Text } from '@components/ui/text';
import { useLocalSearchParams, router } from 'expo-router';
import { LoadingScreen } from '@components/screens/loading-screen';
import { GovtHeader } from '@components/common/govt-header';
import { SummaryCard } from '@components/common/summary-card';
import { SectionHeader } from '@components/common/section-header';
import { DetailRow } from '@components/common/detail-row';
import { PAGE_ROUTES } from '@utils/constants/routes';
import { useEmployeeTax } from '../hooks';
import { TaxSlabBreakdownTable } from '../components/tax-slab-breakdown';

/**
 * Employee Tax Detail Screen — full tax computation breakdown.
 * Accessed from the tax list or employee detail page.
 */
export default function EmployeeTaxDetailScreen() {
  const { id } = useLocalSearchParams();
  const employeeId = id?.toString() || '';

  const { data, isFetching, isLoading, refetch } = useEmployeeTax(employeeId);

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!data) {
    return (
      <Container className="flex-1 items-center justify-center p-6">
        <Text className="text-gray-500">No tax data available for this employee.</Text>
      </Container>
    );
  }

  return (
    <Container className="flex-1">
      <ScrollView
        refreshControl={<RefreshControl onRefresh={refetch} refreshing={isFetching} />}
        className="flex-1 px-6 pt-6"
        showsVerticalScrollIndicator={false}>

        {/* Government Header */}
        <GovtHeader
          title={data.employeeName}
          subtitle={data.designation}
          badge={`FY ${data.financialYear}`}
        />

        {/* Summary Card */}
        <SummaryCard
          label="Total Income Tax"
          amount={`Rs ${data.totalTax.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
        />

        {/* Employee Particulars */}
        <View className="mb-6 rounded-md border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <Text className="mb-4 text-xs font-bold uppercase tracking-wider text-gray-400">
            Employee Particulars
          </Text>
          <DetailRow label="Name" value={data.employeeName} />
          <DetailRow label="Designation" value={data.designation} />
          <DetailRow label="PAN" value={data.panNumber} />
          <DetailRow label="Department" value={data.department} />
        </View>

        {/* Income Summary */}
        <View className="mb-6 rounded-md border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <SectionHeader title="Income Summary" />
          <DetailRow label="Gross Annual Income" value={`Rs ${data.grossAnnualIncome.toLocaleString('en-IN')}`} />
          <DetailRow label="Standard Deduction" value={`Rs ${data.standardDeduction.toLocaleString('en-IN')}`} />
          <DetailRow label="Taxable Income" value={`Rs ${data.taxableIncome.toLocaleString('en-IN')}`} isBold />
        </View>

        {/* Regime & Slab Breakdown */}
        <View className="mb-6 rounded-md border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <View className="mb-4 flex-row items-center justify-between">
            <SectionHeader title="Tax Computation" />
            <View className={`rounded-md px-3 py-1 ${data.regime === 'NEW' ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-amber-100 dark:bg-amber-900/30'}`}>
              <Text className={`text-xs font-bold ${data.regime === 'NEW' ? 'text-blue-700 dark:text-blue-400' : 'text-amber-700 dark:text-amber-400'}`}>
                {data.regime === 'NEW' ? 'New Regime' : 'Old Regime'}
              </Text>
            </View>
          </View>
          <TaxSlabBreakdownTable slabs={data.slabBreakdown} />
          <View className="mt-4 rounded-md bg-gray-50 p-3 dark:bg-gray-800">
            <DetailRow label="Base Tax" value={`Rs ${data.baseTax.toLocaleString('en-IN')}`} />
            <DetailRow label="Rebate u/s 87A" value={`Rs ${data.rebate87A.toLocaleString('en-IN')}`} isNegative={data.rebate87A > 0} />
            <DetailRow label="Surcharge" value={`Rs ${data.surcharge.toLocaleString('en-IN')}`} />
            <DetailRow label="Health & Education Cess (4%)" value={`Rs ${data.cess.toLocaleString('en-IN')}`} />
            <DetailRow label="Total Tax Liability" value={`Rs ${data.totalTax.toLocaleString('en-IN')}`} isBold />
            <DetailRow label="Effective Tax Rate" value={`${data.effectiveTaxRate.toFixed(2)}%`} />
          </View>
        </View>

        {/* Old Regime Deductions (if applicable) */}
        {data.regime === 'OLD' && (
          <View className="mb-6 rounded-md border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <SectionHeader title="Deductions Claimed" />
            <DetailRow label="Section 80C (PF, ELSS, Insurance)" value={`Rs ${data.deductions80C.toLocaleString('en-IN')}`} />
            <DetailRow label="Section 80D (Health Insurance)" value={`Rs ${data.deductions80D.toLocaleString('en-IN')}`} />
            <DetailRow label="HRA Exemption" value={`Rs ${data.hraExemption.toLocaleString('en-IN')}`} />
            <DetailRow label="LTA Exemption" value={`Rs ${data.ltaExemption.toLocaleString('en-IN')}`} />
            <DetailRow label="Home Loan Interest u/s 24(b)" value={`Rs ${data.homeLoanInterest.toLocaleString('en-IN')}`} />
            <DetailRow label="NPS u/s 80CCD(1B)" value={`Rs ${data.npsContribution.toLocaleString('en-IN')}`} />
          </View>
        )}

        {/* Payment Summary */}
        <View className="mb-6 rounded-md border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <SectionHeader title="Payment Summary" />
          <DetailRow label="TDS Deducted" value={`Rs ${data.tdsDeducted.toLocaleString('en-IN')}`} />
          <DetailRow label="Tax Paid (Self-Assessment)" value={`Rs ${data.taxPaid.toLocaleString('en-IN')}`} />
          <DetailRow
            label="Tax Payable"
            value={`Rs ${data.taxPayable.toLocaleString('en-IN')}`}
            isBold
          />
          <View className="mt-3 flex-row items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
            <Text className="text-xs font-medium uppercase text-gray-500">Filing Status</Text>
            <Text
              className={`text-sm font-bold ${
                data.filingStatus === 'PROCESSED'
                  ? 'text-green-600'
                  : data.filingStatus === 'FILED'
                    ? 'text-amber-600'
                    : 'text-red-600'
              }`}>
              {data.filingStatus === 'NOT_FILED'
                ? 'Not Filed'
                : data.filingStatus === 'FILED'
                  ? 'Filed'
                  : 'Processed'}
            </Text>
          </View>
        </View>

        {/* Edit Button */}
        <TouchableOpacity
          onPress={() => router.push(PAGE_ROUTES.TAX.EDIT(employeeId))}
          className="mb-10 flex-row items-center justify-center rounded-md bg-blue-600 p-4">
          <Text className="font-semibold text-white">Edit Tax Details</Text>
        </TouchableOpacity>

      </ScrollView>
    </Container>
  );
}
```

- [ ] **Step 3: Create the route file**

Create directory `src/app/employees/[id]/tax/` and write `index.tsx`:

```typescript
import EmployeeTaxDetailScreen from '@features/income-tax/screens/employee-tax-detail-screen';
export default EmployeeTaxDetailScreen;
```

- [ ] **Step 4: Commit**

```bash
git add src/features/income-tax/screens/employee-tax-detail-screen.tsx src/features/income-tax/components/tax-slab-breakdown.tsx "src/app/employees/[id]/tax/index.tsx"
git commit -m "feat(tax): add employee tax detail screen and route"
```

---

### Task 7: Create Edit Tax Detail Screen and Route

**Files:**

- Create: `src/features/income-tax/screens/edit-tax-detail-screen.tsx`
- Create: `src/app/employees/[id]/tax/edit.tsx` (route file)

**Interfaces:**

- Consumes: `useEmployeeTax(id)` and `useUpdateTaxDetail(id)` from Task 3; `updateTaxSchema` from Task 4; `PAGE_ROUTES.TAX` from Task 1
- Produces: Editable form screen for tax-related inputs with validation, success/error toasts, and redirect back to detail

- [ ] **Step 1: Create edit screen**

Write `src/features/income-tax/screens/edit-tax-detail-screen.tsx`:

```typescript
import React, { useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Container } from '@components/layout/container';
import { Text } from '@components/ui/text';
import { Input } from '@components/ui/input';
import { router, useLocalSearchParams } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from '@components/ui';
import { SectionHeader } from '@components/common/section-header';
import { LoadingScreen } from '@components/screens/loading-screen';
import { useEmployeeTax, useUpdateTaxDetail } from '../hooks';
import { updateTaxSchema, UpdateTaxFormValues } from '../validators/tax.validator';

/**
 * Edit Tax Detail Screen — form to update an employee's tax-related inputs.
 * Pre-populated with current values. Validates before submit.
 */
export default function EditTaxDetailScreen() {
  const { id } = useLocalSearchParams();
  const employeeId = id?.toString() || '';

  const { data, isLoading } = useEmployeeTax(employeeId);
  const updateMutation = useUpdateTaxDetail(employeeId);

  const { control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<UpdateTaxFormValues>({
    resolver: zodResolver(updateTaxSchema),
    defaultValues: {
      regime: 'NEW',
      deductions80C: 0,
      deductions80D: 0,
      hraExemption: 0,
      ltaExemption: 0,
      homeLoanInterest: 0,
      npsContribution: 0,
    },
  });

  // Pre-populate form when data loads
  useEffect(() => {
    if (data) {
      reset({
        regime: data.regime,
        deductions80C: data.deductions80C,
        deductions80D: data.deductions80D,
        hraExemption: data.hraExemption,
        ltaExemption: data.ltaExemption,
        homeLoanInterest: data.homeLoanInterest,
        npsContribution: data.npsContribution,
      });
    }
  }, [data, reset]);

  const onSubmit = async (values: UpdateTaxFormValues) => {
    try {
      await updateMutation.mutateAsync(values);
      toast.success('Tax Details Updated', {
        description: 'The employee tax details have been saved successfully.',
      });
      router.back();
    } catch (err: any) {
      toast.error('Update Failed', {
        description: err?.message || 'Could not update tax details. Please try again.',
      });
    }
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <Container className="flex-1">
      <ScrollView className="flex-1 px-6 pt-6" showsVerticalScrollIndicator={false}>

        {/* Regime Selection */}
        <View className="mb-6 rounded-md border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <SectionHeader title="Tax Regime" />
          <Text className="mb-3 text-xs text-gray-500">
            Select the tax regime applicable for this employee.
          </Text>
          <View className="flex-row gap-3">
            <Controller
              control={control}
              name="regime"
              render={({ field: { onChange, value } }) => (
                <>
                  <TouchableOpacity
                    onPress={() => onChange('NEW')}
                    className={`flex-1 rounded-md p-4 ${
                      value === 'NEW'
                        ? 'bg-blue-600'
                        : 'border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800'
                    }`}>
                    <Text
                      className={`text-center text-sm font-bold ${
                        value === 'NEW' ? 'text-white' : 'text-gray-700 dark:text-gray-300'
                      }`}>
                      New Regime
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => onChange('OLD')}
                    className={`flex-1 rounded-md p-4 ${
                      value === 'OLD'
                        ? 'bg-amber-600'
                        : 'border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800'
                    }`}>
                    <Text
                      className={`text-center text-sm font-bold ${
                        value === 'OLD' ? 'text-white' : 'text-gray-700 dark:text-gray-300'
                      }`}>
                      Old Regime
                    </Text>
                  </TouchableOpacity>
                </>
              )}
            />
          </View>
          {errors.regime && (
            <Text className="mt-1 text-xs text-red-500">{errors.regime.message}</Text>
          )}
        </View>

        {/* Deductions Section */}
        <View className="mb-6 rounded-md border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <SectionHeader title="Deductions (Old Regime)" />
          <Text className="mb-4 text-xs text-gray-500">
            Enter the deduction amounts claimed by the employee.
          </Text>

          <Controller
            control={control}
            name="deductions80C"
            render={({ field: { onChange, value } }) => (
              <Input
                label="Section 80C"
                placeholder="Max Rs 1,50,000"
                keyboardType="numeric"
                value={String(value)}
                onChangeText={(v) => onChange(v)}
                error={errors.deductions80C?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="deductions80D"
            render={({ field: { onChange, value } }) => (
              <Input
                label="Section 80D (Health Insurance)"
                placeholder="Max Rs 1,00,000"
                keyboardType="numeric"
                value={String(value)}
                onChangeText={(v) => onChange(v)}
                error={errors.deductions80D?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="hraExemption"
            render={({ field: { onChange, value } }) => (
              <Input
                label="HRA Exemption"
                placeholder="Enter amount"
                keyboardType="numeric"
                value={String(value)}
                onChangeText={(v) => onChange(v)}
                error={errors.hraExemption?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="ltaExemption"
            render={({ field: { onChange, value } }) => (
              <Input
                label="LTA Exemption"
                placeholder="Enter amount"
                keyboardType="numeric"
                value={String(value)}
                onChangeText={(v) => onChange(v)}
                error={errors.ltaExemption?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="homeLoanInterest"
            render={({ field: { onChange, value } }) => (
              <Input
                label="Home Loan Interest u/s 24(b)"
                placeholder="Max Rs 2,00,000"
                keyboardType="numeric"
                value={String(value)}
                onChangeText={(v) => onChange(v)}
                error={errors.homeLoanInterest?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="npsContribution"
            render={({ field: { onChange, value } }) => (
              <Input
                label="NPS u/s 80CCD(1B)"
                placeholder="Max Rs 50,000"
                keyboardType="numeric"
                value={String(value)}
                onChangeText={(v) => onChange(v)}
                error={errors.npsContribution?.message}
              />
            )}
          />
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          onPress={handleSubmit(onSubmit)}
          disabled={isSubmitting || updateMutation.isPending}
          className={`mb-10 flex-row items-center justify-center rounded-md p-4 ${
            isSubmitting || updateMutation.isPending ? 'bg-blue-400' : 'bg-blue-600'
          }`}>
          {isSubmitting || updateMutation.isPending ? (
            <ActivityIndicator color="white" className="mr-2" />
          ) : null}
          <Text className="font-semibold text-white">
            {isSubmitting || updateMutation.isPending ? 'Saving...' : 'Save Tax Details'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </Container>
  );
}
```

- [ ] **Step 2: Create the route file**

Write `src/app/employees/[id]/tax/edit.tsx`:

```typescript
import EditTaxDetailScreen from '@features/income-tax/screens/edit-tax-detail-screen';
export default EditTaxDetailScreen;
```

- [ ] **Step 3: Commit**

```bash
git add src/features/income-tax/screens/edit-tax-detail-screen.tsx "src/app/employees/[id]/tax/edit.tsx"
git commit -m "feat(tax): add edit tax detail screen and route"
```

---

### Task 8: Add Drawer Entry for Income Tax

**Files:**

- Modify: `src/shared/components/layout/custom-drawer-content.tsx`

**Interfaces:**

- Consumes: `PAGE_ROUTES.TAX` from Task 1
- Produces: "Income Tax" menu item in the admin drawer menu

- [ ] **Step 1: Add Income Tax to admin drawer items**

In `src/shared/components/layout/custom-drawer-content.tsx`, add the Income Tax item to the `adminDrawerMenuItems` array:

```typescript
const adminDrawerMenuItems: MenuItemsT[] = [
  { id: 1, title: 'Home', href: '/' },
  { id: 2, title: 'Employees', href: '/employees' },
  { id: 3, title: 'Income Tax', href: '/tax' },
  { id: 4, title: 'Settings', href: '/settings' },
  { id: 5, title: 'Announcements', href: '/announcements' },
];
```

- [ ] **Step 2: Commit**

```bash
git add src/shared/components/layout/custom-drawer-content.tsx
git commit -m "feat(tax): add Income Tax entry to drawer navigation"
```

---

### Task 9: Create Feature Barrel Export

**Files:**

- Create: `src/features/income-tax/index.ts` (barrel export)

**Interfaces:**

- Consumes: All hooks, screens, types, constants from Tasks 2-7
- Produces: Clean public API for the feature module

- [ ] **Step 1: Create barrel export**

Write `src/features/income-tax/index.ts`:

```typescript
// Public API
export * from './utils/constants';
export * from './components';
export * from './hooks';
export * from './screens';
export * from './types';
export * from './validators/tax.validator';
```

- [ ] **Step 2: Commit**

```bash
git add src/features/income-tax/index.ts
git commit -m "feat(tax): add feature barrel export"
```

---

### Task 10: End-to-End Verification

**Files:** No file changes — verification only.

- [ ] **Step 1: Verify drawer navigation**

Open the app, log in as admin/SUPER_ADMIN, open the drawer. Verify "Income Tax" appears in the menu. Tap it. Verify it navigates to `/tax` and renders the tax list screen.

- [ ] **Step 2: Verify tax list screen**

Verify the tax list loads employee tax summaries. If data is available, verify cards render with correct info. Verify pull-to-refresh works. Verify empty state displays when no data.

- [ ] **Step 3: Verify tax detail screen**

Tap an employee card. Verify navigation to `/employees/[id]/tax`. Verify all sections render: income summary, slab breakdown, tax computation, payment summary. Verify regime badge is correct.

- [ ] **Step 4: Verify edit screen**

Tap "Edit Tax Details" button. Verify navigation to `/employees/[id]/tax/edit`. Verify form is pre-populated. Change a value and save. Verify toast success and navigation back to detail screen.

- [ ] **Step 5: Verify back navigation**

Verify back button works on all three new screens. Verify drawer entry still works after navigation chain.

- [ ] **Step 6: Verify error states**

Test with network off — verify toast error and appropriate UI state. Verify loading indicators display during data fetch.

- [ ] **Step 7: Verify TypeScript**

Run to verify no type errors:

```bash
npx tsc --noEmit
```

- [ ] **Step 8: Commit**

```bash
git commit --allow-empty -m "chore(tax): end-to-end verification complete"
```

---

## Summary of Files Created/Modified

| Action | File                                                             |
| ------ | ---------------------------------------------------------------- |
| Modify | `src/shared/utils/constants/method.ts`                           |
| Modify | `src/shared/utils/constants/query-keys.ts`                       |
| Modify | `src/shared/utils/constants/routes.ts`                           |
| Modify | `src/shared/config/page-headers.ts`                              |
| Create | `src/features/income-tax/types/index.ts`                         |
| Create | `src/features/income-tax/utils/constants/tax.endpoint.ts`        |
| Create | `src/features/income-tax/utils/constants/index.ts`               |
| Create | `src/features/income-tax/hooks/use-employee-taxes.ts`            |
| Create | `src/features/income-tax/hooks/use-employee-tax.ts`              |
| Create | `src/features/income-tax/hooks/use-update-tax-detail.ts`         |
| Create | `src/features/income-tax/hooks/index.ts`                         |
| Create | `src/features/income-tax/validators/tax.validator.ts`            |
| Create | `src/features/income-tax/components/tax-summary-card.tsx`        |
| Create | `src/features/income-tax/components/tax-slab-breakdown.tsx`      |
| Create | `src/features/income-tax/components/index.ts`                    |
| Create | `src/features/income-tax/screens/tax-list-screen.tsx`            |
| Create | `src/features/income-tax/screens/employee-tax-detail-screen.tsx` |
| Create | `src/features/income-tax/screens/edit-tax-detail-screen.tsx`     |
| Create | `src/features/income-tax/screens/index.ts`                       |
| Create | `src/features/income-tax/index.ts`                               |
| Create | `src/app/(drawers)/tax/index.tsx`                                |
| Create | `src/app/employees/[id]/tax/index.tsx`                           |
| Create | `src/app/employees/[id]/tax/edit.tsx`                            |
| Modify | `src/shared/components/layout/custom-drawer-content.tsx`         |

## Self-Review Checklist

- [ ] **Spec coverage:** Every requirement maps to a task — tax list (Task 5), tax detail (Task 6), tax edit (Task 7), drawer entry (Task 8)
- [ ] **Placeholder scan:** No TBD, TODO, or incomplete code blocks
- [ ] **Type consistency:** `EmployeeTaxDetail`, `EmployeeTaxSummary`, `UpdateTaxPayload`, `UpdateTaxFormValues` are consistent across Tasks 2, 3, 4, 5, 6, 7
- [ ] **Route consistency:** `PAGE_ROUTES.TAX.LIST`, `.DETAIL(id)`, `.EDIT(id)` used consistently in Task 1 and all consumers
- [ ] **Hook signatures:** `useEmployeeTaxes()`, `useEmployeeTax(id)`, `useUpdateTaxDetail(id)` match across Tasks 3 and consumers 5, 6, 7
