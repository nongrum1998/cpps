# StackHeader Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a config-driven `StackHeader` component that auto-detects the current route and renders the correct navigation header — zero per-screen code.

**Architecture:** A central config map (`page-headers.ts`) maps route patterns to header config. A `StackHeader` component reads the current route via `useSegments()`, matches it against the config, and renders the appropriate header (title, back button, slots). A `StackHeaderLayout` wrapper is used in route-group `_layout.tsx` files to render the header automatically for all child routes. Individual route files remove their manual `HeaderStack` usage.

**Tech Stack:** expo-router, react-native, react-native-safe-area-context, @expo/vector-icons (Ionicons), zod (config types)

---

### Task 1: Create config map + types (`page-headers.ts`)

**Files:**

- Create: `src/shared/config/page-headers.ts`

- [ ] **Step 1: Write the config file**

```ts
import type { ReactNode } from 'react';

export interface PageHeaderConfig {
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  leftSlot?: ReactNode;
  rightSlot?: ReactNode;
  bottomContent?: ReactNode;
  background?: string;
}

export const PAGE_HEADERS = {
  '/settings': { title: 'Settings', showBackButton: true },
  '/announcements': { title: 'Announcement Board', showBackButton: true },
  '/employees': { title: 'Employees', showBackButton: true },
  '/employees/[id]': { title: 'Employee Details', showBackButton: true },
  '/employees/[id]/salary': { title: 'Salary History', showBackButton: true },
  '/employees/salary/[id]': { title: 'Pay Slip', showBackButton: true },
  '/pension/[id]': { title: 'Pension Slip', showBackButton: true },
} as const satisfies Record<string, PageHeaderConfig>;

export type PageHeaderRoute = keyof typeof PAGE_HEADERS;
```

- [ ] **Step 2: Verify file compiles**

Run: `npx tsc --noEmit src/shared/config/page-headers.ts` (or project typecheck)
Expected: No type errors.

- [ ] **Step 3: Commit**

```bash
git add src/shared/config/page-headers.ts
git commit -m "feat(config): add page-headers config map for StackHeader"
```

---

### Task 2: Create StackHeader component

**Files:**

- Create: `src/shared/components/layout/stack-header.tsx`
- Modify: `src/shared/components/layout/index.ts`

- [ ] **Step 1: Create the StackHeader component**

```tsx
import React, { useMemo } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { useSegments, useRouter, useNavigation } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@hooks/use-theme';
import { Text } from '@components/ui/text';
import { cn } from '@utils/helpers/cn';
import { PAGE_HEADERS, type PageHeaderConfig } from '@config/page-headers';

/** Build a route path from segments, filtering out route-group segments (e.g. (admin), (drawers)). */
function useRoutePath(): string {
  const segments = useSegments();
  const filtered = segments.filter((s) => !s.startsWith('(') && !s.startsWith(')'));
  return '/' + filtered.join('/');
}

/**
 * Match a path against a config key that may contain `[param]` segments.
 * Exact match first, then regex pattern fallback.
 */
function matchConfig(path: string): PageHeaderConfig | null {
  if (PAGE_HEADERS[path]) return PAGE_HEADERS[path];
  const keys = Object.keys(PAGE_HEADERS).sort((a, b) => b.split('/').length - a.split('/').length);
  for (const key of keys) {
    if (!key.includes('[')) continue;
    const pattern = key.replace(/\[.*?\]/g, '[^/]+');
    const regex = new RegExp(`^${pattern}$`);
    if (regex.test(path)) return PAGE_HEADERS[key];
  }
  return null;
}

export const StackHeader = () => {
  const path = useRoutePath();
  const config = useMemo(() => matchConfig(path), [path]);
  const router = useRouter();
  const navigation = useNavigation();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const canGoBack = navigation.canGoBack();

  if (!config) return null;

  const showBack = config.showBackButton && canGoBack;

  return (
    <View
      className={cn('bg-white dark:bg-slate-950', config.background || '')}
      style={{ paddingTop: insets.top }}>
      <View className="min-h-[56px] flex-row items-center justify-between px-4 py-3">
        <View className="flex-1 flex-row items-center justify-start">
          {showBack && (
            <TouchableOpacity
              onPress={() => router.back()}
              className="mr-3"
              hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
              activeOpacity={0.7}>
              <Ionicons
                name="chevron-back"
                size={24}
                color={theme === 'dark' ? '#F8FAFC' : '#0F172A'}
              />
            </TouchableOpacity>
          )}
          {config.leftSlot}
        </View>

        <View className="flex-[3] items-center justify-center">
          <Text variant="heading" size="lg" weight="semibold" numberOfLines={1}>
            {config.title}
          </Text>
          {config.subtitle && (
            <Text variant="subtext" size="xs" numberOfLines={1} className="mt-0.5">
              {config.subtitle}
            </Text>
          )}
        </View>

        <View className="flex-1 flex-row items-center justify-end">{config.rightSlot}</View>
      </View>

      {config.bottomContent && <View className="px-4 pb-3">{config.bottomContent}</View>}
    </View>
  );
};
```

