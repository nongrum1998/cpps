# Loan List & Detail Screens Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a loan list screen and a loan detail screen to the EIS mobile app, navigating from a loan card to the detail screen via the `loan_id` URL query param, following the existing leave/tax screen patterns.

**Architecture:** The `loan` feature already has its data layer (`use-loans.ts`, `use-loan.ts`, types). This plan adds the presentation layer: a list-slot card component, list/detail screens, per-screen skeletons, feature barrel exports, a new expo-router route group (`src/app/loans/`), and shared navigation/header registration. Navigation follows the existing leave pattern — the detail route is `/loans/detail` with query params built via `buildUrlWithQuery`, so `PAGE_ROUTES.LOAN.DETAILS({ loan_id })` produces `/loans/detail?loan_id=...`.

**Tech Stack:** React Native, Expo Router v6, TypeScript (strict), NativeWind (Tailwind), TanStack React Query, @hugeicons/icons, shared UI (`Card`, `DetailRow`, `Skeleton`, `EmptyScreen`, `Container`, `SectionHeader`).

## Global Constraints

- TypeScript strict mode; every exported symbol needs a detailed JSDoc comment (what it does, how to use, side effects/edge cases).
- Follow existing feature layout: components live in `src/features/<feature>/components/`, screens in `src/features/<feature>/screens/`, each with an `index.ts` barrel.
- Route wrappers under `src/app/<route>/` are thin default-export functions; all screen logic lives in the feature `screens/`.
- Reuse shared primitives: `Container` (`@components/layout`), `Card` (`@components/ui`), `DetailRow` (`@components/common`), `Skeleton` (`@components/ui/skeleton`), `EmptyScreen` (`@components/screens`), `SectionHeader` (`@components/common`).
- Do NOT add any shared navigation entry (no drawer/tab/home change) — these screens are reached by deep-link only (per user decision).
- `PAGE_ROUTES` additions must be `as Route` typed (mirror existing `LEAVE` entries).
- No hardcoded strings for currency: prefix amounts with `Rs ` via a `formatAmount` helper that avoids double-prefixing.

> [!WARNING]
> The repo currently has **pre-existing, unrelated TypeScript errors** in the `e-pay-slip` and `auth` features (e.g. `expo-file-system` API mismatches, missing `../utils/download-e-payslip-pdf` module). `npx tsc --noEmit` will report these and exit non-zero repo-wide. For every `npx tsc --noEmit` verification step, the pass gate is: **no new errors reference the files created/modified by this plan** — pre-existing errors in `e-pay-slip`/`auth` are expected and must NOT be fixed in this scope.
>
> Also note: the repo has `experiments.typedRoutes: true` (Expo Router typed routes). If `npx tsc --noEmit` reports errors like `'/loans' is not assignable to type Href` before Task 5's route files exist, regenerate typed routes first by running `npx expo start` once (this writes `.expo/types/router.d.ts`), then re-run `npx tsc --noEmit`. In practice `PAGE_ROUTES.LEAVE` already compiles today with the same pattern, so this is a fallback, not a blocker.

---

## File Structure Map

**Create (`src/features/loan/`):**

- `components/loan-card.tsx` — list row card; pushes detail route with `loan_id`
- `components/skeleton/loan-list-skeleton.tsx` — list loading skeleton
- `components/skeleton/loan-detail-skeleton.tsx` — detail loading skeleton
- `components/index.ts` — component barrel
- `components/skeleton/index.ts` — skeleton barrel
- `screens/loan-list-screen.tsx` — list screen using `useLoans()`
- `screens/loan-detail-screen.tsx` — detail screen using `useLoan()`
- `screens/index.ts` — screen barrel

**Create (`src/app/loans/`):**

- `_layout.tsx` — `StackHeaderLayout`
- `index.tsx` — route wrapper → `LoansScreen`
- `detail/index.tsx` — route wrapper → `LoanDetailScreen`

**Modify:**

- `src/features/loan/index.ts` — export components, hooks, screens, types
- `src/shared/utils/constants/routes.ts` — add `PAGE_ROUTES.LOAN`
- `src/shared/config/page-headers.ts` — add `/loans` & `/loans/detail` header entries

---

### Task 1: Add loan navigation route + page-header constants

**Files:**

