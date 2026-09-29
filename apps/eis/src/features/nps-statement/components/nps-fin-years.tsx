import React, { useMemo } from 'react';
import { SelectSheet } from '@components/ui';
import type { LeaveReasonCode } from '@features/leave/types';
import { useNpsFinYear } from '../hooks/use-nps-fin-year';

interface FinYearSelectSheetProps {
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
export const NpsFinYearSelectSheet = ({
  selectedyear,
  onSelect,
  error,
  disabled,
}: FinYearSelectSheetProps) => {
  const { data: financialYears = [], refetch, isFetching, isLoading } = useNpsFinYear();

  const options = useMemo(
    () =>
      financialYears
        ?.map((year) => ({
          label: year.fin_year,
          value: year.id,
        }))
        .filter((value) => value.value !== '0'),
    [financialYears]
  );

  return (
    <SelectSheet
      label="Financial Years"
      placeholder={'Select Year'}
      title="Select Financial Year"
      options={options ?? []}
      loading={isLoading || isFetching}
      refetch={refetch}
      selectedValue={selectedyear}
      onSelect={(value) => onSelect(value as LeaveReasonCode)}
      error={error}
      disabled={disabled || isFetching || isLoading}
    />
  );
};
