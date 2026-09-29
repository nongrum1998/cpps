# Home Screen Overview Data Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Drive the entire home dashboard (welcome state, notifications, active leave, recent history) from the single `useHomeOverview()` RPC instead of the shared `useLeaves()` hook, and add a notifications banner on the home screen.

**Architecture:** The `GET_EMP_OVERVIEW` endpoint already returns everything the home screen needs: `latest_leave` (single), `notification_for_me` (single), and `all_notification` (list). We remove `useLeaves()` usage from all home-feature components. Each component calls `useHomeOverview()` independently — React Query dedupes by `queryKey` (`['home-overview', emp_cd]`), so there is exactly one network request. The `use-leaves.ts` hook stays in the codebase because `leave-screen.tsx` still consumes it — we only stop using it inside `src/features/home/**`.

**Behavior change (intended):** The overview endpoint returns a single `latest_leave`, not a list. So the "Active Applications" card and "Recent History" row each show **at most one** leave, mutually exclusive:

- Active card shows `latest_leave` when `isActiveOverviewLeave(latest_leave)` is true.
- History shows `latest_leave` when it is false (or when null → existing empty state).

**Tech Stack:** React Native (Expo 54), TypeScript, @tanstack/react-query, expo-router, NativeWind class names.

## Global Constraints

- No test runner exists in this repo (no `test` script, no `*.test.*` files). Verification is typecheck + scoped lint.
- **Baseline typecheck already fails** with 2 pre-existing errors (do NOT fix them — out of scope):
  - `src/features/leave/hooks/use-create-leave.ts(6,10)`: `LeaveTypeCode` not exported from `'../types'`
  - `src/shared/components/common/summary-card.tsx(6,10)`: `SalaryStatementStatus` not exported from `'@sharedTypes/satatement'`
- Verification command per task (must produce **no output**): `npx tsc --noEmit 2>&1 | rg "src/features/home"` — i.e. no NEW type errors in the home feature. A full `npx tsc --noEmit` will exit non-zero due to the baseline errors above.
- Scoped lint check: `npx eslint "src/features/home/**/*.{ts,tsx}"` — must pass.
- Feature branch required: `refactor/home-overview-data`.
- Conventional Commits: `refactor(home): ...`, `feat(home): ...`.
- Every exported symbol needs a detailed JSDoc comment (what, how to use, side effects/edge cases).
- Do NOT delete `src/shared/hooks/use-leaves.ts` — `src/features/leave/screens/leave-screen.tsx:12` still imports it.
- Do NOT touch `src/features/leave/**`.
- File naming `kebab-case`; named exports only.
- No `console.log` in production code — remove the existing `console.log('Home Overview', data)` in `home-screen.tsx`.

---

### Task 1: Export home types and add the overview-active-leave helper

**Files:**

- Modify: `src/features/home/types/home.ts` (add `export` to `HomeLeaveT` and `HomeNotificationType`)
- Create: `src/features/home/utils/helper/is-active-overview-leave.ts`
- Modify: `src/features/home/utils/helper/index.ts`

**Interfaces:**

- Produces: `export function isActiveOverviewLeave(leave: HomeLeaveT): boolean` — returns `true` when the leave belongs in the "Active Applications" section (not `Rejected` and end date is today or later). Used by Tasks 3 & 4.
- Produces: `export function formatHomeDate(value: string): string` — date-safe formatter for overview dates. Used by Tasks 2, 3, 4.
- Produces: `export type HomeLeaveT` and `export type HomeNotificationType` (from `types/home.ts`) — consumed by Tasks 2, 3, 4.
- Produces: `HomeOverviewT.notification_for_me` is typed `HomeNotificationType | null` so the banner renders nothing when the API omits it.

- [ ] **Step 1: Export the overview sub-types**

In `src/features/home/types/home.ts`:

1. Change line 3 from `type HomeNotificationType = {` to `export type HomeNotificationType = {`.
2. Change line 12 from `type HomeLeaveT = {` to `export type HomeLeaveT = {`.
3. Change line 26 from `notification_for_me: HomeNotificationType;` to `notification_for_me: HomeNotificationType | null;` (unvalidated API data may omit this field — see the guard in Task 2).

- [ ] **Step 2: Write the helper**

