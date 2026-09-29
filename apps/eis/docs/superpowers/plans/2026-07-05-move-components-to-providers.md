# Move Infrastructure Components to Providers — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move `GlobalErrorBoundary`, `UpdateModal`, and `AnimationProvider` from `src/shared/components/common/` to `src/shared/providers/` to match architectural conventions.

**Architecture:** Three infrastructure wrappers move as-is or via clean extraction. `AnimationProvider` is extracted from `fade-in-view.tsx` into its own module. Barrel exports and import paths are updated across 5 files.

**Tech Stack:** React Native, Expo, TypeScript

**TDD note:** This is a pure refactoring with no behavioral changes, so no new tests are written. Verification is via `npx tsc --noEmit`.

---

### Task 1: Create `animation-provider.tsx`

**Files:**

- Create: `src/shared/providers/animation-provider.tsx`

Extract `AnimationContext`, `AnimationProvider`, `useAnimation`, and `useAnimationScrollHandler` from `fade-in-view.tsx` into their own module.

- [ ] **Step 1: Create the file**

```tsx
import React, { createContext, useContext } from 'react';
import {
  useSharedValue,
  useAnimatedScrollHandler,
  type SharedValue,
} from 'react-native-reanimated';

interface AnimationContextType {
  start: boolean;
  stagger: number;
  scrollOffset: SharedValue<number>;
}

const AnimationContext = createContext<AnimationContextType | null>(null);

export const AnimationProvider = ({
  children,
  start = true,
  stagger = 100,
}: {
  children: React.ReactNode;
  start?: boolean;
  stagger?: number;
}) => {
  const scrollOffset = useSharedValue(0);
  return (
    <AnimationContext.Provider value={{ start, stagger, scrollOffset }}>
      {children}
    </AnimationContext.Provider>
  );
};

export const useAnimation = () => {
  const context = useContext(AnimationContext);
  if (!context) throw new Error('useAnimation must be used within AnimationProvider');
  return context;
};

export const useAnimationScrollHandler = () => {
  const { scrollOffset } = useAnimation();
  return useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollOffset.value = event.contentOffset.y;
    },
  });
};
```

- [ ] **Step 2: Commit**

```bash
git add src/shared/providers/animation-provider.tsx
git commit -m "feat: extract AnimationProvider into providers directory"
```

---

### Task 2: Update `fade-in-view.tsx`

**Files:**

- Modify: `src/shared/components/common/fade-in-view.tsx`

Remove the extracted code (`AnimationContext`, `AnimationProvider`, `useAnimation`, `useAnimationScrollHandler`) and replace with an import from the new provider file.

- [ ] **Step 1: Edit the imports**

Replace:

```tsx
import React, { createContext, useContext, useEffect, useState, memo } from 'react';
import { Dimensions } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withDelay,
  Easing,
  useAnimatedScrollHandler,
  SharedValue,
} from 'react-native-reanimated';
```

With:

```tsx
import React, { useEffect, useState, memo } from 'react';
import { Dimensions } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { useAnimation } from '@providers/animation-provider';
```

- [ ] **Step 2: Remove the extracted code block**

Delete lines 15-62 (the `AnimationContextType` interface, `AnimationContext`, `AnimationProvider`, `useAnimation`, `useAnimationScrollHandler`, and their surrounding comment blocks).

This leaves `FadeInView` as the only export.

- [ ] **Step 3: Commit**

```bash
git add src/shared/components/common/fade-in-view.tsx
git commit -m "refactor: replace inline animation context with providers import"
```

---

### Task 3: Create `global-error-boundary.tsx` in providers

**Files:**

- Create: `src/shared/providers/global-error-boundary.tsx`

Copy `src/shared/components/common/global-error-boundary.tsx` as-is. No code changes needed.

- [ ] **Step 1: Copy the file**

Content is identical to `src/shared/components/common/global-error-boundary.tsx` (100 lines). Internal imports (`@components/ui/icon`, `@utils/logger`, `expo-blur`, `expo-updates`) remain valid from the new location.

