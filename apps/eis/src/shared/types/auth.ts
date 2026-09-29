export type RoleT = 'SUPER_ADMIN' | 'ADMIN' | 'USER';

export type EmployeeTypeT = 'DC' | 'DB';

export type UserT = {
  basic_pay: string;
  current_gis_group: string;
  ddo_code: string;
  ddo_name: string;
  emp_bank_account_no: string;
  emp_bank_ifsc: string;
  emp_birth_dt: string;
  emp_city_class: string;
  emp_date_of_joining: string;
  emp_dept: string;
  emp_designation: string;
  emp_email: string;
  emp_fname: string;
  emp_lname: string;
  emp_mname: string;
  emp_pan_number: string;
  emp_phone: string;
  emp_sex: string;
  emp_status: string;
  emp_supan_dt: string;
  emp_type: EmployeeTypeT;
  emp_gazetted: 'Y' | 'N';
  gis_applicable: string;
  ge_no: string;
  inc_dt: string;
  ppan: string | null;

  office_id: string;
  office_name: string;
  parent_dept: string;
  pay_comm: string;
  pay_scale: string;

  pf_agency: string;
  pf_series: string;
  pf_type: string;
  pf_no: string;
  pf_pran_no: string;

  state_service: string;
  trea_code: string;
  wef_dt: string;
};
