/**
 * Registry of backend RPC method names.
 *
 * Maps human-readable keys to the string identifiers expected by the backend
 * `/make_request` endpoint.
 */
export const METHODS = {
  GET_EMP_DETAILS: 'get_employee_details',
  EMP_LOGIN: 'employee_login',
  GET_EMP_LEAVES: 'get_employee_leaves',
  GET_EMP_LEAVE_DETAILS: 'get_employee_leave_details',
  GET_LEAVE_TYPE: 'get_leave_type',
  GET_LEAVE_REASON: 'get_leave_reason',
  INSERT_UPDATE_LEAVE: 'insert_update_leave',
  GET_NOTIFICATIONS: 'get_notifications',
  GET_SALARY_STATEMENTS: 'get_salary_statement',
  GET_SALARY_YEARS: 'get_sal_years',
  INSERT_GE_NUMBER: 'insert_ge_no',
  GET_EMP_LOAN: 'get_employee_loan',
  GET_EMP_LOAN_DETAILS: 'get_employee_loan_details',
  GET_EMP_OVERVIEW: 'get_employee_overview',
  GET_E_PAY_SLIP: 'get_epay_slip_data',
  GET_E_PAY_SLIP_DETAIL: 'get_epay_slip_details', // ge_number payslip_no
  GET_GPF_FINANCIAL_YEAR: 'get_financial_year',
  GET_GPF_STATEMENT: 'view_statement',
  INSERT_NOTIFICATION_TOKEN: 'insert_notification_token',
  GET_NPS_ANNEX5: 'get_annex5',
  GET_NPS_FINANCIAL_YEAR: 'get_nps_fin_year',

  // Not implemented below
  GET_EMP_TAX_LIST: 'get_employee_tax_list',
  GET_EMP_TAX_DETAIL: 'get_employee_tax_detail',
  UPDATE_EMP_TAX_DETAIL: 'update_employee_tax_detail',
} as const;

/**
 * Union type of all available RPC method keys.
 */
// eslint-disable-next-line @typescript-eslint/no-redeclare
export type METHODS = keyof typeof METHODS;
