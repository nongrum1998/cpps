import type { NPSMonthlyColumn } from '../../types';

/** Column definitions for the NPS monthly contribution table. */
export const NPS_MONTHLY_COLUMNS: NPSMonthlyColumn[] = [
  { key: 'fin_mmyyy', label: 'Financial Month', minWidth: 120 },
  { key: 'basic', label: 'Basic', minWidth: 90 },
  { key: 'da', label: 'DA', minWidth: 90 },
  { key: 'empamt', label: 'Employee', minWidth: 100 },
  { key: 'govt_amt', label: 'Government', minWidth: 110 },
  { key: 'total', label: 'Total', minWidth: 100, emphasis: true },
  { key: 'c_type', label: 'Type', minWidth: 70 },
];
