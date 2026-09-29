import React from 'react';
import * as Notifications from 'expo-notifications';
import { useNotifications } from '@features/notification/hooks/use-notifications';

/**
 * Configure global foreground behavior for notifications.
 * This determines how alerts, sounds, and badges are handled when the app is active.
 */
const configureNotificationSettings = () => {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowList: true,
      shouldShowBanner: true,
    }),
  });
};

configureNotificationSettings();

/**
 * Global Notification Provider
 * Promoted to the shared layer to act as the primary orchestrator for the push notification lifecycle.
 */
export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
  // Initialize the notification lifecycle hook (registration, listeners, deep-linking)
  useNotifications();

  return <React.Fragment>{children}</React.Fragment>;
};
