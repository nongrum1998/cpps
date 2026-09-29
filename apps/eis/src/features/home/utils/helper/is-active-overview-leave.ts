import { formatDate } from '@utils/formatters';
import type { HomeLeaveT } from '../../types/home';

/**
 * Parses a leave date string returned by the overview endpoint into a local Date.
 *
 * Accepts both `YYYY-MM-DD` (machine format) and `DD/MM/YYYY` (display format).
 * Returns `null` when the string is empty or cannot be parsed.
 *
 * @param value - The date string from `HomeLeaveT` (`from_dt` / `to_dt`).
 * @returns A local-midnight `Date`, or `null` if unparseable.
 */
function parseHomeDate(value: string): Date | null {
  if (!value) return null;

  const iso = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (iso) {
    const [, year, month, day] = iso;
    const date = new Date(Number(year), Number(month) - 1, Number(day));
    return Number.isNaN(date.getTime()) ? null : date;
  }

  const display = /^(\d{2})\/(\d{2})\/(\d{4})/.exec(value);
  if (display) {
    const [, day, month, year] = display;
    const date = new Date(Number(year), Number(month) - 1, Number(day));
    return Number.isNaN(date.getTime()) ? null : date;
  }

  return null;
}

/**
 * Determines whether an overview leave record belongs in the "Active
 * Applications" section (rather than "Recent History").
 *
 * A leave is considered active when:
 * 1. It has **not** been rejected (`Rejected` leaves always go to history).
 * 2. Its end date (`to_dt`) is today or later (in progress or upcoming).
 *
 * When `to_dt` cannot be parsed the record is treated as **not active** so it
 * renders in history instead of being hidden from both sections.
 *
 * @param leave - The overview leave record (`HomeLeaveT`).
 * @returns `true` for the active card, `false` for history.
 *
 * @example
 * ```ts
 * isActiveOverviewLeave({ verify_flg_desc: 'Pending', to_dt: '03/06/2026', ... });
 * // => true when today <= 2026-06-03
 * ```
 */
export function isActiveOverviewLeave(leave: HomeLeaveT): boolean {
  if (leave.verify_flg_desc === 'Rejected') return false;

  const endDate = parseHomeDate(leave.to_dt);
  if (!endDate) return false;

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return endDate >= todayStart;
}

/**
 * Formats an overview leave or notification date string for display.
 *
 * Parses the raw value as either `YYYY-MM-DD` (machine) or `DD/MM/YYYY`
 * (display) and renders it via the shared `formatDate` formatter. This avoids
 * `formatDate`'s raw `new Date(value)` behaviour, which misreads `DD/MM/YYYY`
 * as US `MM/DD/YYYY`. Falls back to the raw string when unparseable.
 *
 * @param value - The raw date string from the overview endpoint.
 * @returns A human-readable date string, or the raw input unchanged.
 *
 * @example
 * ```ts
 * formatHomeDate('03/06/2026') // "June 03, 2026"
 * formatHomeDate('2026-06-03') // "June 03, 2026"
 * ```
 */
export function formatHomeDate(value: string): string {
  const date = parseHomeDate(value);
  return date ? formatDate(date) : value;
}
