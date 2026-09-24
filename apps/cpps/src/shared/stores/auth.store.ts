import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import * as SecureStore from 'expo-secure-store';
import { UserT } from '../types/auth';
import { TokenStoreManager } from '@stores/token.store';
import { logger } from '../../../../../packages/utils/src/logger';
import { http } from '@utils/http';
import { ENDPOINTS } from '@utils/constants';

type AuthStore = {
  user?: UserT | null;
  isSignedIn: boolean;
  isAuthLoading: boolean;

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
      isSignedIn: true,
      isAuthLoading: true,

      fetchUser: async (keepStaleOnError?: boolean) => {
        set({ isAuthLoading: true });
        const accessToken = await TokenStoreManager.getAccessToken();
        if (accessToken) {
          try {
            const { data, success } = await http.post<UserT>(ENDPOINTS.AUTH.USER, {});
            if (data && success) {
              console.log(data);
              set({
                user: data,
                isSignedIn: true,
                isAuthLoading: false,
              });
            } else {
              get().reset();
            }
          } catch {
            if (!keepStaleOnError) {
              get().reset();
            }
          } finally {
            set({ isAuthLoading: false });
          }
        }
      },
      refresh: () => get().fetchUser(),
      reset: () => set({ user: null, isSignedIn: false }),
      logout: async () => {
        try {
          set({ isAuthLoading: true });
          const accessToken = await TokenStoreManager.getAccessToken();

          if (accessToken) {
            await http.post(ENDPOINTS.AUTH.LOGOUT);
          }
        } catch (error) {
          logger.error('AuthStore: logout API call failed', error);
        }

        await TokenStoreManager.removeTokens();
        get().reset();

        try {
          const { queryClient } = await import('@utils/react-query');
          queryClient.clear();
        } catch (error) {
          logger.error('Error Logout Query Clear', error);
        }
        set({ isAuthLoading: false });
      },

      _hydrate: async () => {
        try {
          const accessToken = await TokenStoreManager.getAccessToken();
          if (accessToken) {
            await get().fetchUser();
          } else {
            get().reset();
          }
        } catch {
          get().reset();
        } finally {
          set({ isAuthLoading: false });
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => ({
        getItem: async (key) => {
          const value = await SecureStore.getItemAsync(key);
          return value;
        },
        setItem: async (key, value) => {
          return SecureStore.setItemAsync(key, value);
        },
        removeItem: async (key) => {
          return SecureStore.deleteItemAsync(key);
        },
      })),

      partialize: (state) => {
        const partial = {
          user: state.user,
          isSignedIn: state.isSignedIn,
          isAuthLoading: false,
        };
        return partial;
      },
    }
  )
);
