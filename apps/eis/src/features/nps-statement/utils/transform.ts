import { transformData } from '@utils/helpers';
import type { NPSAnnux5, NPSMonthlyRow } from '../types';

/**
 * Zips the parallel monthly arrays of an NPS Annexure-5 statement into rows.
 *
 * Each array index corresponds to one month (fin_mmyyy, basic, da, empamt,
 * govt_amt, total, c_type). Missing cells fall back to '-' or 0. Each row is
 * augmented with a unique `id` via {@link transformData} for list rendering.
 *
 * @param data - The raw NPS statement payload.
 * @returns Monthly rows with stable ids, or [] when no monthly data exists.
 */
export function buildMonthlyRows(data: NPSAnnux5): (NPSMonthlyRow & { id: string })[] {
  const rows: NPSMonthlyRow[] = (data.fin_mmyyy ?? []).map((month, index) => ({
    fin_mmyyy: month,
    basic: data.basic?.[index] ?? '-',
    da: data.da?.[index] ?? '-',
    empamt: data.empamt?.[index] ?? 0,
    govt_amt: data.govt_amt?.[index] ?? 0,
    total: data.total?.[index] ?? 0,
    c_type: data.c_type?.[index] ?? '-',
  }));
  return transformData<NPSMonthlyRow>(rows);
}

/**
 * Builds label/value summary rows from the scalar fields of an NPS statement.
 *
 * @param data - The raw NPS statement payload.
 * @returns Summary rows in display order.
 */
export function buildSummaryRows(data: NPSAnnux5): { label: string; value: string }[] {
  return [
    { label: 'Opening Balance', value: data.opening_bal },
    { label: 'Total Employee Contribution', value: String(data.tot_ampamt) },
    { label: 'Total Govt. Contribution', value: String(data.tot_gvtamt) },
    { label: 'Total Tier-I Amount', value: String(data.tot_tier1amt) },
    { label: 'Closing Balance', value: data.closing_bal },
    { label: 'Deposit', value: data.deposit },
  ];
}
