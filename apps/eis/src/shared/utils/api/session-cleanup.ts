import { TokenStoreManager } from '@stores/token.store';
import { useLocalAuthStore } from '@stores/local-auth.store';
import { router } from 'expo-router';
import { queryClient } from '@utils/react-query';
import { PAGE_ROUTES } from '@utils/constants';

/** Guards against concurrent invocations of {@link cleanupSession}. */
let isCleaning = false;

/**
 * Performs a full forced session cleanup after an authentication failure (401).
 *
 * Resets every layer of session state so the app returns to a clean,
 * unauthenticated starting point:
 *
 * 1. **Token layer** — Removes both the access and refresh tokens from
 *    secure storage so the next app launch starts without credentials.
 * 2. **Auth store** — Clears the user profile, employee code, sign-in
 *    status, and role so React components see a logged-out state.
 * 3. **Local auth (biometric) store** — Resets the `isAuthenticated` flag
 *    so the user must re-authenticate via biometrics on return.
 * 4. **React Query cache** — Wipes all cached data so stale pages aren't
 *    shown after a forced logout.
 * 5. **Navigation** — Redirects to the login screen.
 *
 * A debounce guard prevents multiple rapid invocations (e.g. when several
 * in-flight requests all fail with 401 simultaneously) from competing.
 *
 * @example
 * ```ts
 * import { cleanupSession } from './session-cleanup';
 *
 * if (status === 401) {
 *   await cleanupSession();
 *   return backendResponse({ message: 'Unauthorized', ... });
 * }
 * ```
 */
export async function cleanupSession(): Promise<void> {
  if (isCleaning) return;
  isCleaning = true;

  try {
    // 1. Token layer — remove both tokens from secure storage
    await TokenStoreManager.removeTokens();

    // 2. Auth store — clear user profile & sign-in status
    //    Dynamic import avoids circular dependency since auth.store
    //    imports from this same utils/api tree (via rpc).
    const { useAuthStore } = await import('@stores/auth.store');
    useAuthStore.getState().reset();

    // 3. Local auth store — reset biometric unlock flag
    useLocalAuthStore.setState({ isAuthenticated: false });

    // 4. React Query cache — clear all stale/loaded data
    queryClient.clear();

    // 5. Navigation — redirect to login
    router.replace(PAGE_ROUTES.AUTH.LOGIN);
  } finally {
    // Debounce: prevent re-entry for 2 seconds.
    // This covers the window where multiple 401 responses arrive in rapid
    // succession (e.g. several in-flight requests all fail at once).
    setTimeout(() => {
      isCleaning = false;
    }, 2000);
  }
}
