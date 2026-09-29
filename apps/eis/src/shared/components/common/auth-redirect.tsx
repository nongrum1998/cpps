import { useAuthStore } from '@stores/auth.store';
import { usePathname, useRouter, useLocalSearchParams, Route } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { LoadingScreen } from '@components/screens/loading-screen';
import { ROUTE_ROLES, PUBLIC_ROUTES } from '@utils/constants/auth';
import { useAccess } from '@hooks/use-access';
import { logger } from '@utils/logger';

type Props = {
  children: React.ReactNode;
};

/**
 * Auth redirect guard component that enforces authentication and role-based
 * access control at the route level.
 *
 * **How it works:**
 *
 * 1. **Mount detection** — Sets an internal `isMounted` flag on first render to
 *    avoid redirecting before hydration settles.
 * 2. **Loading gate** — While the auth store is loading, or until mount finishes,
 *    or if the user is signed in but role hasn't resolved yet, a `<LoadingScreen>`
 *    is shown instead of the children (only on non-public pages).
 * 3. **Route matching** — Iterates `ROUTE_ROLES` to find a config entry matching
 *    the current pathname (supports wildcards like `/*`).
 * 4. **Redirect logic** — Three branches applied in order:
 *    - **Signed-in on public page** → redirects to the `redirect` query param
 *      target (if present) or home (`/`).
 *    - **Not signed-in on protected page** → redirects to `/auth` with the
 *      current path as the `redirect` query param so the user returns here
 *      after login.
 *    - **Signed-in but insufficient role** → redirects to the route config's
 *      `redirect` target or `/forbidden`.
 *
 * **Security considerations:**
 * - All navigation uses `router.replace` (not `push`) to prevent back-button
 *   re-entry into unwanted pages.
 * - The `redirect` query param is read from `useLocalSearchParams` and treated
 *   as user-supplied input — it is not validated against an allowlist, so
 *   server-side redirect validation is expected at the API layer.
 * - Role checks rely on `checkAccess` from `useAccess`, which derives the
 *   user's role from the Zustand auth store — client-side state tampering
 *   could bypass this; server-side enforcement is assumed.
 *
 * @param props.children - Child content to render when the user is
 *   authenticated and authorized.
 * @returns A `<LoadingScreen>` during auth resolution, or the children when
 *   access is confirmed, or triggers a navigation redirect (side effect).
 *
 * @example
 * ```tsx
 * // Wrap protected route layouts
 * <AuthRedirect>
 *   <Stack />
 * </AuthRedirect>
 * ```
 */
export const AuthRedirect = ({ children }: Props) => {
  const [isMounted, setIsMounted] = useState(false);
  const { isAuthLoading: isLoading, isSignedIn, role } = useAuthStore();
  const { checkAccess } = useAccess();
  const pathName = usePathname();
  const router = useRouter();
  const params = useLocalSearchParams();
  const redirectTo = params.redirect as string;

  const isOnPublicPage = PUBLIC_ROUTES.includes(pathName);

  useEffect(() => {
    if (!isMounted) {
      setIsMounted(true);
    }
  }, [isMounted]);

  useEffect(() => {
    logger.info('AuthRedirect: effect running', {
      isLoading,
      isSignedIn,
      role,
      pathName,
      isMounted,
      isOnPublicPage,
    });
    if (isLoading || !isMounted) return;

    // Direct match or wildcard match from our route roles config
    const currentRouteConfig = ROUTE_ROLES.find((route) => {
      if (route.url === pathName) return true;
      if (route.url.endsWith('/*')) {
        const basePath = route.url.replace('/*', '');
        return pathName.startsWith(basePath);
      }
      return false;
    });

    // 1. If user is signed in and on a public-only page (like login)
    if (isSignedIn && isOnPublicPage) {
      // Redirect to the originally intended page OR home
      router.replace((redirectTo as Route) || '/');
      return;
    }

    // 2. Not signed in and trying to access a non-public route
    if (!isSignedIn && !isOnPublicPage) {
      // Send them to auth with the current path as redirect param
      const authPath = `/auth${pathName !== '/' ? `?redirect=${encodeURIComponent(pathName)}` : ''}`;
      router.replace(authPath as Route);
      return;
    }

    // 3. Authenticated role check
    if (isSignedIn && currentRouteConfig) {
      const hasRequiredRole = checkAccess(currentRouteConfig.role);
      if (!hasRequiredRole) {
        router.replace((currentRouteConfig.redirect as any) || '/forbidden');
        return;
      }
    }
  }, [
    isSignedIn,
    isMounted,
    isOnPublicPage,
    router,
    isLoading,
    pathName,
    role,
    redirectTo,
    checkAccess,
  ]);

  const isShowLoadingScreen = (!isMounted || (isSignedIn && !role)) && !isOnPublicPage;

  if (isShowLoadingScreen || isLoading) {
    return <LoadingScreen />;
  }

  return <>{children}</>;
};
