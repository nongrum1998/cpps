import { LeaveListItem, LeaveTypeCode } from '@sharedTypes/leave';

/**
 * Numeric reason codes for a leave request.
 *
 * Each value maps to a predefined leave reason (e.g. sick,
 * personal, annual) as configured in the backend master data.
 */
export type LeaveReasonCode =
  | '1'
  | '2'
  | '3'
  | '4'
  | '5'
  | '6'
  | '7'
  | '8'
  | '9'
  | '10'
  | '11'
  | '12'
  | '13';

/**
 * A leave reason code paired with its human-readable label.
 *
 * Used to populate dropdowns when the user selects a reason
 * for a leave request.
 */
export interface LeaveReason {
  /** Display text shown to the user (e.g. "Sick - Medical Certificate"). */
  code_text: string;
  /** Machine-readable reason code. */
  code_value: LeaveReasonCode;
}

/**
 * A leave type code paired with its description.
 *
 * Represents one category of leave (e.g. Sick Leave, Earned
 * Leave) as configured in the backend master data.
 */
export interface LeaveType {
  /** Three-letter leave type code (e.g. `SL`, `EL`, `PL`). */
  leave_cd: LeaveTypeCode;
  /** Human-readable description of the leave type. */
  leave_desc: string;
}

/**
 * The employee's current leave balance snapshot for a single leave type.
 *
 * Returned alongside leave details to show how many days remain after
 * accounting for usage and recent credits.
 *
 * @example
 * ```ts
 * const bal: LeaveBal = {
 *   type: 'SL',
 *   leave_desc: 'Sick Leave',
 *   opening_bal: 10,
 *   no_days_credited: 1,
 *   closing_bal: 8,
 *   closing_bal_as_on: '01/06/2026',
 * };
 * ```
 */

export interface ILeaveDetails extends LeaveListItem {
  type: LeaveTypeCode;
  closing_bal: number | null;
  closing_bal_as_on: string | null;
  leave_reason_cd: number;
  no_days_credited: number;
  opening_bal: number | null;
  order_no: string;
  reason_for_rejection: string | null;
  remarks: string;
}
