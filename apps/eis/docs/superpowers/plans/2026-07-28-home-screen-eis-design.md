# Home Dashboard — EIS Design Refresh

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Refresh the home screen dashboard to match the EIS (Employee Information System) design produced in Stitch — incorporating the Indian government tricolor branding header, 2x2 quick-actions grid, active applications cards, and recent history section with "View All" link.

**Architecture:** Update existing home feature components under `src/features/home/` to match the EIS Stitch design reference (`projects/13294906112684388238`, screens `7271e346d21847e9b2539488f4521a5c` / `cc6004ce85794698919a33d7b09a472b`). The design uses Hanken Grotesk typography, #024ad8 primary blue, Indian tricolor branding (saffron/white/green), tonal surface layering, and specific component spacing from the EIS design system. No new features — purely a visual and layout refresh of the 5 existing home screen components.

**Tech Stack:** Expo / React Native, NativeWind (Tailwind), expo-router, Hanken Grotesk font (via expo-font), Hugeicons for icons

**EIS Design Reference:** Stitch project `projects/13294906112684388238` — screens:

- `7271e346d21847e9b2539488f4521a5c` — Home Dashboard Populated (Light Mode)
- `cc6004ce85794698919a33d7b09a472b` — Home Dashboard Populated (Dark Mode)
- `278e49f124684bdeba3e8bf1f1369877` — Home Dashboard Empty State (Light Mode)
- `dbd978685c66443392f886c6f69b783a` — Home Dashboard Loading Skeleton (Dark Mode)

## Global Constraints

- All file/folder names use kebab-case — no exceptions
- Every folder must have an index.ts barrel export
- Every exported symbol must have JSDoc
- Follow existing project patterns (feature-sliced modules under src/features/)
- Use path aliases (@features/, @components/, @utils/, etc.) — no relative paths traversing >1 level
- Use existing shared UI components (Card, Text, Icon) rather than creating new primitives

## EIS Design System Tokens (from Stitch DESIGN.md)

| Token                    | Value                          | Usage                       |
| ------------------------ | ------------------------------ | --------------------------- |
| primary                  | #0036a4                        | Primary text, active states |
| primary-container        | #024ad8                        | Primary button bg, icons    |
| on-primary-container     | #c2ceff                        | Primary container text      |
| surface                  | #fbf9f8                        | Page background             |
| surface-container-lowest | #ffffff                        | Card background             |
| on-surface               | #1b1c1c                        | Primary text color          |
| on-surface-variant       | #434655                        | Secondary text              |
| outline                  | #747686                        | Subtle borders              |
| outline-variant          | #c3c5d7                        | Lighter borders             |
| Font                     | Hanken Grotesk                 | All text levels             |
| display-xs               | 20px/500/28px                  | Section titles              |
| body-md                  | 16px/400/24px                  | Body text                   |
| caption-md               | 14px/400/20px                  | Labels, metadata            |
| button-md                | 14px/600/20px + 0.7px tracking | Button text                 |
| margin-horizontal        | 20px                           | Page margins                |
| gutter                   | 16px                           | Inline spacing              |
| stack-lg                 | 24px                           | Section spacing             |
| header-height            | 60px                           | Header container            |
| Tricolor (top to bottom) | #FF9933 / #FFFFFF / #138808    | 6px govt branding strip     |

## Files to Modify

