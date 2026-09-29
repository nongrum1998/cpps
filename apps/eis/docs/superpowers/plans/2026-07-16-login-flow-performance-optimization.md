# Login Flow Performance Optimization Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reduce the login flow from 3 sequential network round-trips + ~600ms of synchronous CPU work to a single round-trip with near-zero synchronous blocking.

**Architecture:** Three independent optimizations applied in strict order: (1) cache SHA256-derived encryption key/IV so they're computed once instead of on every RPC call, (2) merge the user-profile fetch (`get_employee_details`) into the login RPC response to eliminate the third round-trip, (3) pre-fetch the OAuth bearer token when the login screen mounts so it's ready before the user taps "Continue." The ordering ensures each step doesn't create new issues for the next.

**Tech Stack:** Expo SDK 54 (React Native), Zustand v4, react-query v5, CryptoJS, rn-fetch-blob, expo-secure-store

**Plan location:** `docs/superpowers/plans/2026-07-16-login-flow-performance-optimization.md`

---

## File Map

| File                                             | Responsibility                                     | Action                                                                            |
| ------------------------------------------------ | -------------------------------------------------- | --------------------------------------------------------------------------------- |
| `src/shared/lib/encryption.ts`                   | AES-CBC encrypt/decrypt with SHA256 key derivation | **Modify** — cache derived key/IV                                                 |
| `src/shared/types/auth.ts`                       | `UserT` type (30+ employee fields)                 | **No change** (already defined)                                                   |
| `src/features/auth/hooks/use-login-mutation.ts`  | Login RPC mutation hook                            | **Modify** — accept user data from login response, conditionally skip `fetchUser` |
| `src/features/auth/screens/login-screen.tsx`     | Login screen orchestration                         | **Modify** — eager OAuth pre-fetch, simplified submit handler                     |
| `src/features/auth/hooks/use-get-oauth-token.ts` | OAuth bearer token fetch                           | **Modify** — add `isTokenReady` flag, handle errors                               |
| `src/shared/stores/auth.store.ts`                | Auth state (Zustand + SecureStore)                 | **Modify** — add `setUser` action for login-response-based hydration              |
| `src/shared/utils/constants/method.ts`           | RPC method name constants                          | **No change**                                                                     |

---

## Task Ordering

These tasks must be implemented **in order** because later tasks depend on changes from earlier ones:

1. **Task 1** — Encryption key/IV cache (independent, no downstream deps)
2. **Task 3** — Merge user profile into login response (modifies `useLoginMutation` behavior that Task 2 depends on)
3. **Task 2** — Eager OAuth pre-fetch (consumes the simplified submit flow from Task 3)

---

## Task 1: Cache Encryption Key/IV Derivation

> **Impact:** Eliminates 6 redundant SHA256 hash computations per login flow (3 encrypt + 3 decrypt calls → 6 SHA256 calls → 1 SHA256 each for key+IV). Estimated saving: **100-300ms synchronous CPU time** on lower-end devices.

**File:** `src/shared/lib/encryption.ts`

**Current code (`encryption.ts:6-18`):**

```ts
const getKeyAndIv = () => {
  if (!appSk || !appIv) {
    throw new Error('Missing environment variables');
  }

  const keyHash = CryptoJS.SHA256(appSk).toString();
  const ivHash = CryptoJS.SHA256(appIv).toString();

  return {
    key: CryptoJS.enc.Utf8.parse(keyHash.substring(0, 32)),
    iv: CryptoJS.enc.Utf8.parse(ivHash.substring(0, 16)),
  };
};
```

`getKeyAndIv()` is called by both `encrypt()` and `decrypt()` on every invocation. Since `appSk` and `appIv` come from static env vars (`process.env.EXPO_PUBLIC_APP_SK`, `EXPO_PUBLIC_APP_IV`), the derived key and IV never change during the app lifecycle. The SHA256 computation is wasted work on every call.

**Changes:**

- [ ] **Step 1.1: Add module-level cache**

Add two module-scoped variables to hold the cached key and IV after first derivation, and `null` them out on initialization so the first call triggers computation:

```ts
// Module-level cache — computed once on first access, never invalidated
// because the key/IV are derived from static env vars that don't change
// during the app's lifetime.
let cachedKey: CryptoJS.lib.WordArray | null = null;
let cachedIv: CryptoJS.lib.WordArray | null = null;
```

