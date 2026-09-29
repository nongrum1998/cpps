# Home Screen Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the home screen from a simple employee list to a personal employee dashboard with stats, quick actions, leave status, and announcements.

**Architecture:** ScrollView-based dashboard with 5 sections stacked vertically. All data sourced from a single mock hook (`useHomeDashboard`) that returns fully typed `HomeDashboardData`. Four new components: `LeaveProgressCard`, `QuickActions`, `ActiveLeaveCard`, `AnnouncementsPreview`. The existing `ScreenHeader`, `Card`, `Text`, and `MaterialCommunityIcons` components are reused.

**Tech Stack:** Expo / React Native, NativeWind, Zustand, MaterialCommunityIcons, reanimated (for FadeInView), Zod for schemas.

**Spec:** `docs/superpowers/specs/2026-06-25-home-screen-redesign.md`

---

### Task 1: Define HomeDashboard types

**Files:**

- Create: `src/features/home/types/dashboard.ts`
- Modify: `src/features/home/types/index.ts`
- Modify: `src/features/home/index.ts`

- [ ] **Step 1: Create the dashboard types file**

Write `src/features/home/types/dashboard.ts`:

```typescript
import { z } from 'zod';

export const LeaveBalanceSchema = z.object({
  used: z.number(),
  total: z.number(),
});
export type LeaveBalanceT = z.infer<typeof LeaveBalanceSchema>;

export const ActiveLeaveSchema = z.object({
  type: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  status: z.union([z.literal('APPROVED'), z.literal('PENDING')]),
  days: z.number(),
});
export type ActiveLeaveT = z.infer<typeof ActiveLeaveSchema>;

export const AnnouncementSchema = z.object({
  id: z.string(),
  title: z.string(),
  date: z.string(),
  preview: z.string(),
});
export type AnnouncementT = z.infer<typeof AnnouncementSchema>;

export const HomeDashboardSchema = z.object({
  leaveBalance: z.object({
    annual: LeaveBalanceSchema,
    sick: LeaveBalanceSchema,
  }),
  attendance: z.object({
    present: z.number(),
    workingDays: z.number(),
  }),
  activeLeave: ActiveLeaveSchema.nullable(),
  announcements: z.array(AnnouncementSchema),
});
export type HomeDashboardT = z.infer<typeof HomeDashboardSchema>;
```

- [ ] **Step 2: Update types barrel export**

Replace `src/features/home/types/index.ts`:

```typescript
export * from './stats';
export * from './dashboard';
```

- [ ] **Step 3: Update feature barrel export**

Modify `src/features/home/index.ts` — the dashboard types are already exported via `types/index.ts` barrel, but ensure components will also be exported. Replace the content with:

```typescript
export * from './screens/home-screen';
export * from './types/stats';
export * from './types/dashboard';
```

- [ ] **Step 4: Verify types compile (optional)**

Run `npx tsc --noEmit` or just proceed — minimal, no dependencies.

---

### Task 2: Create useHomeDashboard mock hook

**Files:**

- Create: `src/features/home/hooks/use-home-dashboard.ts`
- Create: `src/features/home/hooks/index.ts`

- [ ] **Step 1: Create the hook index barrel**

Write `src/features/home/hooks/index.ts`:

```typescript
export * from './use-home-dashboard';
```

- [ ] **Step 2: Create the mock hook**

Write `src/features/home/hooks/use-home-dashboard.ts`:

```typescript
import { HomeDashboardT } from '../types/dashboard';

export function useHomeDashboard(): {
  data: HomeDashboardT;
  isFetching: boolean;
} {
  return {
    data: {
      leaveBalance: {
        annual: { used: 18, total: 30 },
        sick: { used: 4, total: 10 },
      },
      attendance: {
        present: 18,
        workingDays: 22,
      },
      activeLeave: {
        type: 'Annual Leave',
        startDate: '2026-06-28',
        endDate: '2026-06-30',
        status: 'APPROVED',
        days: 3,
      },
      announcements: [
        {
          id: '1',
          title: 'Office Holiday on July 15',
          date: '2026-06-24',
          preview: 'The office will remain closed on July 15th on account of...',
        },
        {
          id: '2',
          title: 'New HR Policy Update',
          date: '2026-06-20',
          preview: 'Please review the updated work-from-home policy on the...',
        },
        {
          id: '3',
          title: 'Salary Credited for June',
          date: '2026-06-01',
          preview: 'Salaries for the month of June have been credited to...',
        },
      ],
    },
    isFetching: false,
  };
}
```