- Modify: `src/shared/utils/constants/routes.ts`
- Modify: `src/shared/config/page-headers.ts`

**Interfaces:**

- Produces: `PAGE_ROUTES.LOAN.LIST` (`'/loans'`) and `PAGE_ROUTES.LOAN.DETAILS(params?: Record<string,string>)` returning a `Route` (`/loans/detail?loan_id=...`). Header config entries for the two paths.

- [ ] **Step 1: Add `LOAN` to `PAGE_ROUTES`**

In `src/shared/utils/constants/routes.ts`, directly after the closing `},` of the `LEAVE` block (before `STATEMENT`), add:

```ts
  LOAN: {
    /** Main loan list screen. */
    LIST: '/loans' as const,
    /** Individual loan detail view, keyed by the `loan_id` query param. */
    DETAILS: (params?: Record<string, string>) =>
      buildUrlWithQuery(`/loans/detail`, { ...params }) as Route,
  },
```

- [ ] **Step 2: Add page-header entries**

In `src/shared/config/page-headers.ts`, inside the `PAGE_HEADERS` object (after the `'/tax/create'` line), add:

```ts
  '/loans': { title: 'My Loans', showBackButton: true },
  '/loans/detail': { title: 'Loan Details', showBackButton: true },
```

- [ ] **Step 3: Verify**

Run: `npx tsc --noEmit`
Expected: No NEW type errors referencing `routes.ts` or `page-headers.ts` (pre-existing `e-pay-slip`/`auth` errors are expected — see Global Constraints).

- [ ] **Step 4: Commit**

```bash
git add src/shared/utils/constants/routes.ts src/shared/config/page-headers.ts
git commit -m "feat(loan): add loan route and page-header constants"
```

---

### Task 2: Create loan components and skeletons

**Files:**

- Create: `src/features/loan/components/loan-card.tsx`
- Create: `src/features/loan/components/skeleton/loan-list-skeleton.tsx`
- Create: `src/features/loan/components/skeleton/loan-detail-skeleton.tsx`
- Create: `src/features/loan/components/skeleton/index.ts`
- Create: `src/features/loan/components/index.ts`

**Interfaces:**

- Consumes: `LoanT` from `../types`, `PAGE_ROUTES.LOAN.DETAILS` (from Task 1), `Skeleton`, `Container`, `SectionHeaderSkeleton`.
- Produces (used by later tasks):
  - `LoanCard({ item }: { item: LoanT })`
  - `LoanListSkeleton({ count?: number })`
  - `LoanDetailSkeleton()`

- [ ] **Step 1: Create `loan-card.tsx`**

```tsx
import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { cn } from '@utils/helpers/cn';
import { useRouter } from 'expo-router';
import { PAGE_ROUTES } from '@utils/constants';
import { LoanT } from '../types';

/**
 * Displays a single loan row in the loan list and navigates to the loan detail
 * screen when pressed. The pressed loan's `loan_id` is forwarded as the
 * `loan_id` query param so the detail screen can resolve the full record.
 *
 * Shows the loan description, loan number, recovery status badge (color-coded
 * by open/close), disbursed amount, and the recovery type (Principal/Interest).
 */
export function LoanCard({ item }: { item: LoanT }) {
  const router = useRouter();
  const isOpen = item.recovery_status === 'Open';

  const onPressLoan = () => {
    router.push(PAGE_ROUTES.LOAN.DETAILS({ loan_id: item.loan_id }));
  };

  return (
    <TouchableOpacity
      onPress={onPressLoan}
      className="flex-col rounded-md border border-border p-4">
      <View className="mb-3 flex-row items-start justify-between">
        <View className="flex-1 pr-2">
          <Text className="text-lg font-bold">{item.loan_desc}</Text>
          <Text className="text-sm text-primary">Loan No. {item.loan_id}</Text>
        </View>
        <View className={cn('rounded-md px-2.5 py-1', isOpen ? 'bg-primary/10' : 'bg-graphite/10')}>
          <Text className={cn('text-xs font-medium', isOpen ? 'text-primary' : 'text-graphite')}>
            {item.recovery_status}
          </Text>
        </View>
      </View>

      <View className="flex-row justify-between">
        <Text className="text-base text-graphite">Rs {item.amt_dis}</Text>
        <Text className="text-sm text-graphite">Recovery of {item.recovery_of}</Text>
      </View>
    </TouchableOpacity>
  );
}
```

