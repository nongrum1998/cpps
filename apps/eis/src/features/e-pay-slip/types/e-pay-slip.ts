export type EPayslipListItem = {
  designation: string;
  ge_number: string;
  name: string;
  sign_date: string;
  payslip_no: string;
};

export interface EPayslip extends EPayslipListItem {
  file_data: string;
  file_id: string;
  payslip_date: string;
  valid_from: string;
  valid_to: string | null;
  pdf: string;
}