---

### Task 3: Create LeaveProgressCard component

**Files:**

- Create: `src/features/home/components/leave-progress-card.tsx`

- [ ] **Step 1: Write the component**

Write `src/features/home/components/leave-progress-card.tsx`:

```tsx
import React from 'react';
import { View } from 'react-native';
import { Card, CardContent } from '@components/ui/card';
import { Text } from '@components/ui/text';
import { LeaveBalanceT } from '../types/dashboard';

interface ProgressBarProps {
  label: string;
  used: number;
  total: number;
  color: string;
}

const ProgressBar = ({ label, used, total, color }: ProgressBarProps) => {
  const percentage = total > 0 ? used / total : 0;
  return (
    <View className="mb-4">
      <View className="mb-1.5 flex-row items-center justify-between">
        <Text className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</Text>
        <Text className="text-sm font-semibold text-gray-900 dark:text-white">
          {used}/{total}
        </Text>
      </View>
      <View className="h-2.5 overflow-hidden rounded-md bg-gray-100 dark:bg-gray-800">
        <View
          className="h-full rounded-md"
          style={{
            width: `${Math.min(percentage * 100, 100)}%`,
            backgroundColor: color,
          }}
        />
      </View>
    </View>
  );
};

interface LeaveProgressCardProps {
  annual: LeaveBalanceT;
  sick: LeaveBalanceT;
  present: number;
  workingDays: number;
}

export const LeaveProgressCard = ({
  annual,
  sick,
  present,
  workingDays,
}: LeaveProgressCardProps) => (
  <Card className="mx-6">
    <CardContent className="p-5">
      <Text variant="heading" size="lg" className="mb-4 text-gray-900 dark:text-white">
        Leave & Attendance
      </Text>
      <ProgressBar label="Annual Leave" used={annual.used} total={annual.total} color="#3B82F6" />
      <ProgressBar label="Sick Leave" used={sick.used} total={sick.total} color="#F59E0B" />
      <ProgressBar label="Present (Month)" used={present} total={workingDays} color="#10B981" />
    </CardContent>
  </Card>
);
```

---

### Task 4: Create QuickActions component

**Files:**

- Create: `src/features/home/components/quick-actions.tsx`

- [ ] **Step 1: Write the component**

Write `src/features/home/components/quick-actions.tsx`:

```tsx
import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useThemeStore } from '@stores/theme.store';
import { Text } from '@components/ui/text';
import { router } from 'expo-router';
import { PAGE_ROUTES } from '@utils/constants/routes';

type QuickAction = {
  label: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  route: string;
};

const ACTIONS: QuickAction[] = [
  { label: 'Apply Leave', icon: 'calendar-plus', route: PAGE_ROUTES.LEAVE },
  { label: 'View Salary', icon: 'currency-inr', route: PAGE_ROUTES.STATEMENT },
  { label: 'Attendance', icon: 'clipboard-check', route: '' },
  { label: 'Pension', icon: 'bank', route: PAGE_ROUTES.PENSION },
];

export const QuickActions = () => {
  const { theme } = useThemeStore();
  const iconColor = theme === 'dark' ? '#60A5FA' : '#3B82F6';

  return (
    <View className="mx-6">
      <Text variant="heading" size="lg" className="mb-4 text-gray-900 dark:text-white">
        Quick Actions
      </Text>
      <View className="flex-row justify-between">
        {ACTIONS.map((action) => (
          <TouchableOpacity
            key={action.label}
            onPress={() => action.route && router.push(action.route)}
            activeOpacity={0.7}
            className="items-center">
            <View className="mb-2 h-14 w-14 items-center justify-center rounded-md bg-blue-50 dark:bg-blue-900/20">
              <MaterialCommunityIcons name={action.icon} size={26} color={iconColor} />
            </View>
            <Text variant="subtext" size="xs" className="text-center font-medium">
              {action.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};
```