- [ ] **Step 2: Create `skeleton/loan-list-skeleton.tsx`**

```tsx
import React from 'react';
import { FlatList, View } from 'react-native';
import { Skeleton } from '@components/ui/skeleton';
import { SectionHeaderSkeleton } from '@components/skeleton/section-header';
import { Container } from '@components/layout/container';

/**
 * Placeholder that mimics the {@link LoanCard} row layout while the loan
 * list is loading.
 */
const LoanCardSkeleton = () => (
  <View className="mb-4 rounded-md border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
    <View className="mb-2 flex-row items-start justify-between">
      <View className="flex-1 gap-y-1.5 pr-2">
        <Skeleton className="h-5 w-40 rounded-md" />
        <Skeleton className="h-3 w-28 rounded" />
      </View>
      <Skeleton className="h-6 w-16 rounded-md" />
    </View>
    <View className="my-2 h-[1px] bg-gray-100 dark:bg-gray-800" />
    <View className="mt-1 flex-row items-center justify-between">
      <Skeleton className="h-4 w-24 rounded" />
      <Skeleton className="h-4 w-20 rounded" />
    </View>
  </View>
);

interface LoanListSkeletonProps {
  /** Number of skeleton cards to render. Defaults to 10. */
  count?: number;
}

/**
 * Skeleton loading state for the loan list screen. Renders a `Container` with
 * a `SectionHeader` placeholder and `count` skeleton cards mirroring `LoanCard`.
 */
export const LoanListSkeleton = ({ count = 10 }: LoanListSkeletonProps) => (
  <Container className="flex-1">
    <SectionHeaderSkeleton hasSubtitle titleWidth="w-32" subtitleWidth="w-48" />
    <FlatList
      contentContainerClassName="pb-20"
      data={Array.from({ length: count })}
      renderItem={() => <LoanCardSkeleton />}
    />
  </Container>
);
```

- [ ] **Step 3: Create `skeleton/loan-detail-skeleton.tsx`**

```tsx
import React from 'react';
import { View } from 'react-native';
import { Skeleton } from '@components/ui/skeleton';
import { Container } from '@components/layout/container';

/**
 * Skeleton placeholder that mimics the recovery status banner atop the
 * {@link LoanDetailScreen}.
 */
const StatusBannerSkeleton = () => (
  <View className="mb-6 w-full flex-row items-center justify-center gap-2 rounded-md border p-4">
    <Skeleton className="h-4 w-24 rounded" />
  </View>
);

/**
 * Skeleton placeholder that mimics the primary-colored loan header card.
 */
const LoanHeaderSkeleton = () => (
  <View className="rounded-t-md bg-primary p-4">
    <View className="gap-y-2">
      <Skeleton className="h-3 w-32 rounded" />
      <Skeleton className="h-5 w-48 rounded" />
      <Skeleton className="h-3 w-28 rounded" />
    </View>
  </View>
);

/**
 * Skeleton placeholder that mimics the loan summary card (disbursed amount,
 * recovery of, recovery status rows).
 */
const SummaryCardSkeleton = () => (
  <View className="mb-6 flex-col overflow-hidden rounded-b-md border border-border bg-white p-4">
    <View className="gap-y-3 pt-2">
      <View className="flex-row justify-between">
        <Skeleton className="h-3 w-28 rounded" />
        <Skeleton className="h-4 w-20 rounded" />
      </View>
      <View className="flex-row justify-between">
        <Skeleton className="h-3 w-24 rounded" />
        <Skeleton className="h-4 w-24 rounded" />
      </View>
      <View className="flex-row justify-between">
        <Skeleton className="h-3 w-28 rounded" />
        <Skeleton className="h-4 w-16 rounded" />
      </View>
    </View>
  </View>
);

/**
 * Skeleton placeholder that mimics the Interest & Recovery details card.
 */
const InterestCardSkeleton = () => (
  <View className="mb-6 flex-col rounded-md border border-border p-5">
    <Skeleton className="mb-4 h-3 w-32 rounded" />
    <View className="gap-y-3">
      <View className="flex-row justify-between">
        <Skeleton className="h-3 w-28 rounded" />
        <Skeleton className="h-4 w-20 rounded" />
      </View>
      <View className="flex-row justify-between">
        <Skeleton className="h-3 w-32 rounded" />
        <Skeleton className="h-4 w-20 rounded" />
      </View>
      <View className="flex-row justify-between">
        <Skeleton className="h-3 w-36 rounded" />
        <Skeleton className="h-4 w-20 rounded" />
      </View>
    </View>
  </View>
);

/**
 * Skeleton loading state for the loan detail screen. Mirrors {@link LoanDetailScreen}:
 * status banner → primary header card → loan summary → interest & recovery.
 */
export const LoanDetailSkeleton = () => (
  <Container className="flex-1">
    <View className="flex-1">
      <StatusBannerSkeleton />
      <LoanHeaderSkeleton />
      <SummaryCardSkeleton />
      <InterestCardSkeleton />
    </View>
  </Container>
);
```