Create `src/features/home/utils/helper/is-active-overview-leave.ts`:

````ts
import { formatDate } from '@utils/formatters';
import type { HomeLeaveT } from '../../types/home';

/**
 * Parses a leave date string returned by the overview endpoint into a local Date.
 *
 * Accepts both `YYYY-MM-DD` (machine format) and `DD/MM/YYYY` (display format).
 * Returns `null` when the string is empty or cannot be parsed.
 *
 * @param value - The date string from `HomeLeaveT` (`from_dt` / `to_dt`).
 * @returns A local-midnight `Date`, or `null` if unparseable.
 */
function parseHomeDate(value: string): Date | null {
  if (!value) return null;

  const iso = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (iso) {
    const [, year, month, day] = iso;
    const date = new Date(Number(year), Number(month) - 1, Number(day));
    return Number.isNaN(date.getTime()) ? null : date;
  }

  const display = /^(\d{2})\/(\d{2})\/(\d{4})/.exec(value);
  if (display) {
    const [, day, month, year] = display;
    const date = new Date(Number(year), Number(month) - 1, Number(day));
    return Number.isNaN(date.getTime()) ? null : date;
  }

  return null;
}

/**
 * Determines whether an overview leave record belongs in the "Active
 * Applications" section (rather than "Recent History").
 *
 * A leave is considered active when:
 * 1. It has **not** been rejected (`Rejected` leaves always go to history).
 * 2. Its end date (`to_dt`) is today or later (in progress or upcoming).
 *
 * When `to_dt` cannot be parsed the record is treated as **not active** so it
 * renders in history instead of being hidden from both sections.
 *
 * @param leave - The overview leave record (`HomeLeaveT`).
 * @returns `true` for the active card, `false` for history.
 *
 * @example
 * ```ts
 * isActiveOverviewLeave({ verify_flg_desc: 'Pending', to_dt: '03/06/2026', ... });
 * // => true when today <= 2026-06-03
 * ```
 */
export function isActiveOverviewLeave(leave: HomeLeaveT): boolean {
  if (leave.verify_flg_desc === 'Rejected') return false;

  const endDate = parseHomeDate(leave.to_dt);
  if (!endDate) return false;

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return endDate >= todayStart;
}

/**
 * Formats an overview leave or notification date string for display.
 *
 * Parses the raw value as either `YYYY-MM-DD` (machine) or `DD/MM/YYYY`
 * (display) and renders it via the shared `formatDate` formatter. This avoids
 * `formatDate`'s raw `new Date(value)` behaviour, which misreads `DD/MM/YYYY`
 * as US `MM/DD/YYYY`. Falls back to the raw string when unparseable.
 *
 * @param value - The raw date string from the overview endpoint.
 * @returns A human-readable date string, or the raw input unchanged.
 *
 * @example
 * ```ts
 * formatHomeDate('03/06/2026') // "June 03, 2026"
 * formatHomeDate('2026-06-03') // "June 03, 2026"
 * ```
 */
export function formatHomeDate(value: string): string {
  const date = parseHomeDate(value);
  return date ? formatDate(date) : value;
}
````

- [ ] **Step 3: Export the helper from the barrel**

In `src/features/home/utils/helper/index.ts`, add:

```ts
export * from './is-active-overview-leave';
```

- [ ] **Step 4: Verify**

Run: `npx tsc --noEmit 2>&1 | rg "src/features/home"`
Expected: no output (no new home-feature type errors). The full `npx tsc --noEmit` will still exit non-zero on the pre-existing errors listed in Global Constraints.

- [ ] **Step 5: Commit**

```bash
git add src/features/home/types/home.ts src/features/home/utils/helper/is-active-overview-leave.ts src/features/home/utils/helper/index.ts
git commit -m "feat(home): add overview leave-active helper and export overview types"
```

---

### Task 2: Create the notifications banner component

**Files:**

- Create: `src/features/home/components/home-notification-card.tsx`
- Modify: `src/features/home/components/index.ts`

**Interfaces:**

- Consumes: `useHomeOverview()` from `../hooks` (returns `HomeOverviewT` with `notification_for_me: HomeNotificationType | null`), `formatHomeDate` from `../utils`.
- Produces: `export const HomeNotificationCard: React.FC` — renders the single `notification_for_me` banner, or `null` when absent. Used by Task 5.

