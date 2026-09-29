import * as Print from 'expo-print';
import { generateSalaryStatementHtml } from './generate-salary-statement-html';
import { previewBase64PDF } from '@utils/helpers/preview-pdf';
import { SalaryStatement } from '@sharedTypes/satatement';

export interface SalaryStatementWithIdentity extends SalaryStatement {
  /** Full name of the employee this statement belongs to. */
  employeeName?: string;
  /** Employee's designation / post. */
  designation?: string;
  /** Department, office or directorate the employee belongs to. */
  department?: string;
  /** Internal employee / pay code, if distinct from the GPF number. */
  employeeCode?: string;
  /** PAN (Permanent Account Number). */
  panNumber?: string;
  /** Pay period this statement covers, e.g. "July 2026". */
  payPeriod?: string;
}

export async function previewSalaryStatementPdf(statement: SalaryStatementWithIdentity) {
  const html = generateSalaryStatementHtml(statement);

  // Generate PDF
  const { uri, base64 } = await Print.printToFileAsync({
    html,
    base64: true,
  });

  if (!uri || !base64) {
    return;
  }

  const name = Date.now().toString();
  previewBase64PDF(base64, name);
}
