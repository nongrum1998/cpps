import React, { useState } from 'react';
import { Container } from '@components/layout';
import { EmptyScreen } from '@components/screens';
import { useSnackbar } from '@hooks';
import { useAuthStore } from '@stores/auth.store';
import { GeNumberForm } from '../components/ge-number-form';
import { EPayslipConfirmDialog } from '../components/e-payslip-confirm-dialog';
import { EPaySlipListSkeleton } from '../components/skeleton';
import { useEPayslip } from '../hooks/use-e-payslip';
import { useUpdateGeNumber } from '../hooks/use-update-ge-number';
import { router } from 'expo-router';
import { FlatList, Text, View } from 'react-native';
import { EPayslipListItemCard } from '../components/e-payslip-list-item';

const ENTRY_ERROR = 'No e-pay slip found for this GE number. Please check and try again.';

/**
 * E-Pay Slip screen.
 *
 * Flow:
 * 1. User has a stored GE number -> auto-fetch and show the payslip with
 *    the Download PDF action (no confirmation).
 * 2. User has no GE number -> the entry form is shown first.
 * 3. After fetching with a newly entered GE number, a confirmation dialog
 *    verifies the payslip belongs to the current user.
 * 4. On confirm, the GE number is persisted to the backend; the auth store
 *    is refreshed (`refresh()`) so `user.ge_number` is repopulated from
 *    employee details.
 * 5. Only then is the PDF download enabled.
 */
export const EPaySlipScreen = () => {
  const { user, refresh } = useAuthStore();
  const existingGeNumber = user?.ge_no?.trim() ?? '';

  const [enteredGeNumber, setEnteredGeNumber] = useState('');
  const [pendingGeNumber, setPendingGeNumber] = useState<string | null>(null);
  const [confirmedGeNumber, setConfirmedGeNumber] = useState<string | null>(null);

  const activeGeNumber = existingGeNumber || confirmedGeNumber || pendingGeNumber || '';

  const { data: ePaySlips, isLoading, isError } = useEPayslip({ geNumber: activeGeNumber });

  const updateGeNumber = useUpdateGeNumber();

  const { showSnackbar } = useSnackbar();

  const needsGeNumber = !activeGeNumber;

  const isNewEntryFetch = !!pendingGeNumber && !confirmedGeNumber;

  const handleGeNumberSubmit = (geNumber: string) => {
    setEnteredGeNumber(geNumber);
    if (pendingGeNumber === geNumber) {
      // Re-submitting the same number after a fetch error: retry the query.
      refresh();
    } else {
      setPendingGeNumber(geNumber);
    }
  };

  const handleConfirmPayslip = async () => {
    if (!enteredGeNumber) {
      showSnackbar('GE Number is required to continue');
      return;
    }
    updateGeNumber.mutate(
      { geNumber: enteredGeNumber },
      {
        onSuccess: (data) => {
          if (data.success) {
            showSnackbar(data.message);
            setConfirmedGeNumber(enteredGeNumber);
            setPendingGeNumber(null);
            return;
          }
          showSnackbar(data.message);
          return;
        },
        onError: () => {
          showSnackbar('Error when updating user GE number, Please try again');
          setPendingGeNumber(null);
          return;
        },
      }
    );
  };

  const handleConformationCancelPayslip = () => setPendingGeNumber(null);

  const userName = [user?.emp_fname, user?.emp_mname, user?.emp_lname].filter(Boolean).join(' ');

  // Loading: initial fetch, or the first fetch of a newly entered GE number.
  if (isLoading) {
    return <EPaySlipListSkeleton />;
  }

  // A newly entered GE number failed to fetch: return to the form with an
  // inline error so the user can correct the number.
  if (isError && isNewEntryFetch) {
    return <GeNumberForm onSubmit={handleGeNumberSubmit} error={ENTRY_ERROR} />;
  }

  // Case 2 - no GE number yet (or the user cancelled): prompt for entry.
  if (needsGeNumber) {
    return <GeNumberForm onSubmit={handleGeNumberSubmit} />;
  }

  // Existing GE number failed to fetch: full-screen error with retry.
  if (isError || !ePaySlips) {
    return (
      <Container className="flex-1">
        <EmptyScreen
          title="Unable to load e-pay slip"
          message="No e-pay slip could be fetched for the given GE number. Please try again."
          refresh={() => router.back()}
          refreshLabel="Go Back"
        />
      </Container>
    );
  }

  const showConfirmation = isNewEntryFetch;
  return (
    <Container>
      <View className="pb-10">
        {/* Header Text Section */}
        <View className="mb-6">
          <Text className="mb-1 text-2xl font-bold text-gray-900">E-Payslips</Text>
          <Text className="text-sm text-graphite">Review your monthly earnings statement</Text>
        </View>
        <FlatList
          data={ePaySlips}
          keyExtractor={(item) => item.payslip_no + item.sign_date}
          renderItem={({ item }) => <EPayslipListItemCard item={item} />}
          showsVerticalScrollIndicator={false}
          contentContainerClassName="pb-10"
        />
        <EPayslipConfirmDialog
          open={showConfirmation}
          payslip={ePaySlips[0]}
          userName={userName}
          isConfirming={updateGeNumber.isPending}
          onConfirm={handleConfirmPayslip}
          onCancel={handleConformationCancelPayslip}
        />
      </View>
    </Container>
  );
};
