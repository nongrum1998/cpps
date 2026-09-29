import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import * as SecureStore from 'expo-secure-store';
import * as LocalAuthentication from 'expo-local-authentication';
import { logger } from '@utils/logger';

type LocalAuthStore = {
  isEnabled: boolean;
  isSupported: boolean;
  isEnrolled: boolean;
  isAuthenticated: boolean;

  setIsEnabled: (value: boolean) => void;
  checkHardwareAsync: () => Promise<void>;
  authenticate: () => Promise<boolean>;
};

export const useLocalAuthStore = create<LocalAuthStore>()(
  persist(
    (set, get) => ({
      isEnabled: false,
      isSupported: false,
      isEnrolled: false,
      isAuthenticated: false,

      setIsEnabled: (value: boolean) => set({ isEnabled: value }),

      checkHardwareAsync: async () => {
        try {
          const compatible = await LocalAuthentication.hasHardwareAsync();
          set({ isSupported: compatible });
          if (compatible) {
            const enrolled = await LocalAuthentication.isEnrolledAsync();
            set({ isEnrolled: enrolled });
          }
        } catch (error) {
          logger.error('LocalAuthStore: Hardware Detection Error', error);
        }
      },

      authenticate: async () => {
        const { isSupported, isEnrolled } = get();
        try {
          if (!isSupported || !isEnrolled) return false;

          const result = await LocalAuthentication.authenticateAsync({
            promptMessage: 'Authentication Required',
            fallbackLabel: 'Enter Password',
          });
          if (result.success) {
            set({ isAuthenticated: true });
            return true;
          }
          return false;
        } catch (error) {
          logger.error('LocalAuthStore: Interaction Error', error);
          return false;
        }
      },
    }),
    {
      name: 'local-auth-storage',
      storage: createJSONStorage(() => ({
        getItem: SecureStore.getItemAsync,
        setItem: SecureStore.setItemAsync,
        removeItem: SecureStore.deleteItemAsync,
      })),
      partialize: (state) => ({ isEnabled: state.isEnabled }),
    }
  )
);
