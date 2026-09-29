# Auth Store Migration — React Context to Zustand + SecureStore

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace `AuthContext`/`AuthContextProvider` with a zustand store that persists the full `UserT` object to SecureStore.

**Architecture:** A zustand v4 store with `persist` middleware wrapping `expo-secure-store` via `createJSONStorage`. The store is the single source of truth for auth state. The existing `useAuthStore()` hook is updated to consume from the store instead of React context. An `AuthInitializer` component calls `_hydrate()` on mount to bootstrap the session. `TokenStoreManager` continues to own JWT/refresh token storage unchanged.

**Tech Stack:** zustand v4, expo-secure-store v15, TypeScript strict

---

### Task 1: Create the zustand auth store

**Files:**

- Rewrite: `src/shared/stores/auth.store.ts`

- [ ] **Step 1: Write the full auth store implementation**

```typescript
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import * as SecureStore from 'expo-secure-store';
import { UserT, RoleT } from '@sharedTypes/auth';
import { ENDPOINTS } from '@utils/constants/endpoints';
import { http } from '@utils/api/http';
import { TokenStoreManager } from '@stores/token.store';
import { logger } from '@utils/logger';

type AuthStore = {
  user: UserT | null;
  isSignedIn: boolean;
  isAuthLoading: boolean;
  role: RoleT;

  setUser: (user: UserT | null) => void;
  fetchUser: () => Promise<void>;
  refresh: () => void;
  reset: () => void;
  logout: () => Promise<void>;
  _hydrate: () => Promise<void>;
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      isSignedIn: false,
      isAuthLoading: true,
      role: 'USER' as RoleT,

      setUser: (user) =>
        set({
          user,
          isSignedIn: user !== null,
          role: user?.role ?? 'USER',
        }),

      fetchUser: async () => {
        try {
          const res = await http.get<UserT>(ENDPOINTS.AUTH.ME);
          if (res.success && res.data) {
            get().setUser(res.data);
          } else {
            get().reset();
          }
        } catch (error) {
          logger.error('AuthStore: fetchUser failed', error);
          get().reset();
        }
      },

      refresh: () => {
        get().fetchUser();
      },

      reset: () => {
        set({ user: null, isSignedIn: false, role: 'USER' });
      },

      logout: async () => {
        try {
          const refreshToken = await TokenStoreManager.getRefreshToken();
          if (refreshToken) {
            await http.post(ENDPOINTS.AUTH.LOGOUT, { refresh_token: refreshToken });
          }
        } catch (error) {
          logger.error('AuthStore: logout API call failed', error);
        }

        await TokenStoreManager.removeToken();
        await TokenStoreManager.removeRefreshToken();
        get().reset();

        try {
          const { queryClient } = await import('@utils/react-query');
          queryClient.clear();
        } catch {}
      },

      _hydrate: async () => {
        set({ isAuthLoading: true });
        try {
          const token = await TokenStoreManager.getToken();
          if (token) {
            await get().fetchUser();
          } else {
            const refreshToken = await TokenStoreManager.getRefreshToken();
            if (refreshToken) {
              const res = await http.post<{ access_token: string; refresh_token?: string }>(
                ENDPOINTS.AUTH.REFRESH,
                { refresh_token: refreshToken }
              );
              if (res.success && res.data?.access_token) {
                await TokenStoreManager.addToken(res.data.access_token);
                if (res.data.refresh_token) {
                  await TokenStoreManager.addRefreshToken(res.data.refresh_token);
                }
                await get().fetchUser();
              } else {
                get().reset();
              }
            } else {
              get().reset();
            }
          }
        } catch (error) {
          logger.error('AuthStore: _hydrate failed', error);
          get().reset();
        } finally {
          set({ isAuthLoading: false });
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => ({
        getItem: SecureStore.getItemAsync,
        setItem: SecureStore.setItemAsync,
        removeItem: SecureStore.deleteItemAsync,
      })),
      partialize: (state) => ({ user: state.user }),
      onRehydrateStorage: () => (state) => {
        if (state?.user) {
          state.isSignedIn = true;
          state.role = state.user.role;
        }
        state.isAuthLoading = true;
      },
    }
  )
);
```

- [ ] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit --pretty 2>&1 | head -50`
Expected: No TypeScript errors (or at least no new ones from this file)

- [ ] **Step 3: Commit**

```bash
git add src/shared/stores/auth.store.ts
git commit -m "feat: add zustand auth store with SecureStore persistence"
```

---

### Task 2: Update use-auth hook to consume from store

**Files:**

- Modify: `src/shared/hooks/use-auth.ts`

- [ ] **Step 1: Rewrite use-auth.ts**

```typescript
import { useAuthStore } from '@stores/auth.store';

export function useAuthStore() {
  const user = useAuthStore((s) => s.user);
  const isSignedIn = useAuthStore((s) => s.isSignedIn);
  const isLoading = useAuthStore((s) => s.isAuthLoading);
  const role = useAuthStore((s) => s.role);
  const refresh = useAuthStore((s) => s.refresh);
  const logout = useAuthStore((s) => s.logout);

  return { user, isSignedIn, isLoading, role, refresh, logout };
}
```

- [ ] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit --pretty 2>&1 | head -50`
Expected: No TypeScript errors

- [ ] **Step 3: Commit**

```bash
git add src/shared/hooks/use-auth.ts
git commit -m "refactor: update useAuthStore hook to consume from zustand store"
```

---

### Task 3: Create AuthInitializer and update provider wrapper

**Files:**

