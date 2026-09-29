import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import * as SecureStore from 'expo-secure-store';
import { colorScheme as nativewindColorScheme } from 'nativewind';
import { Appearance } from 'react-native';

export type ThemeType = 'light' | 'dark' | 'system';

type UseThemeStore = {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
  toggleTheme: () => void;
};

const getTargetTheme = (theme: ThemeType) => {
  if (theme === 'system') {
    return Appearance.getColorScheme() || 'light';
  }
  return theme;
};

export const useThemeStore = create<UseThemeStore>()(
  persist(
    (set) => ({
      theme: 'system',
      setTheme: (theme: ThemeType) => {
        nativewindColorScheme.set(getTargetTheme(theme));
        set({ theme });
      },
      toggleTheme: () =>
        set((state) => {
          const nextTheme = state.theme === 'dark' ? 'light' : 'dark';
          nativewindColorScheme.set(nextTheme);
          return { theme: nextTheme };
        }),
    }),
    {
      name: 'theme-storage',
      storage: createJSONStorage(() => ({
        getItem: SecureStore.getItemAsync,
        setItem: SecureStore.setItemAsync,
        removeItem: SecureStore.deleteItemAsync,
      })),
      onRehydrateStorage: () => (state) => {
        if (state) {
          nativewindColorScheme.set(getTargetTheme(state.theme));
        }
      },
    }
  )
);
