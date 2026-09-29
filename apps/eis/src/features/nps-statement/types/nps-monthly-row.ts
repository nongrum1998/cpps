/** One row of the NPS monthly contribution table (zipped from NPSAnnux5 parallel arrays). */
export type NPSMonthlyRow = {
  fin_mmyyy: string;
  basic: string;
  da: string;
  empamt: number;
  govt_amt: number;
  total: number;
  c_type: string;
};
