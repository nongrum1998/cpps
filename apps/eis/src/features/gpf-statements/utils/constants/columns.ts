import type { GPFMonthlyColumn, GPFSummaryColumn } from '../../types';

/**
 * Column definitions for the GPF summary table.
 *
 * The `Total` column is emphasised so it stands out from the other rows.
 */
export const SUMMARY_COLUMNS: GPFSummaryColumn[] = [
  { key: 'summary', label: 'Summary', minWidth: 130 },
  { key: 'balanceI', label: 'Balance I', minWidth: 130 },
  { key: 'balanceII', label: 'Balance II', minWidth: 130 },
  { key: 'total', label: 'Total', minWidth: 130, emphasis: true },
  { key: 'missingCredits', label: 'Missing Credits', minWidth: 130 },
];

/**
 * Column definitions for the monthly GPF data table.
 *
 * The `Total` column is emphasised so it stands out from the other rows.
 */
export const MONTHLY_COLUMNS: GPFMonthlyColumn[] = [
  { key: 'month', label: 'Month', minWidth: 100 },
  { key: 'subscription', label: 'Subscription', minWidth: 100 },
  { key: 'refund', label: 'Refund', minWidth: 100 },
  { key: 'other', label: 'Other', minWidth: 80 },
  { key: 'category', label: 'Category', minWidth: 100 },
  { key: 'total', label: 'Total', minWidth: 100, emphasis: true },
  { key: 'debit', label: 'Debit', minWidth: 100 },
  { key: 'type', label: 'Type', minWidth: 100 },
];