- [ ] **Step 1: Write the component**

Create `src/features/home/components/home-notification-card.tsx`:

````tsx
import React from 'react';
import { Text, View } from 'react-native';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { NotificationSquareIcon } from '@hugeicons/core-free-icons';
import { formatHomeDate } from '../utils';
import { useHomeOverview } from '../hooks';

/**
 * Compact notification banner shown at the top of the home screen.
 *
 * Displays the single `notification_for_me` record returned by the home
 * overview endpoint: icon, title, body/message, and announcement date.
 * Renders nothing when the record is missing or empty.
 *
 * @example
 * ```tsx
 * <HomeNotificationCard />
 * ```
 */
export const HomeNotificationCard = () => {
  const { data } = useHomeOverview();
  const notification = data?.notification_for_me;

  if (!notification) return null;

  const body = notification.body || notification.message;

  return (
    <View className="mt-6 flex-row items-start gap-x-3 rounded-md border border-border bg-white p-4">
      <HugeiconsIcon icon={NotificationSquareIcon} size={28} color="#0036a4" />
      <View className="flex-1">
        <Text className="text-sm font-bold text-black">{notification.title}</Text>
        {body ? <Text className="mt-0.5 text-sm text-graphite">{body}</Text> : null}
        <Text className="mt-1 text-xs text-gray-500">
          {formatHomeDate(notification.announce_dt)}
        </Text>
      </View>
    </View>
  );
};
````

- [ ] **Step 2: Export from the components barrel**

In `src/features/home/components/index.ts`, add after the existing exports:

```ts
export * from './home-notification-card';
```

- [ ] **Step 3: Verify**

Run: `npx tsc --noEmit 2>&1 | rg "src/features/home"`
Expected: no output (no new home-feature type errors). The full `npx tsc --noEmit` will still exit non-zero on the pre-existing errors listed in Global Constraints.

- [ ] **Step 4: Commit**

```bash
git add src/features/home/components/home-notification-card.tsx src/features/home/components/index.ts
git commit -m "feat(home): add notification banner fed by home overview"
```

---

### Task 3: Rework the active leave card to use the overview hook

**Files:**

- Modify: `src/features/home/components/home-active-leave-card.tsx` (full rewrite of the data layer; keep the styling classes)

**Interfaces:**

- Consumes: `useHomeOverview()` from `../hooks`, `isActiveOverviewLeave()` from `../utils`, `HomeLeaveT` from `../types/home`.
- Produces: unchanged public API — `export const HomeActiveLeaveCard: React.FC`.

- [ ] **Step 1: Replace the data source**

Rewrite `src/features/home/components/home-active-leave-card.tsx` in full:

```tsx
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { cn } from '@utils/helpers/cn';
import { getStatusColor } from '@utils/helpers';
import { router } from 'expo-router';
import { PAGE_ROUTES } from '@utils/constants';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { CalendarRemove02Icon } from '@hugeicons/core-free-icons';
import { useHomeOverview } from '../hooks';
import { isActiveOverviewLeave, formatHomeDate } from '../utils';
import type { HomeLeaveT } from '../types/home';

/**
 * Active leave card displayed in the "Active Applications" section.
 *
 * Shows the single `latest_leave` returned by the home overview endpoint when
 * it is still active (not rejected and end date today or later). Otherwise the
 * empty state is shown. Tapping the card opens the leave detail screen.
 */
export const HomeActiveLeaveCard = () => {
  const { data } = useHomeOverview();
  const latest = data?.latest_leave;
  const active = latest && isActiveOverviewLeave(latest) ? latest : null;

  const onPressLeave = (leave: HomeLeaveT) => {
    router.push(
      PAGE_ROUTES.LEAVE.DETAILS({
        leave_cd: leave.leave_cd,
        from_dt: leave.from_dt,
        order_dt: leave.order_dt,
      })
    );
  };

  if (!active) {
    return (
      <View className="flex-1 flex-col items-center justify-center gap-y-2 border border-border p-6">
        <HugeiconsIcon icon={CalendarRemove02Icon} className="text-graphite/60" size={48} />
        <Text className="text-center text-lg font-medium tracking-wider text-graphite">
          No active leaves at the moment.
        </Text>
      </View>
    );
  }

  return (
    <View className="mb-3 rounded-md border border-gray-200 bg-white p-4">
      <TouchableOpacity onPress={() => onPressLeave(active)} className="flex-row justify-between">
        <View>
          <Text className="text-sm text-primary">{active.leave_desc}</Text>
          <Text className="font-semibold text-primary">{active.reason_for_leave}</Text>

          <View className="flex-1 flex-row gap-x-2">
            <Text className="mt-1 text-gray-500">{formatHomeDate(active.from_dt)}</Text>
            <Text className="mt-1 text-gray-500">-</Text>
            <Text className="mt-1 text-gray-500">{formatHomeDate(active.to_dt)}</Text>
          </View>
        </View>

        <View
          className={cn(
            'items-center justify-center rounded-md px-3 py-1',
            getStatusColor(active.verify_flg_desc).bg
          )}>
          <Text className="text-base">{active.verify_flg_desc}</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};
```

