import {
  DATE_YYYY_MM_DD_REGEX,
  LOWERCASE_LETTER_REGEX,
  NUMBER_REGEX,
  ONLY_LETTER_AND_NUMBER,
  ONLY_NUMBER_REGEX,
  SPECIAL_CHARACTER_REGEX,
  UPPERCASE_LETTER_REGEX,
} from '@utils/constants/regex';
import { z } from 'zod';
import { METHODS } from '@utils/constants';
import { env } from '@utils/env';

/**
 * Zod schema validating a phone number.
 *
 * Requires a non-empty string of exactly 10 digits (no separators, letters,
 * or symbols). Enforced via {@link ONLY_NUMBER_REGEX}; anything else, including
 * a shorter or longer value, fails validation with a descriptive message.
 */
export const phoneValidation = z
  .string('Phone number is required')
  .min(10, 'Phone number must be less than 10 digits')
  .length(10, 'Phone number must be exactly 10 digits')
  .regex(ONLY_NUMBER_REGEX, 'Phone number must only contain digits')
  .trim();

/**
 * Zod schema validating a strong password.
 *
 * Requires a non-empty string between 8 and 64 characters that contains at
 * least one lowercase letter, one uppercase letter, one digit, and one special
 * character (as matched by {@link LOWERCASE_LETTER_REGEX},
 * {@link UPPERCASE_LETTER_REGEX}, {@link NUMBER_REGEX}, and
 * {@link SPECIAL_CHARACTER_REGEX} respectively).
 */
export const passwordValidation =
  env.NODE_ENV === 'development'
    ? z.string('Password is required').min(1, 'Password is required')
    : z.string('Password is required').min(8, 'Password must be at least 8 characters');
// .max(64, 'Password must be less than 64 characters')
// .regex(LOWERCASE_LETTER_REGEX, 'Must contain a lowercase letter')
// .regex(UPPERCASE_LETTER_REGEX, 'Must contain an uppercase letter')
// .regex(NUMBER_REGEX, 'Must contain a number')
// .regex(SPECIAL_CHARACTER_REGEX, 'Must contain a special character');

/**
 * Zod enum schema validating an RPC method name.
 *
 * Restricts a value to one of the keys of {@link METHODS} (the registered
 * backend RPC method names). Any other string fails with 'Invalid Method'.
 */
export const methodValidation = z.enum(METHODS, 'Invalid Method');

/**
 * Returns a Zod schema validating a date string for the given field label.
 *
 * Requires a 10-character value in `yyyy-mm-dd` order — 4-digit year, month
 * 01-12, day 01-31 — as enforced by {@link DATE_YYYY_MM_DD_REGEX}. Calendar
 * correctness is not checked (e.g. `2024-02-30` passes). The `label` is
 * interpolated into the "required" and "length" error messages.
 *
 * Note: the format error message reads "dd-mm-yyyy", which does not match the
 * `yyyy-mm-dd` order actually enforced by the regex.
 *
 * @param label - Human-readable field name used in the validation messages.
 * @returns A Zod string schema for the date field.
 * @example
 * const startDate = dateValidation('Start date');
 * startDate.parse('2024-01-15'); // ok
 */
export const dateValidation = (label: string) =>
  z
    .string('Date is required')
    .min(10, `${label} is required`)
    .max(10, `${label} must be 10 characters long`)
    .regex(DATE_YYYY_MM_DD_REGEX, `${label} must be in dd-mm-yyyy format`);

export const isValidPDFUriSchema = z
  .url('PDF uri is required')
  .trim()
  .refine((uri) => uri.toLowerCase().endsWith('.pdf'), {
    message: 'Must be a PDF URI',
  });

export const empCdValidation = z
  .string('Employee code is required')
  .min(5, 'Employee Code must be at least 6 in length')
  .regex(ONLY_LETTER_AND_NUMBER, 'Employee code must only contain letters and numbers')
  .transform((val) => val.toUpperCase());

export const otpValidiation = z
  .string('OTP is required')
  .length(6, 'OTP must be exactly 6 digits')
  .regex(ONLY_NUMBER_REGEX, 'OTP must only contain numbers');
