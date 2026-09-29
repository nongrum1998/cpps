/**
 * Common validation regex patterns.
 *
 * @module regex
 */

/** Matches strings containing only digits (empty string also matches). */
export const ONLY_NUMBER_REGEX = /^[0-9]*$/;

/** Matches strings containing only ASCII letters (empty string also matches). */
export const ONLY_LETTER_REGEX = /^[a-zA-Z]*$/;

/** Matches strings containing only ASCII letters and digits (empty string also matches). */
export const ONLY_LETTER_AND_NUMBER = /^[a-zA-Z0-9]*$/;
/** Matches any string that contains at least one special character. */
export const SPECIAL_CHARACTER_REGEX = /[!@#$%^&*(),.?":{}|<>_\-\\[\]`~+=;/]/;

/** Matches any string that contains a lowercase ASCII letter. */
export const LOWERCASE_LETTER_REGEX = /[a-z]/;

/** Matches any string that contains an uppercase ASCII letter. */
export const UPPERCASE_LETTER_REGEX = /[A-Z]/;

/** Matches any string that contains a digit. */
export const NUMBER_REGEX = /\d/;

/**
 * Matches a date string in `dd-mm-yyyy` format.
 *
 * Validates day (01-31), month (01-12), and a 4-digit year.
 * Does not validate calendar correctness (e.g., Feb 30 would pass).
 */
export const DATE_DD_MM_YYYY_REGEX = /^(0[1-9]|[12]\d|3[01])-(0[1-9]|1[0-2])-\d{4}$/;

/**
 * Matches a date string in `yyyy-mm-dd` format.
 *
 * Validates a 4-digit year, month (01-12), and day (01-31).
 * Does not validate calendar correctness (e.g., Feb 30 would pass).
 */
export const DATE_YYYY_MM_DD_REGEX = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;