Check `PAGE_ROUTES` — verify the exact route constants exist. From the exploration, the tab routes are: `PAGE_ROUTES.LEAVE`, `PAGE_ROUTES.STATEMENT`, `PAGE_ROUTES.PENSION`. If `PAGE_ROUTES.ATTENDANCE` doesn't exist, the Attendance action will have an empty route (shown as a non-interactive placeholder for now).

---

### Task 5: Create ActiveLeaveCard component

**Files:**

- Create: `src/features/home/components/active-leave-card.tsx`

- [ ] **Step 1: Write the component**

Write `src/features/home/components/active-leave-card.tsx`:

```tsx
import React from 'react';
import { View } from 'react-native';
import { Card, CardContent } from '@components/ui/card';
import { Text } from '@components/ui/text';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { cn } from '@utils/helpers/cn';
import { ActiveLeaveT } from '../types/dashboard';

interface ActiveLeaveCardProps {
  leave: ActiveLeaveT | null;
}

export const ActiveLeaveCard = ({ leave }: ActiveLeaveCardProps) => {
  if (!leave) {
    return (
      <Card className="mx-6">
        <CardContent className="p-5">
          <View className="flex-row items-center">
            <MaterialCommunityIcons name="calendar-check" size={22} color="#9CA3AF" />
            <Text variant="subtext" className="ml-3 text-sm font-medium">
              No upcoming leaves
            </Text>
          </View>
        </CardContent>
      </Card>
    );
  }

  const statusColor =
    leave.status === 'APPROVED'
      ? 'text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/30'
      : 'text-yellow-700 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30';

  return (
    <Card className="mx-6">
      <CardContent className="p-5">
        <View className="mb-3 flex-row items-center justify-between">
          <View className="flex-row items-center">
            <MaterialCommunityIcons name="umbrella" size={22} color="#3B82F6" />
            <Text variant="heading" size="lg" className="ml-2 text-gray-900 dark:text-white">
              Active Leave
            </Text>
          </View>
          <View className={cn('rounded-md px-3 py-1', statusColor)}>
            <Text className="text-xs font-semibold">{leave.status}</Text>
          </View>
        </View>
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {leave.type}
            </Text>
            <Text variant="subtext" size="sm">
              {leave.startDate} — {leave.endDate}
            </Text>
          </View>
          <Text className="text-lg font-bold text-gray-900 dark:text-white">
            {leave.days} {leave.days === 1 ? 'day' : 'days'}
          </Text>
        </View>
      </CardContent>
    </Card>
  );
};
```

---

### Task 6: Create AnnouncementsPreview component

**Files:**

- Create: `src/features/home/components/announcements-preview.tsx`

- [ ] **Step 1: Write the component**

Write `src/features/home/components/announcements-preview.tsx`:

```tsx
import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Text } from '@components/ui/text';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { PAGE_ROUTES } from '@utils/constants/routes';
import { AnnouncementT } from '../types/dashboard';

interface AnnouncementsPreviewProps {
  announcements: AnnouncementT[];
}

export const AnnouncementsPreview = ({ announcements }: AnnouncementsPreviewProps) => (
  <View className="mx-6">
    <View className="mb-4 flex-row items-center justify-between">
      <Text variant="heading" size="lg" className="text-gray-900 dark:text-white">
        Announcements
      </Text>
      <TouchableOpacity onPress={() => router.push(PAGE_ROUTES.ANNOUNCEMENT)}>
        <Text variant="link" className="text-sm font-semibold">
          View All
        </Text>
      </TouchableOpacity>
    </View>
    {announcements.map((item) => (
      <TouchableOpacity
        key={item.id}
        activeOpacity={0.7}
        className="mb-3 rounded-md border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <View className="mb-1 flex-row items-center justify-between">
          <Text
            className="flex-1 text-sm font-semibold text-gray-900 dark:text-white"
            numberOfLines={1}>
            {item.title}
          </Text>
          <MaterialCommunityIcons name="chevron-right" size={18} color="#9CA3AF" />
        </View>
        <Text variant="subtext" size="xs" className="mb-1">
          {item.date}
        </Text>
        <Text variant="subtext" size="sm" numberOfLines={2}>
          {item.preview}
        </Text>
      </TouchableOpacity>
    ))}
  </View>
);
```

