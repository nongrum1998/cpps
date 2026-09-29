import React, { useMemo } from 'react';
import { SelectSheet } from '@components/ui';
import { useLeaveType } from '@features/leave/hooks';
import { LeaveTypeCode } from '@sharedTypes/leave';

interface LeaveTypeDropdownProps {
  /** Currently selected leave type */
  selectedType: LeaveTypeCode;
  /** Called when a new leave type is selected */
  onSelect: (type: LeaveTypeCode) => void;
  /** Optional validation error message */
  error?: string;
  title?: string;
  disabled?: boolean;
}

/**
 * LeaveTypeDropdown is a leave-type-specific wrapper around the reusable
 * {@link SelectSheet} component.
 *
 * It fetches available leave types via `useLeaveType()` and maps them to
 * {@link SelectSheetOption | options} for the underlying bottom-sheet picker.
 *
 * @example
 * ```tsx
 * <LeaveTypeDropdown
 *   selectedType={selectedType}
 *   onSelect={(type) => setSelectedType(type)}
 *   error={errors.type?.message}
 * />
 * ```
 */
export const LeaveTypeDropdown = ({
  selectedType,
  title = 'Leave Type',
  onSelect,
  error,
  disabled,
}: LeaveTypeDropdownProps) => {
  const { data: leaveTypes, isFetching, isLoading, refetch } = useLeaveType();

  const options = useMemo(
    () =>
      (leaveTypes ?? []).map((type) => ({
        label: type.leave_desc,
        value: type.leave_cd,
      })),
    [leaveTypes]
  );

  return (
    <SelectSheet
      disabled={disabled || isFetching || isLoading}
      refetch={refetch}
      label={title}
      placeholder="Select leave type"
      title="Select Leave Type"
      options={options}
      selectedValue={selectedType}
      onSelect={(value) => onSelect(value as LeaveTypeCode)}
      error={error}
    />
  );
};