- [ ] **Step 4: Create `skeleton/index.ts` and `components/index.ts`**

`src/features/loan/components/skeleton/index.ts`:

```ts
export * from './loan-list-skeleton';
export * from './loan-detail-skeleton';
```

`src/features/loan/components/index.ts`:

```ts
export * from './loan-card';
export * from './skeleton';
```

- [ ] **Step 5: Verify**

Run: `npx tsc --noEmit && npm run lint`
Expected: No NEW type/lint errors referencing the `src/features/loan/components` files created in this task (pre-existing errors elsewhere are expected — see Global Constraints). `npm run lint` auto-fixes formatting.

- [ ] **Step 6: Commit**

```bash
git add src/features/loan/components
git commit -m "feat(loan): add loan card and skeletons"
```

---

### Task 3: Create the loan list and detail screens

**Files:**

- Create: `src/features/loan/screens/loan-list-screen.tsx`
- Create: `src/features/loan/screens/loan-detail-screen.tsx`
- Create: `src/features/loan/screens/index.ts`

**Interfaces:**

- Consumes:
  - `useLoans()` → `{ data: LoanT[] | undefined, isLoading, refetch, isFetching }` from `../hooks`
  - `useLoan({ loanId }: { loanId: string })` → `{ data: LoanItemI | undefined, isLoading, isFetching, refetch }` from `../hooks`
  - `LoanCard`, `LoanListSkeleton`, `LoanDetailSkeleton` from `../components` (Task 2)
  - `PAGE_ROUTES.LOAN.LIST` (Task 1)
  - Shared: `Container`, `SectionHeader`, `EmptyScreen`, `Card`, `DetailRow`, `cn`
- Produces:
  - `LoansScreen()` — loan list screen
  - `LoanDetailScreen()` — loan detail screen (reads `loan_id` search param)

- [ ] **Step 1: Create `loan-list-screen.tsx`**

```tsx
import React from 'react';
import { FlatList, RefreshControl, View } from 'react-native';
import { Container } from '@components/layout';
import { EmptyScreen } from '@components/screens';
import { SectionHeader } from '@components/common';
import { LoanCard, LoanListSkeleton } from '../components';
import { useLoans } from '../hooks';

/**
 * Loan list screen. Queries the signed-in employee's loans via `useLoans()`
 * and renders them as a pull-to-refresh `FlatList` of `LoanCard` rows.
 *
 * Loading shows `LoanListSkeleton`; an empty result shows `EmptyScreen` with a
 * refresh action. Each card navigates to the loan detail screen.
 */
export function LoansScreen() {
  const { data: loans, isLoading, refetch, isFetching } = useLoans();

  if (isLoading) return <LoanListSkeleton />;

  if (!loans || loans.length === 0) {
    return (
      <Container>
        <EmptyScreen
          refresh={refetch}
          title="No loans found"
          message="You don't have any loans yet. Loans assigned to you will appear here."
        />
      </Container>
    );
  }

  return (
    <Container className="flex-1">
      <View className="flex-1">
        <SectionHeader title="Recent Loans" />
        <FlatList
          data={loans}
          keyExtractor={(item) => item.loan_id}
          refreshControl={<RefreshControl onRefresh={refetch} refreshing={isFetching} />}
          renderItem={({ item }) => <LoanCard item={item} />}
          contentContainerClassName="pb-20 gap-2"
          showsVerticalScrollIndicator={false}
        />
      </View>
    </Container>
  );
}
```