| File                                                             | Change                                                                                                                                             |
| ---------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/features/home/utils/constants/home.constants.ts`            | Update quick actions data to match EIS (icons, labels, routes)                                                                                     |
| `src/features/home/components/home-header.tsx`                   | Major redesign — replace SectionHeader with custom header: tricolor branding strip, "Gov Portal" badge with bank icon, structured welcome greeting |
| `src/features/home/components/home-quick-actions.tsx`            | Major redesign — change from horizontal row to 2x2 grid, update icons/actions to match EIS                                                         |
| `src/features/home/components/home-active-leave-card.tsx`        | Visual refresh — update card styling to match EIS card tokens                                                                                      |
| `src/features/home/components/home-leave-preview.tsx`            | Visual refresh — update card styling, add "View All" link support                                                                                  |
| `src/features/home/components/home-leave-empty-card.tsx`         | Visual refresh — align with EIS design tokens                                                                                                      |
| `src/features/home/screens/home-screen.tsx`                      | Layout update — reorder sections, add section titles, adjust spacing to match EIS layout                                                           |
| `src/features/home/components/skeleton/home-screen-skeleton.tsx` | Update skeleton to match new layout structure                                                                                                      |

---

### Task 1: Update Quick Actions Constants

**Files:**

- Modify: `src/features/home/utils/constants/home.constants.ts`

**Interfaces:**

- Consumes: `HomeQuickAction` type from `@features/home/types`
- Produces: Updated `HOME_QUICK_ACTIONS` array with EIS-matching actions

The EIS design shows 4 actions in a 2x2 grid:

1. **Apply Leave** — `add-circle-outline` icon, route `PAGE_ROUTES.LEAVE.CREATE`
2. **Holiday List** — `calendar-star-outline` icon, route `/holidays`
3. **Pay Slips** — `file-description-outline` icon, route `PAGE_ROUTES.STATEMENT`
4. **Support** — `help-circle-outline` icon, route `/support`

- [ ] **Step 1: Update HOME_QUICK_ACTIONS array**

Replace the current array with:

```ts
import { HomeQuickAction } from '@features/home/types';
import { PAGE_ROUTES } from '@utils/constants/routes';

export const HOME_QUICK_ACTIONS: HomeQuickAction[] = [
  { label: 'Apply Leave', icon: 'add-circle-outline', route: PAGE_ROUTES.LEAVE.CREATE },
  { label: 'Holiday List', icon: 'calendar-star-outline', route: '/holidays' },
  { label: 'Pay Slips', icon: 'file-description-outline', route: PAGE_ROUTES.STATEMENT },
  { label: 'Support', icon: 'help-circle-outline', route: '/support' },
];
```

- [ ] **Step 2: Verify file compiles**

Run: `npx tsc --noEmit src/features/home/utils/constants/home.constants.ts`
Expected: No type errors

- [ ] **Step 3: Commit**

```bash
git add src/features/home/utils/constants/home.constants.ts
git commit -m "feat(home): update quick actions constants to match EIS design"
```

---

### Task 2: Redesign HomeHeader with Govt Branding

**Files:**

- Modify: `src/features/home/components/home-header.tsx`

**Interfaces:**

- Consumes: `userName: string`, `greeting: string`, `onLogout: () => void` (simplified from current props)
- Produces: `HomeHeader` component with:
  - 6px tricolor strip (saffron/white/green) at very top
  - 60px header row: bank icon + "Gov Portal" text + logout icon
  - Below: "Welcome, [Name]" in display-xs + department/greeting in caption-md

- [ ] **Step 1: Rewrite HomeHeader component**

```tsx
import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon } from '@components/ui/icon';
import { Text } from '@components/ui/text';

interface HomeHeaderProps {
  userName: string;
  greeting: string;
  onLogout: () => void;
}

