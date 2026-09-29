/**
 * Represents the verification status of a leave request.
 *
 * - `Verified` — Approved by the approver.
 * - `Pending` — Awaiting approval decision.
 * - `Rejected` — Denied by the approver.
 * - `Entry` — Saved as a draft, not yet submitted for approval.
 */
export type LeaveStatusI = 'Verified' | 'Pending' | 'Rejected' | 'Entry';

/**
 * Three-letter codes identifying each leave type available in the system.
 *
 * Examples: `SL` (Sick Leave), `PL` (Personal Leave), `EL`
 * (Earned Leave), `ML` (Maternity Leave), `HPL` (Half Pay Leave).
 */
export type LeaveTypeCode =
  | 'COM'
  | 'LND'
  | 'EOL'
  | 'LPA'
  | 'EL'
  | 'HPL'
  | 'ML'
  | 'SL'
  | 'WPL'
  | 'PL';

/**
 * Represents a single leave request record returned from the backend API.
 *
 * Each entry includes the leave type, date range, reason, and
 * verification status. Date fields are provided in two formats:
 * `DD/MM/YYYY` (display) and `YYYY-MM-DD` (machine / sorting).
 *
 * @example
 * ```ts
 * const item: LeaveListItem = {
 *   from_dt: '01/06/2026',
 *   from_dt1: '2026-06-01',
 *   leave_cd: 'SL',
 *   leave_desc: 'Sick Leave',
 *   no_days: '3',
 *   order_dt: '25/05/2026',
 *   order_dt1: '2026-05-25',
 *   reason_for_leave: 'Medical appointment',
 *   to_dt: '03/06/2026',
 *   to_dt1: '2026-06-03',
 *   verify_flg_desc: 'Approved',
 * };
 * ```
 */
export interface LeaveListItem {
  /** Three-letter leave type code (e.g. `SL`, `EL`). */
  leave_cd: LeaveTypeCode;
  /** Leave order date in `DD/MM/YYYY` format. */
  order_dt: string;
  /** Free-text reason provided by the employee. */
  reason_for_leave: string;
  /** Verification / approval status label. */
  verify_flg_desc: LeaveStatusI;
  /** Leave start date in `DD/MM/YYYY` display format. */
  from_dt: string;
  /** Leave end date in `DD/MM/YYYY` display format. */
  to_dt: string;
  /** Number of leave days as a string (e.g. `"3"`). */
  no_days: string;
  /** Human-readable leave type description. */
  leave_desc: string;
  /** Leave order date in `YYYY-MM-DD` machine format. */
  order_dt1: string;
  /** Leave start date in `YYYY-MM-DD` machine format. */
  from_dt1: string;
  /** Leave end date in `YYYY-MM-DD` machine format. */
  to_dt1: string;
}