- [ ] **Step 2: Export from layout index**

```ts
// src/shared/components/layout/index.ts
// Add after existing exports:
export * from './stack-header';
```

- [ ] **Step 3: TypeScript check**

Run: `npx tsc --noEmit`
Expected: No type errors.

- [ ] **Step 4: Commit**

```bash
git add src/shared/components/layout/stack-header.tsx src/shared/components/layout/index.ts
git commit -m "feat(ui): add StackHeader component with auto-route detection"
```

---

### Task 3: Create StackHeaderLayout wrapper

**Files:**

- Create: `src/shared/components/layout/stack-header-layout.tsx`
- Modify: `src/shared/components/layout/index.ts`

- [ ] **Step 1: Create StackHeaderLayout**

```tsx
import React from 'react';
import { View } from 'react-native';
import { Slot } from 'expo-router';
import { StackHeader } from './stack-header';

export const StackHeaderLayout = () => (
  <View className="flex-1 bg-white dark:bg-slate-950">
    <StackHeader />
    <Slot />
  </View>
);
```

- [ ] **Step 2: Export from layout index**

```ts
// src/shared/components/layout/index.ts — add:
export * from './stack-header-layout';
```

- [ ] **Step 3: Commit**

```bash
git add src/shared/components/layout/stack-header-layout.tsx src/shared/components/layout/index.ts
git commit -m "feat(ui): add StackHeaderLayout wrapper for auto header rendering"
```

---

### Task 4: Create `_layout.tsx` files for route groups + remove `HeaderStack` from individual routes

**Files:**

- Create: `src/app/(admin)/_layout.tsx`
- Create: `src/app/settings/_layout.tsx`
- Create: `src/app/announcements/_layout.tsx`
- Create: `src/app/pension/_layout.tsx`
- Modify: `src/app/settings/index.tsx`
- Modify: `src/app/announcements/index.tsx`
- Modify: `src/app/(admin)/employees/index.tsx`
- Modify: `src/app/(admin)/employees/[id]/index.tsx`
- Modify: `src/app/(admin)/employees/salary/[id]/index.tsx`
- Modify: `src/app/pension/[id]/index.tsx`
- Modify: `src/features/pension/screens/pension-detail-screen.tsx`

- [ ] **Step 1: Create `src/app/(admin)/_layout.tsx`**

```tsx
import { Stack } from 'expo-router';
import { StackHeaderLayout } from '@components/layout/stack-header-layout';

export default function AdminLayout() {
  return (
    <StackHeaderLayout>
      <Stack screenOptions={{ headerShown: false }} />
    </StackHeaderLayout>
  );
}
```

Wait — `StackHeaderLayout` wraps `<Slot />` but here we need it to wrap `<Stack />`. Let me adjust the design. The `StackHeaderLayout` currently renders `StackHeader` above `<Slot />`. But for the admin group, we need the `Stack` navigator to be the content.

I think we need `StackHeaderLayout` to accept children:

```tsx
export const StackHeaderLayout = ({ children }: { children?: React.ReactNode }) => (
  <View className="flex-1 bg-white dark:bg-slate-950">
    <StackHeader />
    {children ?? <Slot />}
  </View>
);
```

Actually, for routes like `settings/index.tsx` that don't have a nested Stack, we use the default `<Slot />`. For `(admin)/_layout.tsx` that has a nested `Stack`, we pass children.

Let me update:

- [ ] **Step 1: Update StackHeaderLayout to accept children**

```tsx
import React from 'react';
import { View } from 'react-native';
import { Slot } from 'expo-router';
import { StackHeader } from './stack-header';

interface StackHeaderLayoutProps {
  children?: React.ReactNode;
}

export const StackHeaderLayout = ({ children }: StackHeaderLayoutProps) => (
  <View className="flex-1 bg-white dark:bg-slate-950">
    <StackHeader />
    {children ?? <Slot />}
  </View>
);
```