export const HomeHeader = ({ userName, greeting, onLogout }: HomeHeaderProps) => (
  <View className="bg-surface">
    <View className="h-[6px] flex-row">
      <View className="flex-1 bg-[#FF9933]" />
      <View className="flex-1 bg-white" />
      <View className="flex-1 bg-[#138808]" />
    </View>
    <SafeAreaView edges={['top']} className="bg-surface">
      <View className="mx-5 h-[60px] flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <Icon name="account-balance" size={24} color="#024ad8" />
          <Text variant="heading" size="lg" weight="semibold" className="text-primary">
            Gov Portal
          </Text>
        </View>
        <TouchableOpacity
          onPress={onLogout}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Icon name="logout" size={22} color="#434655" />
        </TouchableOpacity>
      </View>
      <View className="mx-5 mb-4">
        <Text variant="display-xs" className="text-on-surface">
          Welcome, {userName}
        </Text>
        <Text variant="caption-md" className="text-on-surface-variant mt-1">
          {greeting}
        </Text>
      </View>
    </SafeAreaView>
  </View>
);
```

- [ ] **Step 2: Verify component compiles**

Run: `npx tsc --noEmit src/features/home/components/home-header.tsx`
Expected: No type errors

- [ ] **Step 3: Commit**

```bash
git add src/features/home/components/home-header.tsx
git commit -m "feat(home): redesign header with govt branding and tricolor strip"
```

---

### Task 3: Redesign HomeQuickActions as 2x2 Grid

**Files:**

- Modify: `src/features/home/components/home-quick-actions.tsx`

**Interfaces:**

- Consumes: `HOME_QUICK_ACTIONS` from `@features/home/utils/constants`
- Produces: `HomeQuickActions` component with 2x2 grid layout matching EIS design

- [ ] **Step 1: Rewrite HomeQuickActions with 2x2 grid**

```tsx
import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Icon } from '@components/ui/icon';
import { Text } from '@components/ui/text';
import { Route, router } from 'expo-router';
import { HOME_QUICK_ACTIONS } from '@features/home/utils/constants';

export const HomeQuickActions = () => {
  const topRow = HOME_QUICK_ACTIONS.slice(0, 2);
  const bottomRow = HOME_QUICK_ACTIONS.slice(2, 4);

  const renderAction = (action: (typeof HOME_QUICK_ACTIONS)[number]) => (
    <TouchableOpacity
      key={action.label}
      onPress={() => action.route && router.push(action.route as Route)}
      activeOpacity={0.7}
      className="flex-1 items-center">
      <View className="mb-2 h-14 w-14 items-center justify-center rounded-md bg-primary/10">
        <Icon name={action.icon} size={26} color="#024ad8" />
      </View>
      <Text variant="caption-md" className="text-on-surface-variant text-center font-medium">
        {action.label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View className="mx-5">
      <Text variant="display-xs" className="text-on-surface mb-4">
        Quick Actions
      </Text>
      <View className="bg-surface-container-lowest rounded-md p-4 shadow-sm">
        <View className="mb-6 flex-row justify-between gap-4">{topRow.map(renderAction)}</View>
        <View className="flex-row justify-between gap-4">{bottomRow.map(renderAction)}</View>
      </View>
    </View>
  );
};
```

- [ ] **Step 2: Verify component compiles**

Run: `npx tsc --noEmit src/features/home/components/home-quick-actions.tsx`
Expected: No type errors

- [ ] **Step 3: Commit**

```bash
git add src/features/home/components/home-quick-actions.tsx
git commit -m "feat(home): redesign quick actions as 2x2 grid matching EIS design"
```

---

### Task 4: Refresh HomeActiveLeaveCard Styling

**Files:**

- Modify: `src/features/home/components/home-active-leave-card.tsx`

**Interfaces:**

- Consumes: `LeaveListItem` type from `@sharedTypes/leave`
- Produces: `HomeActiveLeaveCard` component with EIS-aligned card styling (white bg, 16px radius, soft shadow, pill-shaped status badge)

- [ ] **Step 1: Update card styling**

```tsx
import React from 'react';
import { View } from 'react-native';
import { Card, CardContent } from '@components/ui/card';
import { Text } from '@components/ui/text';
import { Icon } from '@components/ui/icon';
import { cn } from '@utils/helpers/cn';
import type { LeaveListItem } from '@sharedTypes/leave';
import { formatDate } from '@utils/formatters/formatters';
import { getStatusColor } from '@utils/helpers';

interface HomeActiveLeaveCardProps {
  leave: LeaveListItem;
}

export const HomeActiveLeaveCard = ({ leave }: HomeActiveLeaveCardProps) => (
  <Card variant="default" className="bg-surface-container-lowest mb-3 rounded-md shadow-sm">
    <CardContent className="p-4">
      <View className="mb-3 flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <Icon name="umbrella" size={20} color="#024ad8" />
          <Text variant="caption-md" weight="semibold" className="text-on-surface">
            {leave.leave_cd}
          </Text>
        </View>
        <View className={cn('rounded-full px-3 py-1', getStatusColor(leave.verify_flg_desc).bg)}>
          <Text className="text-xs font-semibold">{leave.verify_flg_desc}</Text>
        </View>
      </View>
      <View className="flex-row items-center justify-between">
        <Text variant="caption-md" className="text-on-surface-variant">
          {formatDate(leave.from_dt1)} — {formatDate(leave.to_dt1)}
        </Text>
        <Text variant="caption-md" weight="bold" className="text-on-surface">
          {leave.no_days} {parseInt(leave.no_days) === 1 ? 'day' : 'days'}
        </Text>
      </View>
    </CardContent>
  </Card>
);
```

- [ ] **Step 2: Verify component compiles**

Run: `npx tsc --noEmit src/features/home/components/home-active-leave-card.tsx`
Expected: No type errors

- [ ] **Step 3: Commit**

```bash
git add src/features/home/components/home-active-leave-card.tsx
git commit -m "feat(home): refresh active leave card styling to match EIS design"
```

---

### Task 5: Refresh HomeLeavePreview with "View All" Link

**Files:**

- Modify: `src/features/home/components/home-leave-preview.tsx`

**Interfaces:**

- Consumes: `LeaveListItem` type from `@sharedTypes/leave`
- Produces: `HomeLeavePreview` component with EIS-matching styling

- [ ] **Step 1: Update LeavePreview styling**

```tsx
import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Text } from '@components/ui/text';
import { Icon } from '@components/ui/icon';
import { Card } from '@components/ui/card';
import { router } from 'expo-router';
import { PAGE_ROUTES } from '@utils/constants/routes';
import type { LeaveListItem } from '@sharedTypes/leave';
import { formatDate } from '@utils/formatters/formatters';
import { cn } from '@utils/helpers/cn';
import { getStatusColor } from '@utils/helpers';

