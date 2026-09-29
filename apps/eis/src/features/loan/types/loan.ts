export type LoanStatusT = 'Close' | 'Open';

export type RecoveryOfT = 'Principal' | 'Interest';

export type LoanT = {
  amt_dis: string;
  loan_desc: string;
  loan_id: string;
  recovery_of: RecoveryOfT;
  recovery_status: LoanStatusT;
};

export interface LoanItemI extends Omit<LoanT, 'loan_id'> {
  int_balance: string;
  int_inst_amt: string;
  int_lst_inst_rec: string;
}
