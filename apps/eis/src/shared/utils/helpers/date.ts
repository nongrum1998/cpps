import { parseYYYYMMDD } from '@utils/formatters/formatters';

/**
 * Formats raw digit input into a `yyyy-mm-dd` mask as the user types.
 *
 * Strips all non-digit characters from the input, then groups the digits
 * into year (4), month (2), and day (2) segments joined by dashes.
 * Partial input produces a partial mask — no trailing dashes are added
 * when a segment is incomplete (e.g. `"2025"` → `"2025"`,
 * `"20250"` → `"2025-0"`).
 *
 * Designed to be used as an `onChangeText` handler for date inputs so
 * the user never has to type the dash manually.
 *
 * @param input - The raw text from the input (digits + any typed dashes).
 * @returns The formatted `yyyy-mm-dd` string (partial or complete), or
 *          an empty string when `input` is empty.
 *
 * @example
 * ```ts
 * formatDateInput('20250122')  // "2025-01-22"
 * formatDateInput('2025')      // "2025"
 * formatDateInput('20250')     // "2025-0"
 * formatDateInput('')          // ""
 * ```
 */
export function formatDateInput(input: string): string {
  const digits = input.replace(/\D/g, '').slice(0, 8);
  if (!digits) return '';

  const parts: string[] = [];
  parts.push(digits.slice(0, 4)); // yyyy — always show year digits as typed
  if (digits.length > 4) parts.push(digits.slice(4, 6)); // mm
  if (digits.length > 6) parts.push(digits.slice(6, 8)); // dd

  return parts.join('-');
}

/**
 * Calculates the inclusive number of days between two `yyyy-mm-dd` date strings.
 *
 * Returns `null` when either date is empty, unparseable, or when `toDate` is
 * chronologically before `fromDate` (resulting in a non-positive day count).
 *
 * @param fromDate - Start date in `yyyy-mm-dd` format.
 * @param toDate   - End date in `yyyy-mm-dd` format.
 * @returns The inclusive day count as a string (e.g. `"3"`), or `null` if the
 *          inputs are invalid or `toDate` is before `fromDate`.
 *
 * @example
 * ```ts
 * calculateDaysBetweenDates('2025-01-01', '2025-01-03') // "3"
 * calculateDaysBetweenDates('', '2025-01-03')           // null
 * ```
 */
export function calculateDaysBetweenDates(fromDate: string, toDate: string): string | null {
  if (!fromDate || !toDate) return null;

  const from = parseYYYYMMDD(fromDate);
  const to = parseYYYYMMDD(toDate);
  if (!from || !to) return null;

  const diffMs = to.getTime() - from.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24)) + 1; // inclusive

  if (diffDays < 1) return null;
  return String(diffDays);
}

/**
 * Calculates the number of weekdays (Monday–Friday) between two `yyyy-mm-dd`
 * date strings, excluding weekends (Saturday and Sunday).
 *
 * Returns `null` when either date is empty, unparseable, or when `toDate` is
 * chronologically before `fromDate`.
 *
 * @param fromDate - Start date in `yyyy-mm-dd` format.
 * @param toDate   - End date in `yyyy-mm-dd` format.
 * @returns The weekday count as a string (e.g. `"3"`), or `null` if the
 *          inputs are invalid or `toDate` is before `fromDate`.
 *
 * @example
 * ```ts
 * // Fri 2025-01-03 to Sun 2025-01-05 → only Fri counted
 * calculateDaysBetweenDatesWithoutWeekends('2025-01-03', '2025-01-05') // "1"
 *
 * // Mon 2025-01-06 to Fri 2025-01-10 → full work week
 * calculateDaysBetweenDatesWithoutWeekends('2025-01-06', '2025-01-10') // "5"
 * ```
 */
export function calculateDaysBetweenDatesWithoutWeekends(
  fromDate: string,
  toDate: string
): string | null {
  if (!fromDate || !toDate) return null;

  const from = parseYYYYMMDD(fromDate);
  const to = parseYYYYMMDD(toDate);
  if (!from || !to) return null;

  if (to.getTime() < from.getTime()) return null;

  let count = 0;
  const current = new Date(from);
  while (current <= to) {
    const day = current.getDay(); // 0 = Sunday, 6 = Saturday
    if (day !== 0 && day !== 6) {
      count++;
    }
    current.setDate(current.getDate() + 1);
  }

  if (count < 1) return null;
  return String(count);
}

export const MONTHS = {
  JANUARY: 1,
  FEBRUARY: 2,
  MARCH: 3,
  APRIL: 4,
  MAY: 5,
  JUNE: 6,
  JULY: 7,
  AUGUST: 8,
  SEPTEMBER: 9,
  OCTOBER: 10,
  NOVEMBER: 11,
  DECEMBER: 12,
} as const;

export const getMonthNumber = (month: string): number => {
  return MONTHS[month.toUpperCase() as keyof typeof MONTHS];
};

export const getCurrentMonth = (): string => new Date().toLocaleString('en-US', { month: 'long' });

export const getPreviousMonth = (): string => {
  const date = new Date();
  date.setMonth(date.getMonth() - 1);
  return date.toLocaleString('en-US', { month: 'long' });
};
export const getCurrentYear = (): number => new Date().getFullYear();