- [ ] **Step 2: Create `loan-detail-screen.tsx`**

```tsx
import React from 'react';
import { View, Text, ScrollView, RefreshControl } from 'react-native';
import { Container } from '@components/layout';
import { Redirect, useLocalSearchParams } from 'expo-router';
import { LoanDetailSkeleton } from '../components';
import { useLoan } from '../hooks';
import { EmptyScreen } from '@components/screens';
import { PAGE_ROUTES } from '@utils/constants';
import { Card } from '@components/ui';
import { DetailRow } from '@components/common';
import { cn } from '@utils/helpers/cn';

type LoanDetailSearchParamsT = {
  /** Unique identifier of the loan record (read from the `loan_id` query param). */
  loan_id?: string;
};

/**
 * Prefixes a raw amount string with `Rs ` unless it is already prefixed, so the
 * UI never renders a doubled currency symbol.
 */
const formatAmount = (value: string) => (value.includes('Rs') ? value : `Rs ${value}`);

/**
 * Loan detail screen. Resolves the loan by the `loan_id` query param via
 * `useLoan()` and renders every field of the record (description, loan number,
 * disbursed amount, recovery type/status, and interest balance/installment data).
 *
 * Redirects to the list when `loan_id` is missing, shows `LoanDetailSkeleton`
 * while loading, renders `EmptyScreen` when the record is missing,
 * and is otherwise the scrollable detail view with pull-to-refresh.
 */
export function LoanDetailScreen() {
  const { loan_id } = useLocalSearchParams<LoanDetailSearchParamsT>();

  const loanId = Array.isArray(loan_id) ? loan_id[0] : loan_id;

  const { data, isLoading, isFetching, refetch } = useLoan({ loanId: loanId ?? '' });

  if (!loanId) return <Redirect href={PAGE_ROUTES.LOAN.LIST} />;

  if (isLoading && !data) return <LoanDetailSkeleton />;

  if (!data) {
    return (
      <EmptyScreen
        refresh={refetch}
        title="Loan Not Found"
        message="The loan you're looking for doesn't exist"
      />
    );
  }

  const isOpen = data.recovery_status === 'Open';

  return (
    <Container className="flex-1">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={<RefreshControl onRefresh={refetch} refreshing={isFetching} />}
        showsVerticalScrollIndicator={false}>
        {/* Recovery status banner */}
        <View
          className={cn(
            'mb-6 w-full flex-row items-center justify-center gap-2 rounded-md border p-4',
            isOpen ? 'border-primary bg-primary/10' : 'border-border bg-graphite/5'
          )}>
          <Text
            className={cn(
              'text-sm font-bold uppercase tracking-widest',
              isOpen ? 'text-primary' : 'text-graphite'
            )}>
            {data.recovery_status}
          </Text>
        </View>

        {/* Loan header card */}
        <View className="flex-col rounded-t-md bg-primary p-4">
          <Text className="text-sm font-medium text-white">Loan Description</Text>
          <Text className="mt-1 text-lg font-bold text-white">{data.loan_desc}</Text>
          <Text className="mt-1 text-sm text-white/80">Loan No. {data.loan_id}</Text>
        </View>

        {/* Loan summary */}
        <View className="mb-6 flex-col overflow-hidden rounded-b-md border border-border bg-white p-4">
          <View className="gap-y-2 pt-2">
            <DetailRow label="Amount Disbursed" value={formatAmount(data.amt_dis)} />
            <DetailRow label="Recovery Of" value={data.recovery_of} />
            <DetailRow label="Recovery Status" value={data.recovery_status} />
          </View>
        </View>

        {/* Interest & recovery details */}
        <Card variant="bordered" className="mb-6 p-5">
          <Text className="mb-4 text-xs font-bold uppercase tracking-wider text-graphite">
            Interest &amp; Recovery
          </Text>
          <DetailRow label="Interest Balance" value={formatAmount(data.int_balance)} />
          <DetailRow label="Interest Installment Amount" value={formatAmount(data.int_inst_amt)} />
          <DetailRow
            label="Last Installment Recovered"
            value={formatAmount(data.int_lst_inst_rec)}
          />
        </Card>
      </ScrollView>
    </Container>
  );
}
```

