# Login Screen Skeleton Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add skeleton loading state to the login screen following existing project patterns.

**Architecture:** Create a `LoginScreenSkeleton` component in the auth feature's `components/skeleton/` directory (matching the pattern used by leave, salary, announcements, and home features). The skeleton replaces the form content while `isAuthLoading` is true — the same pattern used by home/leave/salary screens to replace generic `LoadingScreen` with content-aware shimmer layouts.

**Tech Stack:** TypeScript strict mode, React Native, expo-router, nativewind (Tailwind), react-native-reanimated (skeleton pulse animation)

---

### Task 1: Create `login-skeleton.tsx`

**Files:**

- Create: `src/features/auth/components/skeleton/login-skeleton.tsx`

- [ ] **Step 1: Write the component file**

````tsx
import React from 'react';
import { View } from 'react-native';
import { Container, KeyboardSafeView } from '@components/layout';
import { SectionHeaderSkeleton } from '@components/skeleton/section-header';
import { Skeleton } from '@components/ui/skeleton';

/** Skeleton placeholder for a single form input field (label + input block). */
const FieldSkeleton = ({ labelWidth = 20 }: { labelWidth?: number }) => (
  <View className="my-2 w-full gap-y-2">
    <View className="h-3" style={{ width: labelWidth }}>
      <Skeleton className="h-3 w-full rounded" />
    </View>
    <Skeleton className="h-11 w-full rounded" />
  </View>
);

/**
 * Full-page skeleton loading state for the login screen.
 *
 * Mirrors the layout of {@link LoginScreen} with shimmer placeholders for:
 * - GovtHeader (title + subtitle)
 * - Employee Code input field
 * - Password input field
 * - "Forgot password?" link
 * - Continue button
 * - AuthFooter (register link)
 * - Dev-mode UI Laboratory link
 *
 * Renders inside a `KeyboardSafeView` within `Container` to match the
 * actual login screen's scroll/keyboard-avoidance behaviour.
 *
 * @example
 * ```tsx
 * if (isAuthLoading) return <LoginScreenSkeleton />;
 * ```
 */
export const LoginScreenSkeleton = () => (
  <Container>
    <KeyboardSafeView contentContainerClassName="px-6 justify-center">
      {/* GovtHeader placeholder */}
      <SectionHeaderSkeleton hasSubtitle titleWidth="w-36" subtitleWidth="w-56" />

      {/* Employee Code field */}
      <FieldSkeleton labelWidth={24} />

      {/* Password field */}
      <FieldSkeleton labelWidth={16} />

      {/* Forgot password link */}
      <View className="mb-8 items-end">
        <Skeleton className="h-4 w-36 rounded" />
      </View>

      {/* Continue button */}
      <Skeleton className="h-11 w-full rounded" />

      {/* AuthFooter */}
      <View className="mt-8 items-center">
        <Skeleton className="h-4 w-48 rounded" />
      </View>

      {/* Dev UI Lab link (visible in dev only, but skeleton shows it always) */}
      <View className="mt-8 items-center">
        <Skeleton className="h-8 w-44 rounded-md" />
      </View>
    </KeyboardSafeView>
  </Container>
);
````

- [ ] **Step 2: Verify file structure**

Run: `ls src/features/auth/components/skeleton/login-skeleton.tsx`
Expected: File exists

---

### Task 2: Create barrel export `index.ts`

**Files:**

- Create: `src/features/auth/components/skeleton/index.ts`

- [ ] **Step 1: Write the barrel export**

```ts
export * from './login-skeleton';
```

- [ ] **Step 2: Verify barrel export**

Run: `cat src/features/auth/components/skeleton/index.ts`
Expected: `export * from './login-skeleton';`

---

### Task 3: Integrate into `login-screen.tsx`

**Files:**

- Modify: `src/features/auth/screens/login-screen.tsx` (add import + early return guard)

- [ ] **Step 1: Add the import**

Add at the top of the file (with the other imports):

```tsx
import { LoginScreenSkeleton } from '../components/skeleton/login-skeleton';
```

- [ ] **Step 2: Add the loading guard**

After the line `const { isSignedIn, isAuthLoading } = useAuthStore();`, add:

```tsx
if (isAuthLoading) return <LoginScreenSkeleton />;
```

This shows the skeleton while the auth store is hydrating from SecureStore.
Once hydration completes (`isAuthLoading` → `false`), the real form renders.
This is distinct from `isPending` (used for button spinner during form submission).

- [ ] **Step 3: Verify the change**

Run: `grep -n "LoginScreenSkeleton\|isAuthLoading" src/features/auth/screens/login-screen.tsx`
Expected: Import line and early return guard are present

---

### Task 4: Verify build

- [ ] **Step 1: Run linter**

Run: `pnpm lint`
Expected: No errors

- [ ] **Step 2: Commit**

```bash
git add src/features/auth/components/skeleton/login-skeleton.tsx \
       src/features/auth/components/skeleton/index.ts \
       src/features/auth/screens/login-screen.tsx
git commit -m "feat(auth): add skeleton loading state to login screen"
```