- [ ] **Step 2: Commit**

```bash
git add src/shared/providers/global-error-boundary.tsx
git commit -m "feat: add GlobalErrorBoundary to providers"
```

---

### Task 4: Create `update-modal.tsx` in providers

**Files:**

- Create: `src/shared/providers/update-modal.tsx`

Copy `src/shared/components/common/update-modal.tsx` as-is. No code changes needed.

- [ ] **Step 1: Copy the file**

Content is identical to `src/shared/components/common/update-modal.tsx` (63 lines). Internal imports (`@stores/update.store`, `@components/ui/icon`, `expo-blur`) remain valid from the new location.

- [ ] **Step 2: Commit**

```bash
git add src/shared/providers/update-modal.tsx
git commit -m "feat: add UpdateModal to providers"
```

---

### Task 5: Delete old files and update barrel exports

**Files:**

- Delete: `src/shared/components/common/global-error-boundary.tsx`
- Delete: `src/shared/components/common/update-modal.tsx`
- Modify: `src/shared/components/common/index.ts`
- Modify: `src/shared/providers/index.ts`

- [ ] **Step 1: Delete the old component files**

```bash
rm src/shared/components/common/global-error-boundary.tsx
rm src/shared/components/common/update-modal.tsx
```

- [ ] **Step 2: Update `components/common/index.ts`**

Remove the two lines:

```tsx
export * from './update-modal';
export * from './global-error-boundary';
```

- [ ] **Step 3: Update `providers/index.ts`**

Replace:

```tsx
export * from './auth-provider';
export * from './local-auth-provider';
export * from './notification-provider';
export * from './provider-wrapper';
export * from './query-provider';
export * from './theme-provider';
```

With:

```tsx
export * from './animation-provider';
export * from './auth-provider';
export * from './global-error-boundary';
export * from './local-auth-provider';
export * from './notification-provider';
export * from './provider-wrapper';
export * from './query-provider';
export * from './theme-provider';
export * from './update-modal';
```

- [ ] **Step 4: Commit**

```bash
git add src/shared/components/common/global-error-boundary.tsx \
       src/shared/components/common/update-modal.tsx \
       src/shared/components/common/index.ts \
       src/shared/providers/index.ts
git commit -m "refactor: remove old component files, update barrel exports"
```

---

### Task 6: Update `provider-wrapper.tsx` imports

**Files:**

- Modify: `src/shared/providers/provider-wrapper.tsx`

- [ ] **Step 1: Update imports**

Replace:

```tsx
import { UpdateModal } from '@components/common/update-modal';
import { GlobalErrorBoundary } from '@components/common/global-error-boundary';
import { AnimationProvider } from '@components/common';
```

With:

```tsx
import { UpdateModal } from './update-modal';
import { GlobalErrorBoundary } from './global-error-boundary';
import { AnimationProvider } from './animation-provider';
```

No other changes needed — the JSX usage stays identical.

- [ ] **Step 2: Commit**

```bash
git add src/shared/providers/provider-wrapper.tsx
git commit -m "refactor: update imports to use local provider paths"
```

---

### Task 7: Update `ui-lab.tsx` imports

**Files:**

- Modify: `src/app/(dev)/ui-lab.tsx`

- [ ] **Step 1: Update imports**

Replace:

```tsx
import { AnimationProvider, FadeInView } from '@components/common';
```

With:

```tsx
import { AnimationProvider } from '@providers/animation-provider';
import { FadeInView } from '@components/common';
```

- [ ] **Step 2: Commit**

```bash
git add src/app/(dev)/ui-lab.tsx
git commit -m "refactor: split AnimationProvider import to provider path"
```

---

### Task 8: Verify

**Files:**

- Run: `npx tsc --noEmit`

- [ ] **Step 1: Type-check**

```bash
npx tsc --noEmit
```

Expected: no errors. If any import paths are stale, fix them.

- [ ] **Step 2: Final commit (if fixes needed)**

```bash
git add -A
git commit -m "fix: resolve type-checking import errors"
```
