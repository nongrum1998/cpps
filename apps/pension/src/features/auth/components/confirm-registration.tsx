import { useState } from 'react';
import { View, Text } from 'react-native';
import { useRegistrationStore } from '../store/registration';
import { useRegisterPensioner } from '../hooks';
import { Button } from '@components/ui/button';
import { RegisterPensionerSchema } from '../validators';
import { useSnackbar } from '@hooks/use-snackbar';
import { useNetworkStatus } from '@hooks/use-network-status';
import { formatPassword, sha256 } from '@lib/encryption';
import { Alert, AlertDescription, AlertTitle } from '@components/ui/alert';
import { RegistrationConfirmDialog } from './registration-confirm-dialog';

/**
 * Step 4 of registration: review and submit.
 *
 * Shows a summary card of all entered data (bank account and password
 * masked) with >=16px labels / 18px values, theme-token colors for dark
 * mode, and two equal-width actions: "Back" (preserves data) and "Submit".
 * A confirmation dialog appears before the final submission to prevent
 * accidental registrations. On success the store's `isSuccess` is set (which
 * swaps the screen to a success view); on failure an inline destructive alert
 * shows the server message and the form remains for retry.
 */
export function ConfirmRegistrationScreen() {
  const { formData, prevStep, setSuccess } = useRegistrationStore();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { showSnackbar } = useSnackbar();
  const { mutate: register, isPending: isRegistering } = useRegisterPensioner();
  const { isOffline } = useNetworkStatus();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  /**
   * Validates form data first. Opens the confirmation dialog only if
   * validation passes; otherwise shows a snackbar with the error.
   */
  const handleSubmitClick = () => {
    setErrorMessage(null);
    const isValidData = RegisterPensionerSchema.safeParse(formData);
    if (isValidData.success) {
      setIsConfirmOpen(true);
    } else {
      showSnackbar(
        isValidData.error.issues[0]?.message || 'Registration failed. Please try again.'
      );
    }
  };

  /**
   * Called when the user taps "Confirm" in the dialog.
   * Closes the dialog and fires the registration mutation.
   */
  const handleDialogConfirm = () => {
    setIsConfirmOpen(false);
    register(
      {
        ...formData,
        password: sha256(formatPassword(formData.password)),
      },
      {
        onSuccess: (data) => {
          if (data.success) {
            setSuccess();
          } else {
            setErrorMessage(data.message || 'Registration failed. Please try again.');
          }
        },
      }
    );
  };

  const maskBankAccount = (accountNumber?: string) => {
    if (!accountNumber) return 'N/A';
    if (accountNumber.length <= 6) return accountNumber;
    return `•••• •••• ${accountNumber.slice(-6)}`;
  };

  return (
    <View className="w-full gap-4">
      {errorMessage ? (
        <Alert variant="destructive">
          <AlertTitle>Registration Failed</AlertTitle>
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      ) : null}

      <View className="rounded-xl border border-border bg-card px-4 py-2">
        <View className="flex-row items-center justify-between border-b border-border py-3.5">
          <Text className="text-base text-muted-foreground">PPO Number</Text>
          <Text className="text-lg font-bold text-foreground">{formData.ppo_no || 'N/A'}</Text>
        </View>

        <View className="flex-row items-center justify-between border-b border-border py-3.5">
          <Text className="text-base text-muted-foreground">Date of Birth</Text>
          <Text className="text-lg font-bold text-foreground">{formData.dob || 'N/A'}</Text>
        </View>

        <View className="flex-row items-center justify-between border-b border-border py-3.5">
          <Text className="text-base text-muted-foreground">Bank Account</Text>
          <Text className="text-lg font-bold text-foreground">
            {maskBankAccount(formData.bank_account_number)}
          </Text>
        </View>

        <View className="flex-row items-center justify-between py-3.5">
          <Text className="text-base text-muted-foreground">Password</Text>
          <Text className="text-lg font-bold text-foreground">••••••••</Text>
        </View>
      </View>

      <View className="flex-row gap-3">
        <Button
          size="lg"
          onPress={prevStep}
          variant="outline"
          disabled={isRegistering}
          className="flex-1">
          Back
        </Button>

        <Button
          size="lg"
          onPress={handleSubmitClick}
          disabled={isRegistering || isOffline}
          isLoading={isRegistering}
          className="flex-1">
          Submit
        </Button>
      </View>

      <RegistrationConfirmDialog
        open={isConfirmOpen}
        onOpenChange={setIsConfirmOpen}
        onConfirm={handleDialogConfirm}
        isPending={isRegistering}
      />
    </View>
  );
}