- Rewrite: `src/shared/providers/auth-provider.tsx` → becomes `AuthInitializer`
- Modify: `src/shared/providers/provider-wrapper.tsx`
- Delete: `src/shared/contexts/auth.context.ts`

- [ ] **Step 1: Rewrite auth-provider.tsx as AuthInitializer**

Replace the entire file with a simple component that calls `_hydrate()` on mount:

```typescript
import { useEffect } from 'react';
import { useAuthStore } from '@stores/auth.store';

type Props = {
  children: React.ReactNode;
};

export const AuthInitializer = ({ children }: Props) => {
  const hydrate = useAuthStore((s) => s._hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return <>{children}</>;
};
```

- [ ] **Step 2: Update provider-wrapper.tsx**

Replace `AuthContextProvider` import and usage with `AuthInitializer`:

Old:

```typescript
import { AuthContextProvider } from './auth-provider';
...
<AuthContextProvider>
...
</AuthContextProvider>
```

New:

```typescript
import { AuthInitializer } from './auth-provider';
...
<AuthInitializer>
...
</AuthInitializer>
```

- [ ] **Step 3: Delete auth.context.ts**

Remove the file `src/shared/contexts/auth.context.ts`.

- [ ] **Step 4: Verify it compiles**

Run: `npx tsc --noEmit --pretty 2>&1 | head -50`
Expected: No TypeScript errors

- [ ] **Step 5: Commit**

```bash
git add src/shared/providers/auth-provider.tsx src/shared/providers/provider-wrapper.tsx
git rm src/shared/contexts/auth.context.ts
git commit -m "refactor: replace AuthContextProvider with AuthInitializer"
```

---

### Task 4: Update useLoginMutation to use store directly

**Files:**

- Modify: `src/features/auth/hooks/use-login-mutation.ts`

- [ ] **Step 1: Update login mutation**

Replace the `useAuthStore()` import and `refresh()` call with direct store access:

Old:

```typescript
import { useAuthStore } from '@stores/auth.store';
...
const { refresh } = useAuthStore();
...
refresh(); // Trigger auth state update
```

New:

```typescript
import { useAuthStore } from '@stores/auth.store';
...
useAuthStore.getState().fetchUser();
```

Full updated file:

```typescript
import { useMutation } from '@tanstack/react-query';
import { z } from 'zod';
import { LoginSchema } from '../validators/login.schema';
import { TokenStoreManager } from '@stores/token.store';
import { toast } from '@components/ui';
import { useAuthStore } from '@stores/auth.store';
import { logger } from '@utils/logger/logger';
import { rpc } from '@utils/api/rpc';
import { AUTH_METHODS } from '../utils/constants/methods';

type LoginFormInputs = z.infer<typeof LoginSchema>;

type LoginResT = {
  access_token: string;
  refresh_token: string;
};

export const useLoginMutation = () => {
  return useMutation({
    mutationFn: (data: LoginFormInputs) =>
      rpc<LoginResT, LoginFormInputs>(AUTH_METHODS.EMPLOYEE_LOGIN, {
        emp_cd: data.emp_cd,
        password: data.password,
      }),
    onSuccess: async (data) => {
      if (data.success) {
        const res = data.data;
        const accessToken = res?.access_token || res?.refresh_token;
        const refreshToken = res?.refresh_token;

        if (accessToken && refreshToken) {
          await TokenStoreManager.addToken(accessToken);
          await TokenStoreManager.addRefreshToken(refreshToken);

          toast.success('Authentication Success', {
            description: data.message || 'Sign in successful',
          });
          useAuthStore.getState().fetchUser();
          return data;
        } else {
          const missing = !accessToken ? 'Access Token' : 'Refresh Token';

          logger.error(`LoginScreen: Successful login but ${missing} is missing.`, {
            hasAccess: !!accessToken,
            hasRefresh: !!refreshToken,
          });

          toast.error('Authentication Failed', {
            description: 'Auth synchronization failed. Please try again.',
          });
        }
      } else {
        toast.error('Authentication Failed', {
          description: data.message || 'Invalid credentials',
        });
      }
    },
  });
};
```

- [ ] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit --pretty 2>&1 | head -50`
Expected: No TypeScript errors

- [ ] **Step 3: Commit**

```bash
git add src/features/auth/hooks/use-login-mutation.ts
git commit -m "refactor: use auth store directly in login mutation"
```

---

### Task 5: Update stores barrel export

**Files:**

- Modify: `src/shared/stores/index.ts`

- [ ] **Step 1: Add auth.store export**

```typescript
export * from './auth.store';
export * from './token.store';
```

- [ ] **Step 2: Commit**

```bash
git add src/shared/stores/index.ts
git commit -m "chore: export auth store from barrel"
```

---

### Task 6: Verify all consumers work

**Files:**

- Check: All files that import `useAuthStore` — they should all work without changes since the hook shape is preserved

- [ ] **Step 1: Type-check the entire project**

Run: `npx tsc --noEmit --pretty 2>&1`
Expected: No TypeScript errors

- [ ] **Step 2: Verify no remaining references to AuthContext or AuthContextProvider**

Run: `rg "AuthContext|AuthContextProvider" src/ --include '*.{ts,tsx}'`
Expected: No matches (or only matches in test files or feature-auth type definitions)

- [ ] **Step 3: Check that AuthContextT can be cleaned up**

The type in `src/shared/types/auth.ts` is no longer consumed anywhere. If no other file imports it, remove it. But verify first — it might be used by feature-level type files.

- [ ] **Step 4: Commit any cleanup**

```bash
git add -A
git commit -m "chore: clean up remaining auth context references"
```
