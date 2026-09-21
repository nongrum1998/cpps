import { View } from 'react-native';

import { Alert, AlertTitle, AlertDescription, Icon } from '@components/ui';

/**
 * The props for {@link DLCAlerts}.
 */
type DLCAlertsProps = {
  /** Whether the user has granted camera permission to the app. */
  hasPermission: boolean;
  /** Whether the device exposes a usable front-facing camera. */
  frontCameraAvailable: boolean;
  /** Whether the device currently has no network connectivity. */
  isOffline: boolean;
};

/**
 * Renders the conditional destructive alert banners for the DLC screen.
 *
 * Displays up to three diagnostic alerts depending on the supplied flags:
 * a "Camera Permission Required" alert when `hasPermission` is false, a
 * "Front Camera Not Available" alert when a front camera is missing, and a
 * "Connection Error" alert when the device is offline. Only applicable alerts
 * are rendered; when none match, nothing is returned.
 *
 * @param props - {@link DLCAlertsProps}.
 * @returns The matching alert banners, or `null` when none apply.
 */
export function DLCAlerts({ hasPermission, frontCameraAvailable, isOffline }: DLCAlertsProps) {
  return (
    <>
      {!hasPermission && (
        <Alert variant="destructive">
          <Icon name="alert-circle" size={18} className="mt-0.5 text-destructive" />

          <View className="flex-1">
            <AlertTitle>Camera Permission Required</AlertTitle>

            <AlertDescription>
              Camera access is required to continue. Please allow camera permission in your device
              settings.
            </AlertDescription>
          </View>
        </Alert>
      )}

      {hasPermission && !frontCameraAvailable && (
        <Alert variant="destructive">
          <Icon name="alert-circle" size={18} className="mt-0.5 text-destructive" />

          <View className="flex-1">
            <AlertTitle className="text-sm">Front Camera Not Available</AlertTitle>

            <AlertDescription>
              This device does not have a front-facing camera. A front camera is required to
              continue.
            </AlertDescription>
          </View>
        </Alert>
      )}

      {isOffline && (
        <Alert variant="destructive">
          <Icon name="alert-circle" size={18} className="mt-0.5 text-destructive" />
          <View className="flex-1">
            <AlertTitle className="text-sm">Connection Error</AlertTitle>
            <AlertDescription>
              Please check your internet connection before proceeding
            </AlertDescription>
          </View>
        </Alert>
      )}
    </>
  );
}
