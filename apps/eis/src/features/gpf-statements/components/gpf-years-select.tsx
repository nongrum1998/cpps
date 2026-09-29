import React, { useMemo } from 'react';
import { SelectSheet } from '@components/ui';
import type { LeaveReasonCode } from '@features/leave/types';
import { useGPFFinancialYear } from '../hooks';
import { GPFYearSelectSkeleton } from './skeleton';

interface GPFYearSelectSheetProps {
  /** Currently selected leave reason code */
  selectedyear: string;
  /** Called when a new leave reason is selected */
  onSelect: (year: string) => void;
  /** Optional validation error message */
  error?: string;
  disabled?: boolean;
  loading?: boolean;
}

/**
 * LeaveReasonDropdown is a leave-reason-specific wrapper around the reusable
 * {@link SelectSheet} component.
 *
 * It fetches available leave reasons via `useLeaveReason()` and maps them to
 * {@link SelectSheetOption | options} for the underlying bottom-sheet picker.
 *
 * @example
 * ```tsx
 * <LeaveReasonDropdown
 *   selectedReason={selectedReason}
 *   onSelect={(code) => setSelectedReason(code)}
 *   error={errors.reason?.message}
 * />
 * ```
 */
export const GPFYearSelectSheet = ({
  selectedyear,
  onSelect,
  error,
  disabled,
  loading,
}: GPFYearSelectSheetProps) => {
  const { data: financialYears = [], refetch, isFetching, isLoading } = useGPFFinancialYear();
  const options = useMemo(
    () =>
      financialYears?.map((year) => ({
        label: year.label,
        value: year.value,
      })),
    [financialYears]
  );

  if (loading) {
    return <GPFYearSelectSkeleton />;
  }

  return (
    <SelectSheet
      label="Financial Year"
      placeholder={'Select Year'}
      title="Select GPF Year"
      options={options ?? []}
      refetch={refetch}
      selectedValue={selectedyear}
      onSelect={(value) => onSelect(value as LeaveReasonCode)}
      error={error}
      disabled={disabled || isFetching || isLoading}
      loading={isFetching || isLoading}
    />
  );
};
