import { useColorScheme } from 'react-native';
import { useThemeStore } from '@stores/theme.store';

/**
 * Resolves the effective color theme for the app.
 *
 * Reads the user's preference from the theme store. When set to
 * `'system'`, it falls back to the device's current color scheme
 * via `useColorScheme()`. If the device scheme is unavailable
 * (null), defaults to `'light'`.
 *
 * @returns `'dark'` or `'light'` — a concrete theme value, never
 *          the literal `'system'`.
 *
 * @example
 * ```tsx
 * const theme = useTheme();
 * const isDark = theme === 'dark';
 * ```
 */
export const useTheme = () => {
  const { theme } = useThemeStore();
  const colorScheme = useColorScheme();
  const isColorSchemeDark = colorScheme !== null && colorScheme === 'dark';
  return theme === 'system' ? (isColorSchemeDark ? 'dark' : 'light') : theme;
};