- [ ] **Step 3: Create `screens/index.ts`**

```ts
export * from './loan-list-screen';
export * from './loan-detail-screen';
```

- [ ] **Step 4: Verify**

Run: `npx tsc --noEmit && npm run lint`
Expected: No NEW type/lint errors referencing the `src/features/loan/screens` files created in this task (pre-existing errors elsewhere are expected — see Global Constraints).

- [ ] **Step 5: Commit**

```bash
git add src/features/loan/screens
git commit -m "feat(loan): add loan list and detail screens"
```

---

### Task 4: Wire the loan feature barrel

**Files:**

- Modify: `src/features/loan/index.ts`

**Interfaces:**

- Produces: public exports `LoansScreen`, `LoanDetailScreen`, `LoanCard`, skeletons, hooks, types via `@features/loan`.

- [ ] **Step 1: Replace the feature barrel**

Replace the current `// public exports` placeholder in `src/features/loan/index.ts` with:

```ts
// Components
export * from './components';

// Hooks
export * from './hooks';

// Screens
export * from './screens';

// Types
export * from './types';
```

- [ ] **Step 2: Verify**

Run: `npx tsc --noEmit`
Expected: No NEW type errors referencing `src/features/loan/index.ts` (pre-existing errors elsewhere are expected — see Global Constraints).

- [ ] **Step 3: Commit**

```bash
git add src/features/loan/index.ts
git commit -m "feat(loan): export loan components and screens"
```

---

### Task 5: Create the loan route group

**Files:**

- Create: `src/app/loans/_layout.tsx`
- Create: `src/app/loans/index.tsx`
- Create: `src/app/loans/detail/index.tsx`

**Interfaces:**

- Consumes: `LoansScreen` (Task 3), `LoanDetailScreen` (Task 3), `@components/layout` `StackHeaderLayout`.

- [ ] **Step 1: Create `src/app/loans/_layout.tsx`**

```tsx
import { StackHeaderLayout } from '@components/layout';

export default function layout() {
  return <StackHeaderLayout />;
}
```

- [ ] **Step 2: Create `src/app/loans/index.tsx`**

```tsx
import { LoansScreen } from '@features/loan';

export default function page() {
  return <LoansScreen />;
}
```

- [ ] **Step 3: Create `src/app/loans/detail/index.tsx`**

```tsx
import { LoanDetailScreen } from '@features/loan';

export default function page() {
  return <LoanDetailScreen />;
}
```

- [ ] **Step 4: Regenerate typed routes & verify**

Expo Router regenerates `.expo/types/router.d.ts` from the route tree only while the dev server runs. Boot it in a separate terminal, wait for it to finish starting, then stop it, and run the static checks:

```bash
# terminal A: run the dev server, wait for "Metro waiting on..." then Ctrl+C
npm run dev
# terminal B (after stopping the dev server):
npx tsc --noEmit
npm run lint
```

Expected: No NEW type/lint errors referencing the `src/app/loans` files created in this task (pre-existing errors elsewhere are expected — see Global Constraints).

- [ ] **Step 5: Commit**

```bash
git add src/app/loans
git commit -m "feat(loan): add loans route group"
```

---

### Task 6: End-to-end verification

**Files:** none (verification only)

- [ ] **Step 1: Static checks**

Run: `npx tsc --noEmit && npm run lint && npm run format:check`
Expected: No NEW type/lint/format errors referencing the files this plan touches; pre-existing `e-pay-slip`/`auth` errors are expected (see Global Constraints).

- [ ] **Step 2: Manual route smoke test**

Run `npm run dev` (Expo), open the app authenticated, and deep-link to `/loans` (e.g. through the dev-client URL `/loans`). Verify:

- List renders loan cards (or skeleton then empty state when no loans exist).
- Tapping a card navigates to `/loans/detail?loan_id=<id>` and renders the detail view showing all loan fields (disbursed amount, recovery of, status, interest balance/installment/last recovered).
- Pull-to-refresh works on both screens; header titles show "My Loans" / "Loan Details".
- Deep-linking `/loans/detail` without `loan_id` redirects back to the loan list.

- [ ] **Step 3: Report**

Summarize verification results (typecheck/lint pass, manual screenshot or notes) in the final handoff message.
