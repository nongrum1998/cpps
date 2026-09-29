/** Extracts up to 3 initials from first, middle, and last name. */
export const getInitials = (fname?: string, mname?: string, lname?: string): string =>
  [fname, mname, lname]
    .filter(Boolean)
    .map((n) => n!.charAt(0).toUpperCase())
    .join('');

/** Builds a full name from first, middle, and last name parts, trimming whitespace. */
export const getFullName = (fname?: string, mname?: string, lname?: string): string =>
  [fname, mname, lname].filter(Boolean).join(' ');
