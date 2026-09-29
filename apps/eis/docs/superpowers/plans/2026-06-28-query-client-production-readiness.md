# Query Client Production Readiness — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Production-harden the React Query client for a read-heavy mobile app — persistent cache across sessions, auto-refetch on resume/reconnect, offline feedback via a network banner, and differentiated stale times per domain.

**Architecture:** Upgrade the existing singleton `QueryClient` with production defaults (gcTime, global error handling), wrap it in `PersistQueryClientProvider` with an AsyncStorage persister, initialize the already-written focus/online managers, and add a global network status banner component.

**Tech Stack:** `@tanstack/react-query` v5, `@tanstack/react-query-persist-client`, `@react-native-async-storage/async-storage`, `react-native-reanimated` (existing), `expo-network` (existing).

---

## File Structure

| What                            | Path                                                 | Action              |
| ------------------------------- | ---------------------------------------------------- | ------------------- |
| Dependencies                    | `package.json`                                       | Add deps + install  |
| Query client config             | `src/shared/utils/react-query/index.ts`              | Modify              |
| Query provider                  | `src/shared/providers/query-provider.tsx`            | Modify              |
| Network status hook             | `src/shared/hooks/use-online-status.ts`              | Create              |
| Network banner                  | `src/shared/components/network/network-banner.tsx`   | Create              |
| Network barrel                  | `src/shared/components/network/index.ts`             | Create              |
| Hooks barrel                    | `src/shared/hooks/index.ts`                          | Modify — add export |
| Root layout                     | `src/app/_layout.tsx`                                | Modify              |
| Query keys + stale time presets | `src/shared/utils/constants/query-keys.ts`           | Modify              |
| Leave detail hook               | `src/features/leave/hooks/use-leave-detail.ts`       | Modify              |
| Salary statements hook          | `src/features/salary/hooks/use-salary-statements.ts` | Modify              |
| Salary statement detail hook    | `src/features/salary/hooks/use-salary-statement.ts`  | Modify              |
| Employee detail hook            | `src/features/employee/hooks/use-employee.ts`        | Modify              |
| Pension list hook               | `src/features/pension/hooks/use-pensions.ts`         | Modify              |
| Pension detail hook             | `src/features/pension/hooks/usePension.ts`           | Modify              |

---

### Task 1: Install Dependencies

**Files:**

- Modify: `package.json`

- [ ] **Step 1: Add `@tanstack/react-query-persist-client`**

```bash
npm install @tanstack/react-query-persist-client
```

- [ ] **Step 2: Add `@react-native-async-storage/async-storage`**

```bash
npx expo install @react-native-async-storage/async-storage
```

- [ ] **Step 3: Verify installation**

```bash
ls node_modules/@tanstack/react-query-persist-client/package.json && ls node_modules/@react-native-async-storage/async-storage/package.json
```

Expected: Both package.json files exist.

---

### Task 2: Update QueryClient Configuration

**Files:**

- Modify: `src/shared/utils/react-query/index.ts`

- [ ] **Step 1: Edit the QueryClient with production defaults**

Replace the existing `queryClient` instantiation with the following:

```ts
import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query';
import { logger } from '@utils/logger';
import { toast } from 'sonner-native';

/**
 * React Query utilities barrel module.
 *
 * @module react-query
 */

export * from './focus-manager';
export * from './online-manager';

/**
 * Singleton React Query client configured for production.
 *
 * - 5-minute stale time with 30-minute garbage collection window.
 * - Query errors trigger a global toast and structured log (individual queries
 *   can opt out via `meta: { silent: true }`).
 * - Mutation errors trigger an on-screen toast and are logged.
 * - Refetch on reconnect is enabled; window focus refetch is disabled
 *   (mobile uses AppState-based focus manager instead).
 */
export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error, query) => {
      if (query.meta?.silent !== true) {
        toast.error('Something went wrong', { description: error.message });
      }
      logger.error('Query error', error, { queryKey: query.queryKey });
    },
  }),
  mutationCache: new MutationCache({
    onError: (error) => {
      toast.error('Something went wrong', { description: error.message });
      logger.error('Mutation error', error);
    },
  }),
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 min — gives persistence time to serialize
      retry: 3,
      refetchOnReconnect: true,
      refetchOnWindowFocus: false, // mobile: AppState-based, not visibilitychange
    },
  },
});
```