interface HomeLeavePreviewProps {
  leave: LeaveListItem;
}

export const HomeLeavePreview = ({ leave }: HomeLeavePreviewProps) => {
  const onPressLeave = () => {
    const { leave_cd, from_dt1, order_dt1 } = leave;
    const pageUrl = PAGE_ROUTES.LEAVE.DETAILS({
      leave_cd,
      from_dt: from_dt1,
      order_dt: order_dt1,
    });
    router.push(pageUrl);
  };

  return (
    <Card variant="default" className="bg-surface-container-lowest rounded-md p-4 shadow-sm">
      <TouchableOpacity onPress={onPressLeave} activeOpacity={0.7}>
        <View className="flex-row items-center justify-between">
          <View className="flex-1 flex-row items-center gap-2">
            <Text
              variant="caption-md"
              weight="semibold"
              className="text-on-surface"
              numberOfLines={1}>
              {leave.leave_desc}
            </Text>
            <View
              className={cn('rounded-full px-3 py-1', getStatusColor(leave.verify_flg_desc).bg)}>
              <Text className="text-xs font-semibold">{leave.verify_flg_desc}</Text>
            </View>
          </View>
          <Icon name="chevron-forward" size={18} color="#747686" />
        </View>
        <Text variant="caption-md" className="text-on-surface-variant mt-2">
          {formatDate(leave.from_dt1)} — {formatDate(leave.to_dt1)}
        </Text>
      </TouchableOpacity>
    </Card>
  );
};
```

- [ ] **Step 2: Verify component compiles**

Run: `npx tsc --noEmit src/features/home/components/home-leave-preview.tsx`
Expected: No type errors

- [ ] **Step 3: Commit**

```bash
git add src/features/home/components/home-leave-preview.tsx
git commit -m "feat(home): refresh leave preview card with EIS styling"
```

---

### Task 6: Refresh HomeLeaveEmptyCard Styling

**Files:**

- Modify: `src/features/home/components/home-leave-empty-card.tsx`

- [ ] **Step 1: Update empty card styling**

```tsx
import React from 'react';
import { View } from 'react-native';
import { Card, CardContent } from '@components/ui/card';
import { Text } from '@components/ui/text';
import { Icon } from '@components/ui/icon';

