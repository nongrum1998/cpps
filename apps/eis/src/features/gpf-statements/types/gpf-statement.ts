export type GPFEmployeeInfo = {
  treasury: string;
  ddo: string;
  dob: string;
  interest_rate: string;
};

export type GPFMonthlyData = {
  month: string;
  subscription: string;
  refund: string;
  other: string;
  category: string;
  total: string;
  debit: string;
  type: string;
};

export type GPFSummary = {
  summary: string;
  balanceI: string;
  balanceII: string;
  total: string;
  missingCredits: string;
};

export type GPFStatement = {
  monthly_data: GPFMonthlyData[];
  summary: GPFSummary[];
  emp: GPFEmployeeInfo;
};