- [ ] **Step 2: Verify file looks correct**

```bash
npx tsc --noEmit --pretty src/shared/utils/react-query/index.ts 2>&1 | head -20
```

Expected: No type errors.

---

### Task 3: Update TQueryProvider with Persistence and Manager Init

**Files:**

- Modify: `src/shared/providers/query-provider.tsx`

- [ ] **Step 1: Rewrite the provider to use persistence + init focus/online managers**

Replace the entire file:

```tsx
import React, { useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { queryClient, setupFocusManager, setupOnlineManager } from '@utils/react-query';

type Props = {
  children: React.ReactNode;
};

/**
 * AsyncStorage-based persister for the React Query cache.
 *
 * - Key: `@employee/query-cache`
 * - Throttle-writes at 1-second intervals to avoid excessive I/O.
 * - Data older than 24 hours is discarded on hydration.
 */
const asyncStoragePersister = createAsyncStoragePersister({
  storage: AsyncStorage,
  key: '@employee/query-cache',
  throttleTime: 1000,
});

/**
 * Configures React Query app-wide.
 *
 * Wraps children in `PersistQueryClientProvider` so the query cache survives
 * app restarts. Also initializes the focus manager (auto-refetch on app resume)
 * and online manager (pause/resume on connectivity changes) in a one-time
 * `useEffect`.
 */
export const TQueryProvider = ({ children }: Props) => {
  useEffect(() => {
    const cleanups: (() => void)[] = [];

    try {
      const cleanupFocus = setupFocusManager();
      cleanups.push(cleanupFocus);
    } catch (error) {
      console.error('Failed to setup focus manager', error);
    }

    try {
      const cleanupOnline = setupOnlineManager();
      cleanups.push(cleanupOnline);
    } catch (error) {
      console.error('Failed to setup online manager', error);
    }

    return () => {
      cleanups.forEach((cleanup) => cleanup());
    };
  }, []);

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister: asyncStoragePersister,
        maxAge: 1000 * 60 * 60 * 24, // 24 hours
      }}>
      {children}
    </PersistQueryClientProvider>
  );
};
```

- [ ] **Step 2: Install the AsyncStorage persister package**

The `PersistQueryClientProvider` needs a persister. The AsyncStorage persister comes from a separate package:

```bash
npm install @tanstack/query-async-storage-persister
```

- [ ] **Step 3: Verify build**

```bash
npx tsc --noEmit --pretty 2>&1 | head -40
```

Expected: No type errors related to the new imports.

---

### Task 4: Create the `useOnlineStatus` Hook

**Files:**

- Create: `src/shared/hooks/use-online-status.ts`
- Modify: `src/shared/hooks/index.ts` — add barrel export

- [ ] **Step 1: Write the hook**

````ts
import { useEffect, useState } from 'react';
import { onlineManager } from '@tanstack/react-query';

/**
 * Tracks the device's online/offline status by subscribing to React Query's
 * global `onlineManager`.
 *
 * Returns a reactive `isOnline` boolean that updates when connectivity changes.
 * The `onlineManager` itself is kept in sync with the device by
 * `setupOnlineManager()` (initialized in TQueryProvider).
 *
 * @returns {{ isOnline: boolean }} Current connectivity state.
 *
 * @example
 * ```tsx
 * const { isOnline } = useOnlineStatus();
 * if (!isOnline) return <OfflineIndicator />;
 * ```
 */
