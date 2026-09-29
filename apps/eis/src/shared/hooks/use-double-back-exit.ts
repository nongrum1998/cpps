import { useCallback, useRef } from 'react';
import { BackHandler, ToastAndroid as Toast } from 'react-native';
import { Route, useFocusEffect, usePathname } from 'expo-router';

type UseDoubleBackExitOptions = {
  /**
   * Maximum time in ms between two back presses to trigger an exit.
   * @default 2000
   */
  duration?: number;
  /**
   * Route paths where the double-back-to-exit behaviour should activate.
   * On any other route the back press is forwarded to the default handler.
   *
   * @default ['/']
   */
  rootRoutes?: Route[];
};

/**
 * Registers an Android hardware-back handler that shows a toast on the first
 * press and exits the app if the user presses again within `duration` ms.
 *
 * Only activates when the **current pathname** matches one of the `rootRoutes`.
 * This avoids the common pitfall of using `router.canGoBack()`, which often
 * returns `true` even on the root screen in Expo Router, preventing the exit
 * logic from ever running.
 *
 * @example
 * ```tsx
 * // On the home screen (exit on double back)
 * useDoubleBackExit();
 *
 * // On multiple root-level screens
 * useDoubleBackExit({ rootRoutes: ['/', '/leaves'] });
 *
 * // Custom duration
 * useDoubleBackExit({ duration: 1500, rootRoutes: ['/'] });
 * ```
 */
export function useDoubleBackExit({
  duration = 2000,
  rootRoutes = ['/'],
}: UseDoubleBackExitOptions = {}) {
  const lastBackPress = useRef(0);
  const pathname = usePathname();

  useFocusEffect(
    useCallback(() => {
      const isRoot = rootRoutes.some((route) => pathname.startsWith(route));

      const onBackPress = () => {
        if (!isRoot) {
          return false;
        }

        const now = Date.now();

        if (now - lastBackPress.current < duration) {
          BackHandler.exitApp();
          return true;
        }

        lastBackPress.current = now;

        Toast.show('Press again to exit', Toast.SHORT);

        return true;
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () => subscription.remove();
    }, [duration, pathname, rootRoutes])
  );
}