- [ ] **Step 1.2: Modify `getKeyAndIv()` to use the cache**

```ts
const getKeyAndIv = () => {
  if (cachedKey && cachedIv) {
    return { key: cachedKey, iv: cachedIv };
  }

  if (!appSk || !appIv) {
    throw new Error('Missing environment variables');
  }

  const keyHash = CryptoJS.SHA256(appSk).toString();
  const ivHash = CryptoJS.SHA256(appIv).toString();

  cachedKey = CryptoJS.enc.Utf8.parse(keyHash.substring(0, 32));
  cachedIv = CryptoJS.enc.Utf8.parse(ivHash.substring(0, 16));

  return { key: cachedKey, iv: cachedIv };
};
```

The `throw` guard moves from always-running to only-on-first-access, which is fine — if the env vars are missing, the first `encrypt()` or `decrypt()` call will throw. No env var can become available _after_ module initialization in a React Native app, so lazy validation is acceptable.

- [ ] **Step 1.3: Verify the change**

```bash
# Run existing tests (if any) to confirm no regression
npx jest src/shared/lib/__tests__/encryption --no-coverage 2>/dev/null || echo "No test file found — manual verification needed"
```

Manual verification: confirm that calling `encrypt()` then `decrypt()` on the same plaintext still returns the original value. The cache does not alter the algorithm, only skips redundant hash computation.

- [ ] **Step 1.4: Commit**

```bash
git add src/shared/lib/encryption.ts
git commit -m "perf: cache SHA256-derived encryption key/IV in module scope"
```

---

## Task 2: Eager OAuth Token Pre-Fetch on Login Screen Mount

> **Impact:** Eliminates the first sequential round-trip (~200-500ms) from the critical login path. The OAuth token fetch (a `grant_type=client_credentials` POST to `/oauth2/token`) has no dependency on user input, so it can happen in parallel with the user filling out the form. By the time they tap "Continue," the token should already be in SecureStore.

### Design

**Edge cases handled:**

| Edge case                                       | Handling                                                                                                                                                          |
| ----------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| User taps Continue before OAuth fetch completes | `onSubmit` shows loading state on button, waits for OAuth to finish                                                                                               |
| OAuth fetch fails                               | `onSubmit` shows inline error via toast, offers retry via button tap                                                                                              |
| OAuth token expires while user is typing        | OAuth response contains `expires_in` (likely 3600s+). Negligible risk. If expired, the login RPC gets a 401 and the existing token-refresh interceptor handles it |
| User navigates away without logging in          | OAuth token is wasted — acceptable tradeoff for the performance win. The token is ephemeral                                                                       |

**Files:**

- Modify: `src/features/auth/hooks/use-get-oauth-token.ts`
- Modify: `src/features/auth/screens/login-screen.tsx`

### Changes

- [ ] **Step 2.1: Optionally convert `useGetOAuthToken` to expose `isSuccess` state cleanly**

The current hook uses `useMutation` which exposes `isPending`, `isSuccess`, `isError`, and `error`. These are sufficient to track the eager-fetch state. No conversion to `useQuery` is needed — the token is used once per session, not auto-refetched.

_No code change needed in this file_ — the mutation's `isPending`/`isSuccess`/`isError` states are used directly in the screen. However, add a convenience re-export so the screen can check readiness:

- [ ] **Step 2.2: Add OAuth readiness tracking to `useGetOAuthToken`**

Modify `useGetOAuthToken` to return additional computed state for easier consumption:

```ts
/** Returns `true` once a token has been successfully fetched and stored. */
export function useGetOAuthToken() {
  const mutation = useMutation({
    mutationFn: () =>
      RNFetchBlob.config({ trusty: true }).fetch(
        'POST',
        url,
        headers,
        'grant_type=client_credentials'
      ),
    onSuccess: async (res) => {
      const data = JSON.parse(res.data) as GetOAuthResponse;
      if (!data) return;
      logger.info('Get OAuth Token Success', { accessToken: !!data.access_token });
      if (data.access_token) {
        logger.info('Setting access token');
        await TokenStoreManager.addAccessToken(data.access_token);
        logger.info('Successfully set access token');
      }
      return data;
    },
  });

  return {
    ...mutation,
    /** True when a token has been successfully obtained and stored. */
    isTokenReady: mutation.isSuccess,
  };
}
```

