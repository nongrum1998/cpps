import React, { useMemo } from 'react';
import { SelectSheet } from '@components/ui';
import type { LeaveReasonCode } from '@features/leave/types';
import { useLeaveReason } from '@features/leave/hooks';

interface LeaveReasonDropdownProps {
  /** Currently selected leave reason code */
  selectedReason: LeaveReasonCode;
  /** Called when a new leave reason is selected */
  onSelect: (reason: LeaveReasonCode) => void;
  /** Optional validation error message */
  error?: string;
  disabled?: boolean;
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
export const LeaveReasonDropdown = ({
  selectedReason,
  onSelect,
  error,
  disabled,
}: LeaveReasonDropdownProps) => {
  const { data: leaveReason, refetch, isFetching, isLoading } = useLeaveReason();

  const options = useMemo(
    () =>
      (leaveReason ?? []).map((reason) => ({
        label: reason.code_text,
        value: reason.code_value,
      })),
    [leaveReason]
  );

  return (
    <SelectSheet
      label="Leave Reason"
      placeholder="Select leave reason"
      title="Select Leave Reason"
      options={options}
      refetch={refetch}
      selectedValue={selectedReason}
      onSelect={(value) => onSelect(value as LeaveReasonCode)}
      error={error}
      disabled={disabled || isFetching || isLoading}
    />
  );
};