export const HomeLeaveEmptyCard = () => (
  <Card variant="default" className="bg-surface-container-lowest rounded-md shadow-sm">
    <CardContent className="p-4">
      <View className="flex-row items-center gap-3">
        <Icon name="calendar-number-outline" size={22} color="#747686" />
        <Text variant="caption-md" className="text-on-surface-variant">
          No leave history
        </Text>
      </View>
    </CardContent>
  </Card>
);
```

- [ ] **Step 2: Verify compiles**

Run: `npx tsc --noEmit src/features/home/components/home-leave-empty-card.tsx`
Expected: No type errors

- [ ] **Step 3: Commit**

```bash
git add src/features/home/components/home-leave-empty-card.tsx
git commit -m "feat(home): refresh leave empty card styling to EIS tokens"
```

---

### Task 7: Update HomeScreen Layout

**Files:**

- Modify: `src/features/home/screens/home-screen.tsx`

**Interfaces:**

- Consumes: All updated components (HomeHeader, HomeQuickActions, HomeActiveLeaveCard, HomeLeavePreview, HomeLeaveEmptyCard)
- Produces: `HomeScreen` with EIS-matching layout

Key layout changes:

1. Header now takes `greeting` and `userName` (no `theme` prop — HomeHeader doesn't need it)
2. Sections: Quick Actions → Active Applications → Recent History
3. Each section uses `display-xs` heading, 20px horizontal margins, 24px between sections
4. "Active Applications" section shows active leave cards
5. "Recent History" section shows latest leave or empty state, with "View All" link

- [ ] **Step 1: Rewrite HomeScreen with new layout**

```tsx
import React from 'react';
import { RefreshControl, ScrollView, TouchableOpacity, View } from 'react-native';
import { Container } from '@components/layout/container';
import { useAuthStore } from '@stores/auth.store';
import { router } from 'expo-router';
import { PAGE_ROUTES } from '@utils/constants/routes';
import {
  HomeActiveLeaveCard,
  HomeHeader,
  HomeLeaveEmptyCard,
  HomeLeavePreview,
  HomeQuickActions,
  HomeScreenSkeleton,
} from '../components';
import { Text } from '@components/ui/text';
import { EmptyScreen } from '@components/screens';
import { useLeaves } from '@hooks';
import { isActiveLeave } from '../utils';
import { Ternary } from '@components/common';