Note: The codebase constant is `PAGE_ROUTES.ANNOUNCEMENT` (singular) for route `/announcements`.

---

### Task 7: Rewrite HomeScreen

**Files:**

- Modify: `src/features/home/screens/home-screen.tsx`
- Modify: `src/features/home/components/.keep` → delete (no longer needed)

- [ ] **Step 1: Rewrite the home screen**

Replace `src/features/home/screens/home-screen.tsx`:

```tsx
import React from 'react';
import { ScrollView, TouchableOpacity } from 'react-native';
import { Container } from '@components/layout/container';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Text } from '@components/ui/text';
import { useThemeStore } from '@stores/theme.store';
import { useAuthStore } from '@stores/auth.store';
import { ScreenHeader } from '@components/layout/screen-header';
import { AnimationProvider, FadeInView } from '@components/fade-in-view';
import { useHomeDashboard } from '../hooks/use-home-dashboard';
import { LeaveProgressCard } from '../components/leave-progress-card';
import { QuickActions } from '../components/quick-actions';
import { ActiveLeaveCard } from '../components/active-leave-card';
import { AnnouncementsPreview } from '../components/announcements-preview';

export const HomeScreen = () => {
  const { user } = useAuthStore();
  const { theme } = useThemeStore();
  const { data, isFetching } = useHomeDashboard();
  const isAfterNoon = new Date().getUTCHours() >= 12;

  if (isFetching) return null;

  return (
    <AnimationProvider stagger={80}>
      <Container className="flex-1">
        <ScreenHeader
          title={user ? `${user.first_name} ${user.last_name}` : 'Loading...'}
          subtitle={`${isAfterNoon ? 'Good Afternoon' : 'Good Morning'} · ${user?.department ?? ''}`}
          rightElement={
            <TouchableOpacity className="h-10 w-10 items-center justify-center rounded-md bg-gray-100 dark:bg-gray-800">
              <MaterialCommunityIcons
                name="bell"
                size={24}
                color={theme === 'dark' ? 'white' : 'black'}
              />
            </TouchableOpacity>
          }
        />

        <ScrollView
          className="flex-1 pt-6"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}>
          <FadeInView index={0}>
            <LeaveProgressCard
              annual={data.leaveBalance.annual}
              sick={data.leaveBalance.sick}
              present={data.attendance.present}
              workingDays={data.attendance.workingDays}
            />
          </FadeInView>

          <FadeInView index={1}>
            <View className="my-6">
              <QuickActions />
            </View>
          </FadeInView>

          <FadeInView index={2}>
            <View className="mb-6">
              <ActiveLeaveCard leave={data.activeLeave} />
            </View>
          </FadeInView>

          <FadeInView index={3}>
            <AnnouncementsPreview announcements={data.announcements} />
          </FadeInView>
        </ScrollView>
      </Container>
    </AnimationProvider>
  );
};
```

- [ ] **Step 2: Remove `.keep` file**

```bash
rm src/features/home/components/.keep
```

---

### Task 8: Verify the build

- [ ] **Step 1: Check TypeScript**

Run `npx tsc --noEmit` and fix any type errors.

- [ ] **Step 2: Run lint**

Run `npx expo lint` or the project's lint command.

- [ ] **Step 3: Commit**

```bash
git add src/features/home/ docs/superpowers/plans/2026-06-25-home-screen-redesign.md
git rm src/features/home/components/.keep
git commit -m "feat: redesign home screen as employee dashboard"
```
