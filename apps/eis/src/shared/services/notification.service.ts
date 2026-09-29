import { Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import * as Constants from 'expo-constants';
import { logger } from '@utils/logger/logger';
import { rpc } from '@utils/api';
import { METHODS } from '@utils/constants';
import { env } from '@utils/env';

type TErrorType = 'PERMISSION_DENIED' | 'NOT_A_DEVICE' | 'CONFIG_ERROR' | 'NETWORK_ERROR';

export type RegistrationResult = {
  success: boolean;
  token?: string;
  errorType?: TErrorType;
};

/**
 * Service for managing global Push Notification lifecycle.
 * Promoted from features/ to shared/ for universal accessibility.
 */
export const NotificationService = {
  /**
   * Registers the device for push notifications and syncs the token with the backend.
   */
  async register({ emp_cd }: { emp_cd: string }): Promise<RegistrationResult> {
    if (!emp_cd) {
      logger.info('NotificationService: No user id provided', { emp_cd });
      return { success: false, errorType: 'CONFIG_ERROR' };
    }

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
        description: 'Default channel for notifications',
        enableLights: true,
      });
    }

    if (!Device.isDevice) {
      logger.warn('NotificationService: Must use physical device');
      return { success: false, errorType: 'NOT_A_DEVICE' };
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      logger.warn('NotificationService: Permission not granted');
      return { success: false, errorType: 'PERMISSION_DENIED' };
    }

    const projectId =
      Constants?.default.easConfig?.projectId ??
      Constants?.default.expoConfig?.extra?.eas?.projectId;

    if (!projectId) {
      logger.error('NotificationService: EAS Project ID not found');
      return { success: false, errorType: 'CONFIG_ERROR' };
    }

    try {
      // 1. Obtain Token from Expo
      const tokenResponse = await Notifications.getExpoPushTokenAsync({ projectId });

      const token = tokenResponse.data;

      // 2. Register with Backend
      if (env.NODE_ENV === 'development') {
        logger.info('NotificationService: Skipping backend registration in development', {
          expoToken: token,
        });

        return { success: true, token };
      }

      const res = await rpc(METHODS.INSERT_NOTIFICATION_TOKEN, {
        device_token: token,
        emp_cd,
      });

      if (res.success) {
        logger.info('NotificationService: Token synced successfully', { token });
        return { success: true, token };
      }

      throw new Error(res.message || 'Backend registration failed');
    } catch (error) {
      logger.error('NotificationService: Registration lifecycle failure', error);
      return { success: false, errorType: 'NETWORK_ERROR' };
    }
  },

  async unregister({ emp_cd }: { emp_cd: string }): Promise<void> {
    try {
      const projectId =
        Constants?.default.easConfig?.projectId ??
        Constants?.default.expoConfig?.extra?.eas?.projectId;

      if (!projectId) {
        logger.error('NotificationService: EAS Project ID not found');
        return;
      }

      const tokenResponse = await Notifications.getExpoPushTokenAsync({ projectId });

      const token = tokenResponse.data;
      await rpc(METHODS.INSERT_NOTIFICATION_TOKEN, { emp_cd, token });
    } catch (error) {
      logger.error('NotificationService: Unregistration lifecycle failure', error);
      return;
    }
  },
};