export function useOnlineStatus(): { isOnline: boolean } {
  const [isOnline, setIsOnline] = useState(onlineManager.isOnline());

  useEffect(() => {
    const unsubscribe = onlineManager.subscribe((online) => {
      setIsOnline(Boolean(online));
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return { isOnline };
}
````

- [ ] **Step 2: Add barrel export to hooks index**

```ts
// Add to src/shared/hooks/index.ts
export * from './use-online-status';
```

---

### Task 5: Create the NetworkBanner Component

**Files:**

- Create: `src/shared/components/network/network-banner.tsx`

- [ ] **Step 1: Write the banner component**

````tsx
import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useOnlineStatus } from '@hooks';

const BANNER_HEIGHT = 32;
const DEBOUNCE_MS = 1000; // 1s debounce to avoid flicker on flaky connections

/**
 * A subtle status bar that appears at the top of the screen when the device
 * loses network connectivity.
 *
 * - Shows "You are offline" on an amber background.
 * - Animates in/out using react-native-reanimated.
 * - 1-second debounce to prevent flickering during brief disconnects.
 * - Renders below the safe area inset so it doesn't overlap the status bar.
 *
 * @example
 * ```tsx
 * <NetworkBanner />
 * ```
 */
export const NetworkBanner = () => {
  const { isOnline } = useOnlineStatus();
  const insets = useSafeAreaInsets();
  const translateY = useSharedValue(-BANNER_HEIGHT);
  const debouncedOffline = useDebouncedValue(!isOnline, DEBOUNCE_MS);

  useEffect(() => {
    translateY.value = withTiming(debouncedOffline ? 0 : -BANNER_HEIGHT, {
      duration: 300,
      easing: Easing.inOut(Easing.ease),
    });
  }, [debouncedOffline, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  if (!debouncedOffline) {
    // Return null when online to remove from the render tree
    return null;
  }

  return (
    <Animated.View style={[styles.container, animatedStyle, { top: insets.top }]}>
      <Animated.Text style={styles.text}>You are offline</Animated.Text>
    </Animated.View>
  );
};

/** Simple debounce hook — waits `delay` ms before committing the value. */
function useDebouncedValue<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = React.useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: BANNER_HEIGHT,
    backgroundColor: '#F59E0B', // amber-500
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
    elevation: 10,
  },
  text: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
});
````

---

### Task 6: Integrate NetworkBanner into the Root Layout

**Files:**

- Modify: `src/app/_layout.tsx`

- [ ] **Step 1: Import and render `<NetworkBanner />`**

The banner needs to be rendered at a high level. Add it inside `ProviderWrapper` alongside the children.

Edit `src/app/_layout.tsx`:

```diff
 import { ProviderWrapper } from '@providers/provider-wrapper';
+import { NetworkBanner } from '@components/network';
 import { Toaster } from '@components/ui';
```

And inside the return statement, add `<NetworkBanner />`:

```diff
   <ProviderWrapper>
     <Stack screenOptions={{ headerShown: false }} />
+    <NetworkBanner />
     <Toaster />
   </ProviderWrapper>
```

- [ ] **Step 2: Verify the `@components/network` alias resolves**

Check tsconfig.json already has a pattern that covers `@components/*` → `./src/shared/components/*`:

```
"@components/*": ["./src/shared/components/*"]
```

This is already present. ✅

---

### Task 7: Add Per-Query Stale Time Presets

**Files:**

- Modify: `src/shared/utils/constants/query-keys.ts`
- Modify: `src/features/leave/hooks/use-leave-detail.ts`
- Modify: `src/features/salary/hooks/use-salary-statements.ts`
- Modify: `src/features/salary/hooks/use-salary-statement.ts`
- Modify: `src/features/employee/hooks/use-employee.ts`
- Modify: `src/features/pension/hooks/use-pensions.ts`
- Modify: `src/features/pension/hooks/usePension.ts`

- [ ] **Step 1: Add stale time presets to `query-keys.ts`**

Add a `STALE_TIMES` object after the `QUERY_KEYS` object:

````ts
// Add at end of src/shared/utils/constants/query-keys.ts

/**
 * Recommended stale times per domain, in milliseconds.
 *
 * These are presets to pass as `staleTime` in individual `useQuery` calls.
 * They override the global default (5 minutes) where data freshness needs
 * differ from the baseline.
 *
 * @example
 * ```ts
 * useQuery({
 *   queryKey: QUERY_KEYS.LEAVE.LIST(emp_cd),
 *   queryFn: ...,
 *   staleTime: STALE_TIMES.LEAVE,
 * });
 * ```
 */
export const STALE_TIMES = {
  /** Auth/session data — stale immediately, always check server. */
  AUTH: 0,
  /** Fast-changing data like leave approvals. */
  LEAVE_FAST: 1000 * 30, // 30 seconds
  /** Leave list/balance queries. */
  LEAVE: 1000 * 60 * 1, // 1 minute
  /** Moderate cadence — announcements. */
  ANNOUNCEMENT: 1000 * 60 * 5, // 5 minutes
  /** Slow-changing reference data — salary, payslips. */
  SALARY: 1000 * 60 * 15, // 15 minutes
  /** Rarely-changing — employee directory. */
  EMPLOYEE: 1000 * 60 * 30, // 30 minutes
  /** Static reference data — pension records. */
  PENSION: 1000 * 60 * 15, // 15 minutes
} as const;
````

- [ ] **Step 2: Update leave detail hook**

In `src/features/leave/hooks/use-leave-detail.ts`, add `staleTime: STALE_TIMES.LEAVE_FAST`:

```diff
 import { useQuery } from '@tanstack/react-query';
-import { QUERY_KEYS, METHODS } from '@utils/constants';
+import { QUERY_KEYS, METHODS, STALE_TIMES } from '@utils/constants';
 import { rpc } from '@utils/api';
 import { useAuthStore } from '@stores/auth.store';
 import { Leave, LeaveBal } from '@sharedTypes/leave';
@@ -13,6 +13,7 @@ export function useLeaveDetail(id: string) {
   return useQuery({
     queryKey: QUERY_KEYS.LEAVE.DETAILS(id),
     queryFn: () => rpc<LeaveResponse>(METHODS.GET_EMP_LEAVE_DETAILS_DETAILS, { leave_id: id }),
+    staleTime: STALE_TIMES.LEAVE_FAST,
     enabled: !!id && isSignedIn,
     select: (data) => data.data,
   });
```

- [ ] **Step 3: Update salary statements hook**

In `src/features/salary/hooks/use-salary-statements.ts`, add `staleTime: STALE_TIMES.SALARY`:

```diff
 import { useAuthStore } from '@stores/auth.store';
 import { useQuery } from '@tanstack/react-query';
 import { rpc } from '@utils/api';
-import { METHODS, QUERY_KEYS } from '@utils/constants';
+import { METHODS, QUERY_KEYS, STALE_TIMES } from '@utils/constants';
 import { transformData } from '@utils/helpers/transform-data';
 import { SalarySlip } from '../types';
@@ -11,6 +11,7 @@ export function useSalaryStatements() {
   const { data, isFetched, isError, error, refetch, isLoading, isFetching } = useQuery({
     queryKey: QUERY_KEYS.SALARY.STATEMENTS(emp_cd),
     queryFn: () => rpc<SalarySlip[]>(METHODS.GET_EMP_SALARY_STATEMENTS, { emp_cd }),
+    staleTime: STALE_TIMES.SALARY,
     select: (data) => data?.data,
     enabled: !!emp_cd && isSignedIn,
   });
```

- [ ] **Step 4: Update salary statement detail hook**

In `src/features/salary/hooks/use-salary-statement.ts`, add `staleTime: STALE_TIMES.SALARY`:

```diff
 import { useMemo, useEffect } from 'react';
 import { useQuery } from '@tanstack/react-query';
-import { METHODS, QUERY_KEYS } from '@utils/constants';
+import { METHODS, QUERY_KEYS, STALE_TIMES } from '@utils/constants';
 import { toast } from '@components/ui';
@@ -15,6 +15,7 @@ export const useSalaryStatement = (salaryId: string) => {
   const query = useQuery({
     queryKey: QUERY_KEYS.SALARY.PAYSLIP(salaryId, emp_cd),
     queryFn: () => rpc<SalarySlip>(METHODS.GET_EMP_SALARY_STATEMENTS_DETAILS, { emp_cd, statement_id: salaryId }),
+    staleTime: STALE_TIMES.SALARY,
     select: (res) => res.data,
     enabled: !!salaryId && isSignedIn,
   });
```

- [ ] **Step 5: Update employee hook**

In `src/features/employee/hooks/use-employee.ts`, add `staleTime: STALE_TIMES.EMPLOYEE`:

```diff
 import { EMPLOYEE_ENDPOINT } from '@features/employee/utils/constants';
-import { QUERY_KEYS } from '@utils/constants';
+import { QUERY_KEYS, STALE_TIMES } from '@utils/constants';
 import { useQuery } from '@tanstack/react-query';
 import { EmployeeT } from '../types';
 import { axioshttp } from '@utils/api/http';
@@ -10,6 +10,7 @@ export function useEmployee({ employeeId: idx }: UseEmployeeProps) {
   return useQuery({
     queryKey: QUERY_KEYS.EMPLOYEE.DETAILS(idx),
     queryFn: () => axioshttp.get<EmployeeT>(EMPLOYEE_ENDPOINT.DETAILS(idx)),
+    staleTime: STALE_TIMES.EMPLOYEE,
     select: (data) => data.data,
     enabled: !!idx,
   });
```

- [ ] **Step 6: Update pension hooks**

In `src/features/pension/hooks/use-pensions.ts` and `src/features/pension/hooks/usePension.ts`, add `staleTime: STALE_TIMES.PENSION`:

```diff
 // use-pensions.ts
-import { PENSION_KEYS } from '@utils/constants';
+import { PENSION_KEYS, STALE_TIMES } from '@utils/constants';
 ...
   return useQuery({
     queryKey: PENSION_KEYS.LIST(empId, year, month, status),
     queryFn: () => ...,
+    staleTime: STALE_TIMES.PENSION,
     ...
   });

// usePension.ts
-import { QUERY_KEYS } from '@utils/constants';
+import { QUERY_KEYS, STALE_TIMES } from '@utils/constants';
 ...
   return useQuery({
     queryKey: QUERY_KEYS.PENSION.DETAIL(empId, pensionId),
     queryFn: () => ...,
+    staleTime: STALE_TIMES.PENSION,
     ...
   });
```

- [ ] **Step 7: Verify build**

```bash
npx tsc --noEmit --pretty 2>&1 | head -40
```

Expected: No type errors.

---

### Task 8: Final Validation

- [ ] **Step 1: TypeScript type-check**

```bash
npx tsc --noEmit --pretty 2>&1 | head -60
```

Expected: No errors. If errors appear, fix them before proceeding.

- [ ] **Step 2: Run ESLint**

```bash
npm run lint 2>&1 | head -40
```

Expected: No lint errors or warnings related to the new/modified files.

- [ ] **Step 3: Commit all changes**

```bash
git add package.json package-lock.json \
  src/shared/utils/react-query/index.ts \
  src/shared/providers/query-provider.tsx \
  src/shared/components/network/network-banner.tsx \
  src/shared/components/network/index.ts \
  src/shared/hooks/use-online-status.ts \
  src/shared/hooks/index.ts \
  src/shared/utils/constants/query-keys.ts \
  src/features/leave/hooks/use-leave-detail.ts \
  src/features/salary/hooks/use-salary-statements.ts \
  src/features/salary/hooks/use-salary-statement.ts \
  src/features/employee/hooks/use-employee.ts \
  src/features/pension/hooks/use-pensions.ts \
  src/features/pension/hooks/usePension.ts \
  src/app/_layout.tsx \
  docs/superpowers/specs/2026-06-28-query-client-production-readiness.md \
  docs/superpowers/plans/2026-06-28-query-client-production-readiness.md
git commit -m "feat: production-harden React Query client

- Upgrade QueryClient config with gcTime, global error handling, mobile defaults
- Wire up focus manager (auto-refetch on app resume) and online manager (pause on offline)
- Add AsyncStorage-backed cache persistence via PersistQueryClientProvider
- Add NetworkBanner component with 1s debounce and Reanimated animation
- Add useOnlineStatus hook subscribing to onlineManager
- Add STALE_TIMES presets and apply per-query stale times across all features
- Keep data cached for 24h across sessions, GC after 30min in-memory"
```