- [ ] **Step 2.3: Modify `LoginScreen` — eager pre-fetch + simplified `onSubmit`**

The key change: trigger `mutate()` in a `useEffect` on mount. The `onSubmit` handler no longer calls the OAuth mutation — only calls `loginMutate`. If the OAuth token isn't ready yet, the submit is gated.

```tsx
// Inside LoginScreen component:

const {
  mutate: fetchOAuthToken,
  isPending: isOAuthFetching,
  isTokenReady,
  isError: isOAuthError,
} = useGetOAuthToken();

const { mutate: loginMutate, isPending: isLoginPending } = useLoginMutation();

const isPending = isAuthLoading || isLoginPending || isOAuthFetching;

// Pre-fetch OAuth token as soon as the screen mounts
useEffect(() => {
  if (!isTokenReady && !isOAuthFetching && !isOAuthError) {
    fetchOAuthToken();
  }
}, [fetchOAuthToken, isTokenReady, isOAuthFetching, isOAuthError]);

const onSubmit = (data: LoginFormInputs) => {
  if (isLimited) return;
  if (!isTokenReady) {
    // Token not ready yet — show a toast and block submission
    showSnackbar('Preparing authentication, please wait...');
    return;
  }

  startCooldown();

  loginMutate(data, {
    onSuccess: (sData) => {
      if (sData.success) {
        showSnackbar(sData.message);
        return sData;
      }
      toast.error(sData.message);
      return sData;
    },
  });
};
```

**Important changes:**

1. The `useEffect` fires `fetchOAuthToken()` on mount — only if not already fetched, not currently fetching, and not errored
2. `onSubmit` no longer wraps `loginMutate` inside `mutate(...)`
3. `isPending` combines `isAuthLoading`, `isOAuthFetching`, and `isLoginPending`
4. If the user taps "Continue" before the OAuth token is ready (`!isTokenReady`), a snackbar message tells them to wait and the submit is blocked — no silent failure

- [ ] **Step 2.4: Handle OAuth fetch failure — allow retry on button tap**

If the OAuth fetch fails, the user can retry by tapping the button again. Add this to the `onSubmit`:

```tsx
const onSubmit = (data: LoginFormInputs) => {
  if (isLimited) return;

  // If OAuth previously failed, retry the fetch first
  if (isOAuthError) {
    fetchOAuthToken();
    return;
  }

  if (!isTokenReady) {
    showSnackbar('Preparing authentication, please wait...');
    return;
  }

  startCooldown();
  loginMutate(data, { ... });
};
```

And show an error state on the button when `isOAuthError`:

```tsx
<Button
  testID="SIGN_IN_BUTTON"
  onPress={methods.handleSubmit(onSubmit)}
  isLoading={isPending}
  disabled={isSignedIn || isLimited}>
  {isOAuthError ? 'Retry Connection' : 'Continue'}
</Button>
```

This also means removing the `isTokenPending` state from the skeleton check — we no longer show the full skeleton when fetching the OAuth token (the form renders immediately, just the button shows loading):

```tsx
// Remove isTokenPending from the skeleton check
// const isPending = isAuthLoading || isLoginPending || isTokenPending;
// Keep isOAuthFetching separate — it shows on the button only
const showSkeleton = isAuthLoading;
```

**Full `onSubmit` after all changes:**

```tsx
const onSubmit = (data: LoginFormInputs) => {
  if (isLimited) return;

  // If the OAuth token fetch failed previously, retry on button tap
  if (isOAuthError) {
    fetchOAuthToken();
    return;
  }

  // If the OAuth token is still being fetched, inform the user
  if (!isTokenReady) {
    showSnackbar('Preparing authentication, please wait...');
    return;
  }

  startCooldown();

  loginMutate(data, {
    onSuccess: (sData) => {
      if (sData.success) {
        showSnackbar(sData.message);
        return sData;
      }
      toast.error(sData.message);
      return sData;
    },
  });
};
```

- [ ] **Step 2.5: Remove `isTokenPending` from skeleton trigger**

Change line 114-116 of `login-screen.tsx` from:

```tsx
const isPending = isAuthLoading || isLoginPending || isTokenPending;
if (isPending) return <LoginScreenSkeleton />;
```

To:

