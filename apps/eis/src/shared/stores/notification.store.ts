import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import * as SecureStore from 'expo-secure-store';
import { useAuthStore } from './auth.store';

type NotificationStatus = 'pending' | 'error' | 'success';

type Notification = {
  emp_cd: string;
  status: NotificationStatus;
};

type UseNotificationStore = {
  notification: Notification;
  registeredEmpCd: string;
  setNotification: (status: NotificationStatus) => void;
  setRegisteredEmpCd: (emp_cd: string) => void;
  reset: () => void;
};

export const useNotificationStore = create<UseNotificationStore>()(
  persist(
    (set) => ({
      notification: {
        emp_cd: '',
        status: 'pending',
      },
      registeredEmpCd: '',
      setNotification: (status: NotificationStatus) => {
        const auth = useAuthStore.getState();
        set({ notification: { emp_cd: auth.emp_cd, status } });
      },
      setRegisteredEmpCd: (emp_cd: string) => {
        set({ registeredEmpCd: emp_cd });
      },
      reset: () => {
        set({ notification: { emp_cd: '', status: 'pending' } });
      },
    }),
    {
      name: 'notification-storage',
      storage: createJSONStorage(() => ({
        getItem: SecureStore.getItemAsync,
        setItem: SecureStore.setItemAsync,
        removeItem: SecureStore.deleteItemAsync,
      })),
    }
  )
);