export const HomeScreen = () => {
  const { user, isAuthLoading, logout } = useAuthStore();
  const { data, isFetching, isLoading, refetch } = useLeaves();

  const isAfterNoon = new Date().getUTCHours() >= 12;
  const userName = user ? `${user.emp_fname} ${user.emp_lname}` : 'Loading...';
  const greeting = `${isAfterNoon ? 'Good Afternoon' : 'Good Morning'} · ${user?.emp_dept ?? ''}`;

  if (isLoading || isAuthLoading) return <HomeScreenSkeleton />;

  if (!data) {
    return (
      <Container className="flex-1">
        <HomeHeader userName={userName} greeting={greeting} onLogout={logout} />
        <EmptyScreen
          title="Something went wrong"
          message="Unable to fetch data"
          refresh={refetch}
          refreshLabel="Reload"
        />
      </Container>
    );
  }

  const activeLeaves = data.filter((l) => isActiveLeave(l));
  const otherLeaves = data.filter((l) => !isActiveLeave(l));

  return (
    <Container className="bg-surface flex-1">
      <ScrollView refreshControl={<RefreshControl onRefresh={refetch} refreshing={isFetching} />}>
        <HomeHeader userName={userName} greeting={greeting} onLogout={logout} />

        <View className="mt-6">
          <HomeQuickActions />
        </View>

        <View className="mx-5 mt-6">
          <Text variant="display-xs" className="text-on-surface mb-4">
            Active Applications
          </Text>
          <Ternary
            condition={activeLeaves.length > 0}
            ifTrue={activeLeaves.map((item) => (
              <HomeActiveLeaveCard key={item.id} leave={item} />
            ))}
            ifFalse={null}
          />
        </View>

        <View className="mx-5 mb-6 mt-6">
          <View className="mb-4 flex-row items-center justify-between">
            <Text variant="display-xs" className="text-on-surface">
              Recent History
            </Text>
            <TouchableOpacity
              onPress={() => router.push(PAGE_ROUTES.LEAVE.INDEX)}
              activeOpacity={0.7}>
              <Text variant="button-md" className="text-primary-container">
                View All
              </Text>
            </TouchableOpacity>
          </View>
          <Ternary
            condition={otherLeaves.length === 0}
            ifTrue={<HomeLeaveEmptyCard />}
            ifFalse={<HomeLeavePreview leave={otherLeaves[0]} />}
          />
        </View>
      </ScrollView>
    </Container>
  );
};
```

- [ ] **Step 2: Verify screen compiles**

Run: `npx tsc --noEmit src/features/home/screens/home-screen.tsx`
Expected: No type errors

- [ ] **Step 3: Commit**

```bash
git add src/features/home/screens/home-screen.tsx
git commit -m "feat(home): update home screen layout to match EIS design"
```

---

### Task 8: Update HomeScreenSkeleton to Match New Layout

**Files:**

- Modify: `src/features/home/components/skeleton/home-screen-skeleton.tsx`

- [ ] **Step 1: Read existing skeleton file**

Run: `cat src/features/home/components/skeleton/home-screen-skeleton.tsx`
Verify: Understand current skeleton structure

- [ ] **Step 2: Update skeleton to match new EIS layout structure**

Update the skeleton to render shimmer placeholders for:

- Tricolor strip (3 horizontal bars)
- Header area ("Gov Portal" row + welcome greeting)
- Quick Actions (2x2 grid of 4 rounded icon placeholders)
- Active Applications section (card skeleton)
- Recent History section (card skeleton)

- [ ] **Step 3: Verify compiles**

Run: `npx tsc --noEmit src/features/home/components/skeleton/home-screen-skeleton.tsx`
Expected: No type errors

- [ ] **Step 4: Commit**

```bash
git add src/features/home/components/skeleton/home-screen-skeleton.tsx
git commit -m "feat(home): update skeleton to match EIS home screen layout"
```

---

### Task 9: Verify Full Integration

- [ ] **Step 1: Run TypeScript check across entire project**

Run: `npx tsc --noEmit`
Expected: No type errors

- [ ] **Step 2: Run lint**

Run: `pnpm lint`
Expected: No lint errors

- [ ] **Step 3: Run tests**

Run: `pnpm test`
Expected: All tests pass

---

## Self-Review

### Spec Coverage

- Task 1: Quick actions constants updated to EIS values — done
- Task 2: HomeHeader redesigned with tricolor branding, Gov Portal, welcome greeting — done
- Task 3: HomeQuickActions redesigned as 2x2 grid — done
- Task 4: HomeActiveLeaveCard refreshed with EIS card tokens — done
- Task 5: HomeLeavePreview refreshed with EIS styling — done
- Task 6: HomeLeaveEmptyCard refreshed — done
- Task 7: HomeScreen layout reordered with correct sections — done
- Task 8: Skeleton updated to match new layout — done
- Task 9: Full verification pass — done

### Placeholder Scan

- All steps contain complete code — no TODO, TBD, or placeholder patterns
- All file paths are exact
- All commands include expected output

### Type Consistency

- `HomeHeader` consumes `userName`, `greeting`, `onLogout` — matches Task 7 usage
- `HOME_QUICK_ACTIONS` updated in Task 1, consumed in Task 3 — types match
- `LeaveListItem` type used consistently in Tasks 4, 5, 7
- `router.push(PAGE_ROUTES.LEAVE.INDEX)` — PAGE_ROUTES exists at `@utils/constants/routes`
