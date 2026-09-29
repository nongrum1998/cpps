export type TaxRegime = 'NEW' | 'OLD';

export type FilingStatus = 'NOT_FILED' | 'FILED' | 'PROCESSED';

export type TaxSlabBreakdown = {
  label: string;
  minIncome: number;
  maxIncome: number | null;
  rate: number;
  taxableAmount: number;
  taxAtSlab: number;
};

export type EmployeeTaxDetail = {
  id: string;
  employeeId: string;
  financialYear: string;
  employeeName: string;
  designation: string;
  panNumber: string;
  department: string;
  grossAnnualIncome: number;
  standardDeduction: number;
  taxableIncome: number;
  regime: TaxRegime;
  slabBreakdown: TaxSlabBreakdown[];
  baseTax: number;
  rebate87A: number;
  surcharge: number;
  cess: number;
  totalTax: number;
  effectiveTaxRate: number;
  tdsDeducted: number;
  taxPaid: number;
  taxPayable: number;
  deductions80C: number;
  deductions80D: number;
  hraExemption: number;
  ltaExemption: number;
  homeLoanInterest: number;
  npsContribution: number;
  filingStatus: FilingStatus;
  filedDate: string | null;
  createdAt: string;
  updatedAt: string;
};

export type EmployeeTaxSummary = {
  employeeId: string;
  employeeName: string;
  designation: string;
  panNumber: string;
  grossAnnualIncome: number;
  totalTax: number;
  financialYear: string;
  regime: TaxRegime;
  filingStatus: FilingStatus;
};

export type UpdateTaxPayload = {
  regime: TaxRegime;
  deductions80C: number;
  deductions80D: number;
  hraExemption: number;
  ltaExemption: number;
  homeLoanInterest: number;
  npsContribution: number;
};
