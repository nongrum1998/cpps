/**
 * Returns Tailwind CSS classes and Ionicons icon data for a given status label.
 *
 * **Success** (green): `'Verified'`, `'PAID'`, `'PROCESSED'`
 * **Pending** (amber): `'Pending'`, `'Entry'`, `'PENDING'`, `'HELD'`, `'NOT_FILED'`
 * **Filed** (blue): `'FILED'`
 * **Failure** (red): `'Rejected'`, `'FAILED'`
 * Unknown statuses fall back to neutral gray.
 *
 * @param status - The status label string (case-sensitive).
 * @returns An object containing background/text class names, icon colour, and icon name.
 */
export const getStatusColor = (
  status: string
): {
  bg: string;
  text: string;
  border: string;
} => {
  switch (status) {
    // Leave: Verified
    case 'Verified':
    // Salary: Paid / Processed
    case 'Open':
    case 'PAID':
    case 'PROCESSED':
      return {
        bg: 'bg-green-100 dark:bg-green-900/30',
        text: 'text-green-800 dark:text-green-400',
        border: 'border-green-800 dark:border-green-400',
      };

    // Leave: Pending / Entry (draft)
    case 'Pending':
    case 'Entry':
    // Salary: Pending / Held
    case 'PENDING':
    case 'HELD':
    // Tax: Not Filed
    case 'NOT_FILED':
      return {
        bg: 'bg-amber-100',
        text: 'text-amber-500',
        border: 'border-amber-500',
      };

    // Tax: Filed (info stage, not success)
    case 'FILED':
      return {
        bg: 'bg-blue-100 dark:bg-blue-900/30',
        text: 'text-blue-800 dark:text-blue-400',
        border: 'border-blue-800 dark:border-blue-400',
      };

    // Leave: Rejected
    case 'Rejected':
    case 'Close':
    // Salary: Failed
    case 'FAILED':
      return {
        bg: 'bg-red-100 dark:bg-red-900/30',
        text: 'text-red-800 dark:text-red-400',
        border: 'border-red-800 dark:border-red-400',
      };

    default:
      return {
        bg: 'bg-gray-100 dark:bg-gray-800',
        text: 'text-gray-800 dark:text-gray-400',
        border: 'border-gray-800 dark:border-gray-400',
      };
  }
};
