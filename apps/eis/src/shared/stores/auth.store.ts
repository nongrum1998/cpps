import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import * as SecureStore from 'expo-secure-store';
import { RoleT, UserT } from '../types/auth';
import { TokenStoreManager } from '@stores/token.store';
import { logger } from '@utils/logger';
import { rpc } from '@utils/api';
import { METHODS } from '@utils/constants';

type AuthStore = {
  user?: UserT | null;
  emp_cd: string;
  setEmpCode: (empCode: string) => void;
  isSignedIn: boolean;
  isAuthLoading: boolean;
  role: RoleT;

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
      isSignedIn: false,
      isAuthLoading: true,
      emp_cd: '',
      setEmpCode: (value: string) => set({ emp_cd: value }),
      isGazetted: false,
      role: 'USER',

      fetchUser: async (keepStaleOnError?: boolean) => {
        const empCode = get().emp_cd;

        logger.info('AuthStore: fetchUser called', { empCode, keepStaleOnError });

        const accessToken = await TokenStoreManager.getAccessToken();

        if (empCode && accessToken) {
          try {
            const res = await rpc<UserT>(METHODS.GET_EMP_DETAILS, { emp_cd: empCode });

            if (res.success && res.data) {
              logger.info('AuthStore: fetchUser success', { empCode });
              set({
                user: res.data,
                isSignedIn: true,
                role: 'USER',
                isAuthLoading: false,
              });
            } else {
              logger.warn('AuthStore: fetchUser returned no data', {
                empCode,
                message: res.message,
                success: res.success,
              });
              get().reset();
            }
          } catch (error) {
            logger.error('AuthStore: fetchUser failed', error);
            if (!keepStaleOnError) {
              get().reset();
            }
          }
        } else {
          logger.warn('AuthStore: fetchUser skipped — emp_cd is empty', empCode, !!accessToken);
        }
      },

      refresh: () => {
        get().fetchUser();
      },

      reset: () => {
        set({ user: null, isSignedIn: false, role: 'USER', emp_cd: '' });
      },

      logout: async () => {
        try {
          const accessToken = await TokenStoreManager.getAccessToken();
          if (accessToken) {
            // await http.post(ENDPOINTS.AUTH.LOGOUT, { refresh_token: refreshToken });
          }
        } catch (error) {
          logger.error('AuthStore: logout API call failed', error);
        }

        await TokenStoreManager.removeTokens();
        get().reset();

        try {
          const { queryClient } = await import('@utils/react-query');
          queryClient.clear();
        } catch {}
      },

      _hydrate: async () => {
        logger.info('AuthStore: _hydrate started');
        const state = get();
        logger.info('AuthStore: current store state', {
          user: !!state.user,
          emp_cd: state.emp_cd,
          isSignedIn: state.isSignedIn,
        });
        try {
          const accessToken = await TokenStoreManager.getAccessToken();
          logger.info('AuthStore: access token found', { hasToken: !!accessToken });
          if (accessToken) {
            await get().fetchUser();
          } else {
            get().reset();
          }
        } catch (error) {
          logger.error('AuthStore: _hydrate failed', error);
          get().reset();
        } finally {
          logger.info('AuthStore: _hydrate complete, setting isAuthLoading=false');
          set({ isAuthLoading: false });
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => ({
        getItem: async (key) => {
          const value = await SecureStore.getItemAsync(key);
          logger.info('AuthStore: persist getItem', { key, hasValue: !!value });
          return value;
        },
        setItem: async (key, value) => {
          logger.info('AuthStore: persist setItem', { key, size: value?.length });
          return SecureStore.setItemAsync(key, value);
        },
        removeItem: async (key) => {
          logger.info('AuthStore: persist removeItem', { key });
          return SecureStore.deleteItemAsync(key);
        },
      })),

      partialize: (state) => {
        const partial = {
          user: state.user,
          emp_cd: state.emp_cd,
          isSignedIn: state.isSignedIn,
          role: state.role,
          isAuthLoading: false,
        };
        logger.info('AuthStore: persist partialize', {
          hasUser: !!state.user,
          emp_cd: state.emp_cd,
          isSignedIn: state.isSignedIn,
        });
        return partial;
      },
    }
  )
);