> [!NOTE] Date display is handled by `formatHomeDate`
> `HomeLeaveT.from_dt` / `to_dt` follow the shared type contract (`src/shared/types/leave/index.ts:62-65`) as `DD/MM/YYYY` display strings. `formatHomeDate` (Task 1) parses both `YYYY-MM-DD` and `DD/MM/YYYY` before rendering, avoiding `formatDate`'s raw `new Date(value)` behaviour which would day/month-swap `DD/MM/YYYY`.

- [ ] **Step 2: Remove the now-unused shared import**

Confirm `src/features/home/components/home-active-leave-card.tsx` no longer imports `useLeaves` or `isActiveLeave` (the rewrite above removes both).

- [ ] **Step 3: Verify**

Run: `npx tsc --noEmit 2>&1 | rg "src/features/home"`
Expected: no output (no new home-feature type errors). The full `npx tsc --noEmit` will still exit non-zero on the pre-existing errors listed in Global Constraints.

- [ ] **Step 4: Commit**

```bash
git add src/features/home/components/home-active-leave-card.tsx
git commit -m "refactor(home): drive active leave card from home overview"
```

---

### Task 4: Rework the recent history row to use the overview hook

**Files:**

- Modify: `src/features/home/components/home-leave-history.tsx` (full rewrite of the data layer; keep styling and empty state)

**Interfaces:**

- Consumes: `useHomeOverview()` from `../hooks`, `isActiveOverviewLeave()` from `../utils`, `HomeLeaveT` from `../types/home`.
- Produces: unchanged public API — `export const HomeLeaveHistory: React.FC`.

- [ ] **Step 1: Replace the data source**

Rewrite `src/features/home/components/home-leave-history.tsx` in full:

```tsx
import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { PAGE_ROUTES } from '@utils/constants/routes';
import { getStatusColor } from '@utils/helpers';
import { Button } from '@components/ui';
import { useHomeOverview } from '../hooks';
import { isActiveOverviewLeave, formatHomeDate } from '../utils';
import type { HomeLeaveT } from '../types/home';

/**
 * Leave history preview shown in the "Recent History" section.
 *
 * Displays the single `latest_leave` returned by the home overview endpoint
 * when it is **not** active (rejected or already finished). Shows the empty
 * state when there is no leave, or when the latest leave is still active
 * (it is shown in the "Active Applications" card instead). Tapping the row
 * opens the leave detail screen.
 */
export const HomeLeaveHistory = () => {
  const { data } = useHomeOverview();
  const latest = data?.latest_leave;
  const history = latest && !isActiveOverviewLeave(latest) ? latest : null;

  const onPressLeave = (leave: HomeLeaveT) => {
    router.push(
      PAGE_ROUTES.LEAVE.DETAILS({
        leave_cd: leave.leave_cd,
        from_dt: leave.from_dt,
        order_dt: leave.order_dt,
      })
    );
  };

  if (!history) {
    return (
      <View className="flex-1 items-center justify-center gap-y-4 border border-border p-6">
        <Image
          source={require('../../../shared/assets/images/empty-list.jpg')}
          className="aspect-square h-64 object-cover object-center"
        />
        <Text className="text-center text-lg font-bold tracking-wider text-black">
          No leave history
        </Text>
        <Text className="text-center text-lg font-medium tracking-wider text-graphite">
          You {`haven't`} taken any leaves yet. When you do, they will appear here.
        </Text>
        <Button
          size={'lg'}
          variant={'primary'}
          className="font-bold tracking-widest"
          onPress={() => router.push(PAGE_ROUTES.LEAVE.CREATE)}>
          Apply for Your First Leave
        </Button>
      </View>
    );
  }

  return (
    <View className="flex-row items-center justify-between border-b border-border py-4">
      <TouchableOpacity onPress={() => onPressLeave(history)}>
        <Text className="text-sm text-primary">{history.leave_desc}</Text>
        <Text className="text-lg font-semibold">{history.reason_for_leave}</Text>

        <View className="flex-1 flex-row gap-x-2">
          <Text className="text-gray-500">{formatHomeDate(history.from_dt)}</Text>
          <Text className="text-gray-500">-</Text>
          <Text className="text-gray-500">{formatHomeDate(history.to_dt)}</Text>
        </View>
      </TouchableOpacity>

      <Text className={getStatusColor(history.verify_flg_desc).text}>
        {history.verify_flg_desc}
      </Text>
    </View>
  );
};
```

- [ ] **Step 2: Verify**

Run: `npx tsc --noEmit 2>&1 | rg "src/features/home"`
Expected: no output (no new home-feature type errors). The full `npx tsc --noEmit` will still exit non-zero on the pre-existing errors listed in Global Constraints.

- [ ] **Step 3: Commit**

```bash
git add src/features/home/components/home-leave-history.tsx
git commit -m "refactor(home): drive recent history from home overview"
```

---

### Task 5: Update the home screen and skeleton

**Files:**

- Modify: `src/features/home/screens/home-screen.tsx`
- Modify: `src/features/home/components/skeleton/home-screen-skeleton.tsx`

**Interfaces:**

- Consumes: `HomeNotificationCard` from `../components`, `useHomeOverview()` from `../hooks`.

- [ ] **Step 1: Swap loading state and remove the debug log**

In `src/features/home/screens/home-screen.tsx`:

1. Remove the import: `import { useLeaves } from '@hooks';`
2. Add `HomeNotificationCard` to the import from `'../components'`.
3. Replace lines 19-21:

```tsx
const { isLoading, isFetching, refetch } = useHomeOverview();
```

(dropping `const { data, refetch } = useHomeOverview();`, `const { isLoading, isFetching } = useLeaves();`, and the `console.log('Home Overview', data);` line entirely).

4. The `RefreshControl` keeps `onRefresh={refetch}` / `refreshing={isFetching}` — now backed by the overview query.

- [ ] **Step 2: Insert the notification banner**

In `src/features/home/screens/home-screen.tsx`, directly after the welcome header `</View>` (currently line 47) and before the `{/* Active Applications */}` comment, add:

```tsx
{
  /* Notification banner */
}
<HomeNotificationCard />;
```

- [ ] **Step 3: Mirror the banner in the skeleton**

In `src/features/home/components/skeleton/home-screen-skeleton.tsx`, add a small `NotificationBannerSkeleton` and render it after `WelcomeHeaderSkeleton`:

```tsx
/**
 * Skeleton placeholder that mimics the notification banner.
 */