```tsx
// Only show the skeleton when auth store is still hydrating (cold start).
// OAuth pre-fetch shows a loading button, not a full skeleton.
if (isAuthLoading) return <LoginScreenSkeleton />;
```

- [ ] **Step 2.6: Commit**

```bash
git add src/features/auth/hooks/use-get-oauth-token.ts src/features/auth/screens/login-screen.tsx
git commit -m "perf: pre-fetch OAuth token eagerly on login screen mount"
```

---

## Task 3: Eliminate `fetchUser` Round-Trip After Login

> **Impact:** Eliminates the third sequential round-trip (~300-600ms). After `employee_login` succeeds, the app currently fires `get_employee_details` to fetch the full `UserT` profile. If the login response already carries the user profile, this second RPC call + its encrypt/decrypt cycle is eliminated.

### Approach

**Primary option (Requires backend change):** The backend `employee_login` RPC already returns tokens. Extend the response to include the user profile fields (`UserT`) so the frontend can hydrate the auth store directly from the login response, skipping `get_employee_details` entirely.

**Fallback option (Frontend-only):** If the backend cannot be changed, keep `fetchUser()` but fire it **in parallel with navigation** — the user sees the home screen immediately while profile data loads asynchronously. This saves perceived time but not actual network.

The plan below implements the **primary option** with the fallback noted as a conditional path.

### Backend Requirement

The `employee_login` RPC response's `data` field must be extended to include user profile fields. The response `data` currently contains:

```json
{
  "access_token": "...",
  "expires_in": 3600,
  "scope": "default",
  "token_type": "Bearer"
}
```

After the change, it should contain:

```json
{
  "access_token": "...",
  "expires_in": 3600,
  "scope": "default",
  "token_type": "Bearer",
  "user": {
    "basic_pay": "...",
    "emp_fname": "...",
    ...all UserT fields...
  }
}
```

The `user` object matches the existing `UserT` type from `src/shared/types/auth.ts`.

> **Note to implementer:** If the backend team cannot deliver this change, skip to the **Fallback Implementation** section at the end of this task.

### Frontend Changes

**Files:**

- Modify: `src/features/auth/hooks/use-login-mutation.ts`
- Modify: `src/shared/stores/auth.store.ts`
- Modify: `src/features/auth/screens/login-screen.tsx` (only if fallback)

- [ ] **Step 3.1: Update `LoginResponse` type to include user profile**

In `use-login-mutation.ts`, update the response type:

```ts
import { UserT } from '@sharedTypes/auth';

type LoginResponse = {
  access_token: string;
  expires_in: number;
  scope: 'default';
  token_type: 'Barear' | 'Basic';
  /** User profile — included when the backend returns it. */
  user?: UserT;
};
```

- [ ] **Step 3.2: Add a `setUser` action to the auth store**

The auth store (`auth.store.ts`) currently only hydrates user state via `fetchUser()` which is a coupled async operation. Add a simpler `setUser` action that can be called directly from the login mutation:

```ts
// Inside the AuthStore type (after `fetchUser`):
setUser: (user: UserT) => void;

// Inside the store implementation (after reset):
setUser: (user: UserT) => {
  set({
    user,
    isSignedIn: true,
    role: 'USER',
    // Don't change isAuthLoading — that's managed by _hydrate
  });
},
```

This is a pure state setter — no API call, no SecureStore access. It matches the field assignments that `fetchUser` does on success (`auth.store.ts:51`).

- [ ] **Step 3.3: Modify `useLoginMutation` to accept user data from login response**

In `use-login-mutation.ts`, change the `onSuccess` handler to check if the login response includes user data. If it does, hydrate the store directly and skip `fetchUser`. If not, fall back to the current `fetchUser` path.

