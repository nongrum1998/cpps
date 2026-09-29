type SalaryItem = {
  pname: string;
  amount: string;
};

export type SalaryStatement = {
  gpf_desc: string;
  gpf_no: string;
  bank_no: string;
  voucher_no: string;
  voucher_date: string; // Format: DD/MM/YYYY
  s_data: SalaryItem[];
  totalEmolument: number;
  totalPayItem: number;
  totalng: number;
  grade_pay: string;
  pay_in_pb: string;
  net_pay: number;
  net_pay_in_word: string;
};