const NotificationBannerSkeleton = () => (
  <View className="mt-6 flex-row items-start gap-x-3 rounded-md border border-border bg-white p-4">
    <Skeleton className="h-7 w-7 rounded" />
    <View className="flex-1 gap-y-1.5">
      <Skeleton className="h-4 w-40 rounded" />
      <Skeleton className="h-3 w-56 rounded" />
    </View>
  </View>
);
```

Render it right after `<WelcomeHeaderSkeleton />` inside `HomeScreenSkeleton`.

- [ ] **Step 4: Verify**

Run: `npx tsc --noEmit 2>&1 | rg "src/features/home"`
Expected: no output (no new home-feature type errors). The full `npx tsc --noEmit` will still exit non-zero on the pre-existing errors listed in Global Constraints.

- [ ] **Step 5: Commit**

```bash
git add src/features/home/screens/home-screen.tsx src/features/home/components/skeleton/home-screen-skeleton.tsx
git commit -m "feat(home): wire notification banner and overview loading state into home screen"
```

---

### Task 6: Cleanup dead code, lint, and manual verification

**Files:**

- Delete (if confirmed unused): `src/features/home/utils/helper/is-active-leave.ts`
- Modify: `src/features/home/utils/helper/index.ts`

- [ ] **Step 1: Confirm the old active-leave helper and `useLeaves` are no longer referenced in home**

Run: `rg "isActiveLeave" src --type ts --type tsx`
Expected: no matches outside `src/features/home/utils/helper/is-active-leave.ts` itself (Tasks 3 & 4 removed the only consumers). If matches remain in `src/features/home/**`, stop and update those callers to `isActiveOverviewLeave`.

Run: `rg "useLeaves|from '@hooks'" src/features/home`
Expected: no output. This confirms the user's requirement "remove usage of `use-leaves.ts`" is fully satisfied within the home feature.

- [ ] **Step 2: Delete the dead helper**

If Step 1 confirmed dead:

```bash
git rm src/features/home/utils/helper/is-active-leave.ts
```

In `src/features/home/utils/helper/index.ts`, remove `export * from './is-active-leave';`.

- [ ] **Step 3: Typecheck + lint (scoped and full)**

Run:

```bash
npx tsc --noEmit 2>&1 | rg "src/features/home"   # expect: no output
npx tsc --noEmit 2>&1 | rg -v "use-create-leave|summary-card"  # expect: no output (full run minus the 2 known baseline errors)
npx eslint "src/features/home/**/*.{ts,tsx}"     # expect: pass
```

Expected: no new errors in the home feature, no cross-boundary regressions, lint clean.

- [ ] **Step 4: Commit**

```bash
git add src/features/home/utils/helper/index.ts
git add -u src/features/home/utils/helper/is-active-leave.ts
git commit -m "refactor(home): remove dead is-active-leave helper"
```

> [!TIP] Use targeted staging only
> Do not use `git add -A` here — the working tree may contain unrelated changes. Stage exactly the two files (the `git rm`/`git add -u` above covers the deletion; `git add <path>` covers the barrel edit). Run `git status` before committing to confirm only intended files are staged.

- [ ] **Step 5: Manual smoke test**

Run the app (`npm run ios` or `npm run android`) and verify on the home screen:

1. Skeleton shows briefly, then the screen renders.
2. Notification banner appears under the welcome header (or is hidden when the API returns no `notification_for_me`).
3. "Active Applications" shows the latest leave when it is active; otherwise the "No active leaves" empty state.
4. "Recent History" shows the latest leave when it is not active; otherwise the existing empty state with the "Apply for Your First Leave" button.
5. Pull-to-refresh re-fetches (overview `refetch`).
6. Tapping either leave row navigates to the leave detail screen.
7. No `console.log` remains in `home-screen.tsx`.

> [!CAUTION] Verify the leave-detail navigation still resolves with the overview payload
> The previous home components navigated with machine-format dates (`from_dt1` / `order_dt1`). The overview (`HomeLeaveT`) only exposes display-format `from_dt` / `order_dt`, so Tasks 3 & 4 now pass those. The leave detail RPC may expect the machine format. On the smoke test, open the detail screen from both the active card and the history row. If the detail page fails to load the record, extend `HomeLeaveT` in `types/home.ts` with `from_dt1`/`order_dt1`/`to_dt1` and pass those through to `PAGE_ROUTES.LEAVE.DETAILS` instead.

> [!CAUTION] Known accepted regression — history is now a single row
> The off-screen `useLeaves()` list previously split **all** leaves into Active vs History. The overview exposes only `latest_leave`, so each section now holds **at most one** record, and when `latest_leave` is active the "Recent History" section shows its empty state even though older leaves exist. The existing "View All" link (`PAGE_ROUTES.LEAVE.INDEX`, untouched) remains the escape hatch to the full leave list. This reduction is intended per the user's request; do not reintroduce `useLeaves` to fill it.

---

## Out of Scope

- `src/shared/hooks/use-leaves.ts` is **not** deleted — `src/features/leave/screens/leave-screen.tsx` still uses it. Replacing it there (or moving it into the leave feature) is a separate change.
- `all_notification` (the full notification list) is not rendered — the user chose the `notification_for_me` banner only.
- No changes to the leave feature, routes, or the backend.