```ts
export const useLoginMutation = () => {
  const { fetchUser, setEmpCode, setUser } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation<ApiResponse<LoginResponse>, unknown, LoginFormInputs>({
    mutationKey: QUERY_KEYS.AUTH.ME,
    meta: { auth: true },
    mutationFn: async (data) => {
      if (!data.emp_cd) throw new Error('Employee code is needed');
      setEmpCode(data.emp_cd);

      return await rpc<LoginResponse>(METHODS.EMP_LOGIN, {
        password: data.password,
        emp_cd: data.emp_cd,
      });
    },
    onSuccess: async (data, { emp_cd }, _, context) => {
      if (data.success) {
        logger.info('Successfully logged in');

        if (data.data?.user) {
          // Backend returned user profile in login response — hydrate directly
          logger.info('Hydrating user from login response');
          setUser(data.data.user);
        } else if (emp_cd) {
          // Fallback: fetch user separately (legacy backend)
          logger.info('Login response has no user data — fetching separately');
          queryClient.invalidateQueries({ queryKey: context.mutationKey });
          fetchUser();
        }

        return data;
      }

      logger.info('Unsuccessful login — removing access token');
      await TokenStoreManager.removeAccessToken();
      return data;
    },
    onError: async (error) => {
      await TokenStoreManager.removeAccessToken();
      return error;
    },
  });
};
```

- [ ] **Step 3.4: Verify the `AuthStore.setUser` is properly exposed**

Ensure the auth store's `setUser` action is accessible. The Zustand store is created with `create<AuthStore>()(persist(...))`. The `setUser` function must be defined **before** the `persist` middleware wraps it.

The `partialize` function in the persist config controls what gets persisted. Since `setUser` is a function (not serializable), it won't be stored — that's correct. Ensure the persist config doesn't inadvertently strip it:

```ts
partialize: (state) => {
  const partial = {
    user: state.user,
    emp_cd: state.emp_cd,
    isSignedIn: state.isSignedIn,
    role: state.role,
    isAuthLoading: false,
    // Note: setUser is intentionally excluded — it's a function, not serializable
  };
  return partial;
},
```

No change needed here — functions are automatically excluded by Zustand's persist middleware.

- [ ] **Step 3.5: Commit**

```bash
git add src/features/auth/hooks/use-login-mutation.ts src/shared/stores/auth.store.ts
git commit -m "perf: hydrate user profile from login response, skip fetchUser round-trip"
```

### Fallback Implementation (No Backend Change)

If the backend cannot return user data in the login response, implement this **instead of Steps 3.1-3.5**:

- [ ] **Step 3F.1: Fire `fetchUser()` without blocking navigation**

Modify `useLoginMutation`'s `onSuccess` to navigate immediately and let `fetchUser` complete in the background:

```ts
onSuccess: async (data, { emp_cd }, _, context) => {
  if (data.success) {
    logger.info('Successfully logged in');

    if (emp_cd) {
      // Fire fetchUser but don't await it — let it complete in background
      queryClient.invalidateQueries({ queryKey: context.mutationKey });
      fetchUser().catch((err) => {
        logger.error('Background fetchUser failed', err);
      });
    }

    return data;
  }
  // ... rest unchanged
},
```

This reduces perceived login time because the navigation to the home screen is not blocked by `fetchUser`. The home screen must handle the case where `user` is still `null` (show a loading state for profile-dependent sections).

- [ ] **Step 3F.2: Commit**

```bash
git add src/features/auth/hooks/use-login-mutation.ts
git commit -m "perf: fire fetchUser in background after login, unblock navigation"
```

---

## Expected Impact Summary

| Bottleneck               | Before                                    | After                                                | Saving          |
| ------------------------ | ----------------------------------------- | ---------------------------------------------------- | --------------- |
| **Sequential waterfall** | 3 round-trips (OAuth → Login → fetchUser) | 2 round-trips (OAuth parallel with form, then Login) | **~200-500ms**  |
| **fetchUser round-trip** | 3rd sequential RPC                        | Eliminated (data merged into login response)         | **~300-600ms**  |
| **Crypto sync CPU**      | 6 SHA256 + 4 AES operations               | 1 SHA256 + 4 AES (key/IV cached)                     | **~100-300ms**  |
| **Total improvement**    |                                           |                                                      | **~600ms–1.4s** |

---

## Verification

After all tasks are implemented:

1. **Cold-start login**: Launch app (fresh), type credentials, tap "Continue" — verify no skeleton flash, button shows loading during OAuth pre-fetch, login completes in 1-2 round trips
2. **Error states**: Kill network mid-OAuth-fetch, verify "Retry Connection" button appears; tap, verify retry works
3. **Encryption cache**: Insert a `console.time` around `getKeyAndIv` — confirm it runs only once across all RPC calls
4. **fetchUser elimination**: Check that the auth store's `user` is populated from the login response (not from a subsequent network call)
5. **Regression**: Verify logout → re-login flow still works, token refresh still works, biometric auth still works