- [ ] **Step 2: Create `src/app/settings/_layout.tsx`**

```tsx
import { StackHeaderLayout } from '@components/layout/stack-header-layout';

export default function SettingsLayout() {
  return <StackHeaderLayout />;
}
```

- [ ] **Step 3: Create `src/app/announcements/_layout.tsx`**

```tsx
import { StackHeaderLayout } from '@components/layout/stack-header-layout';

export default function AnnouncementsLayout() {
  return <StackHeaderLayout />;
}
```

- [ ] **Step 4: Create `src/app/pension/_layout.tsx`**

```tsx
import { Stack } from 'expo-router';
import { StackHeaderLayout } from '@components/layout/stack-header-layout';

export default function PensionLayout() {
  return (
    <StackHeaderLayout>
      <Stack screenOptions={{ headerShown: false }} />
    </StackHeaderLayout>
  );
}
```

- [ ] **Step 5: Update `src/app/settings/index.tsx`** — remove `HeaderStack`

```tsx
import { SettingsScreen } from '@features/settings/screens/settings-screen';

export default function Page() {
  return <SettingsScreen />;
}
```

- [ ] **Step 6: Update `src/app/announcements/index.tsx`** — remove `HeaderStack`

```tsx
import React from 'react';
import { AnnouncementBoardScreen } from '@features/announcements';

export default function AnnouncementsRoute() {
  return <AnnouncementBoardScreen />;
}
```

- [ ] **Step 7: Update `src/app/(admin)/employees/index.tsx`** — remove `HeaderStack`

```tsx
import EmployeeListScreen from '@features/employee/screens/employee-list-screen';
import { useAuthStore } from '@stores/auth.store';
import { NotFoundScreen } from '@components/screens/not-found-screen';

export default function Page() {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN';

  if (!isAdmin) {
    return <NotFoundScreen title="Unauthorized" message="You don't have access to this page." />;
  }

  return <EmployeeListScreen />;
}
```

- [ ] **Step 8: Update `src/app/(admin)/employees/[id]/index.tsx`** — remove `HeaderStack`

```tsx
import EmployeeDetailScreen from '@features/employee/screens/employee-details';
import { useAuthStore } from '@stores/auth.store';
import { NotFoundScreen } from '@components/screens/not-found-screen';

export default function Page() {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN';
  if (!isAdmin) {
    return <NotFoundScreen title="Unauthorized" message="You don't have access to this page." />;
  }
  return <EmployeeDetailScreen />;
}
```

- [ ] **Step 9: Update `src/app/(admin)/employees/salary/[id]/index.tsx`** — remove `HeaderStack`

```tsx
import { PayslipScreen } from '@features/salary/screens/payslip-screen';
import { useLocalSearchParams } from 'expo-router';

export default function Page() {
  const { id } = useLocalSearchParams();

  return <PayslipScreen salaryId={id.toString()} />;
}
```

- [ ] **Step 10: Update `src/app/pension/[id]/index.tsx`** — the layout handles the header now

```tsx
import { PensionDetailScreen } from '@features/pension/screens/pension-detail-screen';

export default function Page() {
  return <PensionDetailScreen />;
}
```

(File stays the same — no change needed, it already has no HeaderStack)

- [ ] **Step 11: Remove it from `src/features/pension/screens/pension-detail-screen.tsx`** — remove inline `<Header>`

Find and remove the `<Header title="Pension Slip" showBackButton={true} />` line and the corresponding import of `Header`.

- [ ] **Step 12: TypeScript check**

Run: `npx tsc --noEmit`
Expected: No type errors.

- [ ] **Step 13: Commit all remaining changes**

```bash
git add src/app/ src/features/pension/
git commit -m "feat(nav): auto-render StackHeader via layout files, remove per-screen HeaderStack"
```

---

### Task 5: Verify and cleanup

- [ ] **Step 1: Run full typecheck**

Run: `npx tsc --noEmit`
Expected: Clean.

- [ ] **Step 2: Run linter**

Run: `npx eslint src/ --ext .ts,.tsx`
Expected: Clean or only pre-existing warnings.

- [ ] **Step 3: Final commit if any fixes**

```bash
git add -A
git commit -m "chore: fix lint/type issues from StackHeader migration"
```
