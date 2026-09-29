import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@components/ui/alert-dialog';
import { useAuthStore } from '@stores/auth.store';

interface ConfirmLogoutAlertProps {
  /**
   * Whether the logout confirmation dialog is currently visible.
   */
  open: boolean;

  /**
   * Callback invoked when the user makes a choice or dismisses the dialog.
   *
   * - Called with `true` when the user confirms logout.
   * - Called with `false` when the user cancels or taps the backdrop to
   *   dismiss.
   *
   * The caller is responsible for closing the dialog by setting `open` to
   * `false` and, if the value is `true`, executing the actual logout flow.
   */
  onValueChange: (value: boolean) => void;
}

/**
 * A confirmation alert dialog displayed before logging the user out.
 *
 * Wraps the design system's `AlertDialog` primitives with copy and button
 * configuration specific to the logout flow. The caller controls visibility
 * via `open` and receives the user's decision via `onValueChange`.
 *
 * **Layout:**
 * - Title: "Log Out"
 * - Description: "Are you sure you want to log out?"
 * - Actions: Cancel (outline) + Log Out (destructive)
 *
 * @example
 * ```tsx
 * const [showLogoutAlert, setShowLogoutAlert] = useState(false);
 *
 * const handleLogoutConfirm = (confirmed: boolean) => {
 *   setShowLogoutAlert(false);
 *   if (confirmed) logout();
 * };
 *
 * return (
 *   <>
 *     <SettingRow icon={Logout01Icon} label="Log Out" isDestructive onPress={() => setShowLogoutAlert(true)} />
 *     <ConfirmLogoutAlert open={showLogoutAlert} onValueChange={handleLogoutConfirm} />
 *   </>
 * );
 * ```
 */
export const ConfirmLogoutAlert = ({ open, onValueChange }: ConfirmLogoutAlertProps) => {
  const { logout } = useAuthStore();
  const handleConfirm = () => {
    logout();
    onValueChange(false);
  };

  const handleCancelOrDismiss = () => {
    onValueChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={handleCancelOrDismiss}>
      <AlertDialogContent onClose={handleCancelOrDismiss}>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-center text-display-sm font-semibold leading-relaxed">
            Log Out
          </AlertDialogTitle>
          <AlertDialogDescription>Are you sure you want to log out?</AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel
            className="text-center"
            variant={'outline'}
            onPress={handleCancelOrDismiss}
          />
          <AlertDialogAction
            className="text-center"
            variant="destructive"
            title="Log Out"
            onPress={handleConfirm}
          />
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

ConfirmLogoutAlert.displayName = 'ConfirmLogoutAlert';
