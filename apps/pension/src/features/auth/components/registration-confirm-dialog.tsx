import { Text } from 'react-native';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@components/ui';

/** Props for {@link RegistrationConfirmDialog}. */
export interface RegistrationConfirmDialogProps {
  /** Whether the dialog is visible. Controlled by the parent. */
  open: boolean;
  /** Called on dismiss requests (backdrop tap / close). Pass the state setter. */
  onOpenChange: (open: boolean) => void;
  /** Called when the user confirms. The parent runs the registration mutation. */
  onConfirm: () => void;
  /** Whether the mutation is in progress. Disables the Confirm button to prevent double-taps. */
  isPending?: boolean;
}

/**
 * Confirmation alert shown before the app submits the pensioner's registration.
 *
 * Gives the user a final chance to review before submitting their registration
 * details to the server. Renders fixed "Cancel" and "Confirm" actions.
 * Unlike the ChangePasswordConfirmDialog, this uses primary (non-destructive)
 * styling because registration is a constructive action.
 */
export function RegistrationConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  isPending = false,
}: RegistrationConfirmDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent onClose={() => onOpenChange(false)}>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirm Registration?</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to register as a pensioner? Please make sure all the details you
            entered are correct.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            title="Cancel"
            onPress={() => onOpenChange(false)}
            accessibilityLabel="Cancel registration"
          />
          <AlertDialogAction
            onPress={onConfirm}
            disabled={isPending}
            accessibilityLabel="Confirm and submit registration">
            <Text className="text-base font-bold text-white">Confirm</Text>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
