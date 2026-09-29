import { useThemeStore } from '@stores/theme.store';
import { colorScheme as nativewindColorScheme } from 'nativewind';
import { ReactNode, useLayoutEffect } from 'react';
import { Appearance } from 'react-native';

/**
 * ThemeProvider handles the synchronization between the app's theme store
 * and NativeWind's color scheme, particularly for system-level changes.
 */
export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const { theme } = useThemeStore();

  useLayoutEffect(() => {
    // 1. Handle system-level theme changes when theme is set to 'system'
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      if (theme === 'system' && colorScheme) {
        nativewindColorScheme.set(colorScheme);
      }
    });

    // 2. Ensure synchronization on component mount/theme change
    // (Though store handles direct changes, this ensures consistency)
    const targetTheme = theme === 'system' ? Appearance.getColorScheme() || 'light' : theme;
    nativewindColorScheme.set(targetTheme);

    return () => subscription.remove();
  }, [theme]);

  return <>{children}</>;
};
