import { useAuthStore } from '@stores/auth.store';
import { useLocalAuthStore } from '@stores/local-auth.store';
import { useCallback, useEffect } from 'react';
import { Forbidden } from '@components/screens/forbidden';
import { isRealDevice } from '@utils/helpers/expo';
import { Container } from '@components/layout';

/**
 * Props for the {@link LocalAuthRedirect} component.
 */
interface LocalAuthRedirectProps {
  /** The application tree rendered beneath the local authentication gate. */
  children: React.ReactNode;
}

/**
 * Security gate that wraps the app tree and enforces local (device) authentication.
 *
 * Rendered inside {@link LocalAuthProvider} in the provider hierarchy, this
 * component:
 * - Triggers the native device authentication prompt (biometric / face / PIN)
 *   via `useLocalAuthStore().authenticate()` on mount and whenever the
 *   supported/enabled state or the signed-in user changes.
 * - Renders `children` unconditionally, so navigation proceeds normally once
 *   authentication succeeds.
 * - Overlays a {@link Forbidden} screen with a "Try Again" action when local
 *   auth is enabled, a user is signed in, authentication has not completed, and
 *   the app runs on a simulator or emulator (non-real device) where the native
 *   prompt cannot be relied upon.
 *
 * Authentication is skipped entirely when no user is signed in or local
 * authentication is disabled, leaving the app tree un-gated.
 *
 * @example
 * ```tsx
 * <LocalAuthRedirect>
 *   <AppNavigator />
 * </LocalAuthRedirect>
 * ```
 */
export const LocalAuthRedirect = ({ children }: LocalAuthRedirectProps) => {
  const isAuthenticated = useLocalAuthStore((s) => s.isAuthenticated);
  const isSupported = useLocalAuthStore((s) => s.isSupported);
  const isEnabled = useLocalAuthStore((s) => s.isEnabled);
  const authenticate = useLocalAuthStore((s) => s.authenticate);
  const { user, isSignedIn } = useAuthStore();

  const handleSensitiveAction = useCallback(async () => {
    if (!user || !isEnabled || !isSignedIn) return;

    if (!isAuthenticated) {
      await authenticate();
    }
  }, [authenticate, isEnabled, user, isAuthenticated, isSignedIn]);

  const handleTryAgain = async () => {
    await authenticate();
  };

  useEffect(() => {
    handleSensitiveAction();
  }, [isSupported, isEnabled, user]);

  if (isEnabled && !isRealDevice() && user && !isAuthenticated) {
    return (
      <Container>
        <Forbidden
          title="Local Authentication Required"
          message="Authentication is required to access this feature. Please authenticate to continue."
          onPressTryAgain={() => handleTryAgain()}
        />
      </Container>
    );
  }

  return <>{children}</>;
};
