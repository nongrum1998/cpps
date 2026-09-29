import { MonthT } from '../../types/common';

const thisYear = new Date().getFullYear();

/**
 * Array of the last 100 years as strings, starting from the current year
 * and descending. Useful for date pickers, filter dropdowns, etc.
 */
export const years = Array.from({ length: 4 }, (_, i) => String(thisYear - i));

/**
 * Ordered list of all twelve month names in uppercase.
 * Used for month selectors and date formatting.
 */
export const months: MonthT[] = [
  'JANUARY',
  'FEBRUARY',
  'MARCH',
  'APRIL',
  'MAY',
  'JUNE',
  'JULY',
  'AUGUST',
  'SEPTEMBER',
  'OCTOBER',
  'NOVEMBER',
  'DECEMBER',
];
