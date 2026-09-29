import { SalaryStatement } from '@sharedTypes/satatement';
import { salaryStatementCss } from './salary-statement-css';

/**
 * Optional identity and pay-period fields that a fuller statement payload
 * may provide. These are not (yet) part of the shared `SalaryStatement`
 * type, so they are declared here as an additive, all-optional extension —
 * every field is rendered conditionally, so passing a plain `SalaryStatement`
 * without them is still valid and changes nothing visually. If/when the
 * shared type is updated to include them, this local interface can be
 * removed and `SalaryStatement` used directly.
 */
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

type SalaryStatementItem = SalaryStatement['s_data'][number];

/**
 * Escapes a string for safe interpolation into HTML content. Replaces the
 * characters `&`, `<`, `>`, `"` and `'` with their corresponding HTML
 * entities so that data (description text, GPF details, bank numbers, etc.)
 * can never break the document structure or inject markup.
 *
 * @param value - The raw string to escape.
 * @returns The escaped string, safe to embed inside HTML text or attributes.
 */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Formats a numeric value (string or number) as an Indian-grouped currency
 * amount with two decimal places (e.g. 1234567.5 -> "12,34,567.50"), which
 * is the digit-grouping convention used on Indian financial and treasury
 * documents. Falls back to "0.00" when the input is empty, null or not a
 * finite number.
 *
 * @param value - The amount to format.
 * @returns The amount formatted with Indian digit grouping and two decimals.
 */
function formatCurrency(value: string | number): string {
  const numeric = typeof value === 'number' ? value : parseFloat(value);
  const safe = Number.isFinite(numeric) ? numeric : 0;
  return safe.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Formats the statement's generation timestamp in a readable Indian
 * locale format (e.g. "31 Jul 2026, 10:32 am"). Falls back to an ISO
 * string if locale formatting is unavailable in the runtime.
 *
 * @param date - The moment to format. Defaults to the current time.
 * @returns A human-readable, locale-formatted timestamp string.
 */
function formatGeneratedTimestamp(date: Date = new Date()): string {
  try {
    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return date.toISOString();
  }
}

/**
 * Generic placeholder seal SVG for the letterhead. Uses blue-800 (#1e40af)
 * and red-800 (#991b1b) to match the Tailwind colour palette available in
 * the pre-compiled CSS. Swap the contents for an `<img>` of the approved
 * letterhead crest when a digital asset becomes available.
 */
const OFFICIAL_SEAL_SVG = ` 
<svg width="60" height="60" viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="presentation">
  <circle cx="25" cy="25" r="23" fill="none" stroke="#1e40af" stroke-width="1.6" />
  <circle cx="25" cy="25" r="18.5" fill="none" stroke="#991b1b" stroke-width="1" stroke-dasharray="2,1.6" />
<text
  x="25"
  y="25"
  text-anchor="middle"
  dominant-baseline="middle"
  font-family="Arial, sans-serif"
  font-size="3.8"
  letter-spacing="0.6"
  fill="#991b1b"
>MeghEis</text>
</svg> 
`;

/**
 * Splits salary line items into earnings (positive amounts) and deductions
 * (negative amounts) so they can be rendered in separate tables matching
 * the two-section government salary statement layout.
 *
 * @param items - The line items from `statement.s_data`.
 * @returns An object with `earnings` and `deductions` arrays.
 */
function splitEarningsAndDeductions(items: SalaryStatementItem[]): {
  earnings: SalaryStatementItem[];
  deductions: SalaryStatementItem[];
} {
  const earnings: SalaryStatementItem[] = [];
  const deductions: SalaryStatementItem[] = [];

  for (const item of items) {
    const amount = parseFloat(item.amount);
    if (Number.isFinite(amount) && amount < 0) {
      deductions.push(item);
    } else {
      earnings.push(item);
    }
  }

  return { earnings, deductions };
}

/**
 * Builds itemised table rows for a salary section (Gross Earning or
 * Deduction). Uses alternating row backgrounds via Tailwind classes
 * available in the pre-compiled CSS (bg-white / bg-gray-100).
 *
 * @param items - The line items to render.
 * @returns HTML `<tr>` markup for each item, joined with newlines.
 */
function buildSectionRows(items: SalaryStatementItem[]): string {
  return items
    .map(
      (item, index) =>
        `        <tr class="${index % 2 === 0 ? 'bg-white' : 'bg-gray-100'}">
          <td class="border border-gray-300 p-1 text-center" style="padding:3px">${index + 1}</td>
          <td class="border border-gray-300 p-1" style="padding:3px">${escapeHtml(item.pname.replace('_', ' '))}</td>
          <td class="border border-gray-300 p-1 text-right tabular-nums" style="padding:3px">${formatCurrency(item.amount)}</td>
        </tr>`
    )
    .join('\n');
}

/**
 * Builds a complete salary section: section header, table with rows, and
 * a total row. Used for both the "Gross Earning" and "Deduction" sections.
 *
 * @param title - The section heading (e.g. "Gross Earning", "Deduction").
 * @param items - The line items to render in this section.
 * @param total - The pre-computed total for this section.
 * @returns HTML markup for the full section.
 */
function buildSalarySection(
  title: string,
  items: SalaryStatementItem[],
  total: string | number
): string {
  if (items.length === 0) {
    return '';
  }

  const rows = buildSectionRows(items);

  return `
    <div class="font-bold uppercase text-red-800 mt-4 mb-1" style="font-size:13px;letter-spacing:1.6px;border-bottom:1.5px solid #991b1b;padding-bottom:4px">
      ${escapeHtml(title)}
    </div>

    <table class="w-full border-collapse">
      <thead>
        <tr>
          <th class="border border-gray-300 px-2 py-1 bg-blue-600 text-white font-bold uppercase tracking-wider text-center" style="width:10%;font-size:12px">Sl.</th>
          <th class="border border-gray-300 px-2 py-1 bg-blue-600 text-white font-bold uppercase tracking-wider text-left" style="font-size:12px">Description</th>
          <th class="border border-gray-300 px-2 py-1 bg-blue-600 text-white font-bold uppercase tracking-wider text-right" style="width:26%;font-size:12px">Amount (₹)</th>
        </tr>
      </thead>
      <tbody>
${rows}
        <tr class="bg-gray-100">
          <td class="border border-gray-300 p-1 text-center" style="padding:3px"></td>
          <td class="border border-gray-300 p-1 text-base font-bold" style="padding:3px">Total</td>
          <td class="border border-gray-300 p-1 text-right font-bold text-base tabular-nums" style="padding:3px">${formatCurrency(total)}</td>
        </tr>
      </tbody>
    </table>`;
}

/**
 * Builds the optional employee-identity block shown beneath the masthead.
 * Renders nothing (an empty string) unless at least one identity field is
 * present on the statement, so this is fully backward compatible with
 * payloads that only carry the original `SalaryStatement` fields.
 *
 * @param statement - The statement, optionally carrying identity fields.
 * @returns HTML markup for the identity block, or an empty string.
 */
function buildIdentityBlock(statement: SalaryStatementWithIdentity): string {
  const { employeeName, designation, department, employeeCode, panNumber, payPeriod } = statement;

  const hasAnyIdentityField =
    employeeName || designation || department || employeeCode || panNumber || payPeriod;

  if (!hasAnyIdentityField) {
    return '';
  }

  const roleLine = [designation, department]
    .filter((part): part is string => Boolean(part))
    .map(escapeHtml)
    .join(' &middot; ');

  const chips = [
    employeeCode ? { label: 'Employee Code', value: employeeCode } : null,
    panNumber ? { label: 'PAN', value: panNumber } : null,
    payPeriod ? { label: 'Pay Period', value: payPeriod } : null,
  ]
    .filter((chip): chip is { label: string; value: string } => chip !== null)
    .map(
      (chip) =>
        `<div><span class="text-red-800 font-bold" style="margin-right:4px">${escapeHtml(chip.label)}</span>${escapeHtml(chip.value)}</div>`
    )
    .join('\n            ');

  return `
    <div class="border border-gray-300 bg-gray-100 p-1 mb-2" style="padding:6px">
      ${employeeName ? `<div class="font-bold text-blue-800" style="font-size:16px">${escapeHtml(employeeName)}</div>` : ''}
      ${roleLine ? `<div class="text-gray-700" style="font-size:13px;margin-top:2px">${roleLine}</div>` : ''}
      ${chips ? `<div class="mt-1 flex flex-wrap gap-4" style="font-size:13px">\n            ${chips}\n          </div>` : ''}
    </div>`;
}

interface WatermarkOptions {
  text?: string;
  rows?: number;
  columns?: number;
  fontSize?: string;
  color?: string;
  opacity?: number;
  rotation?: number;
}

function generateWatermark({
  text = 'GOVERNMENT OF MEGHALAYA',
  rows = 6,
  columns = 3,
  fontSize = '22px',
  color = '#1e40af',
  opacity = 0.08,
  rotation = -32,
}: WatermarkOptions = {}): string {
  const watermarks: string[] = [];

  for (let row = 0; row < rows; row++) {
    for (let column = 0; column < columns; column++) {
      const top = 8 + row * 18;
      const left = 17 + column * 35;

      watermarks.push(`
        <div
          class="
            absolute
            whitespace-nowrap
            pointer-events-none
            select-none
            font-serif
            font-bold
            tracking-widest
            text-blue-800
            z-50
          "
          style="
            top: ${top}%;
            left: ${left}%;
            transform: translate(-50%, -50%) rotate(${rotation}deg);
            font-size: ${fontSize};
            color: ${color};
            opacity: ${opacity};
          "
        >
          ${escapeHtml(text)}
        </div>
      `);
    }
  }

  return `
    <div
      class="
        absolute
        inset-0
        overflow-hidden
        pointer-events-none
        z-50
      "
      style="
        width: 100%;
        height: 100%;
      "
      aria-hidden="true"
    >
      ${watermarks.join('\n')}
    </div>
  `;
}

/**
 * Generates a complete, printable HTML salary statement document for the
 * given salary statement data. The returned HTML is self-contained — it
 * embeds the pre-compiled Tailwind CSS from `@shared/styles/tailwind.min.css`
 * and uses only utility classes available in that file. Suitable for
 * printing to PDF via `expo-print` or rendering in a WebView.
 *
 * Visual design follows Indian government treasury/payroll document
 * conventions: a gazette-style masthead with letterhead seal, a tricolour
 * accent bar, a faint security watermark, separate Gross Earning and
 * Deduction sections with totals, a highlighted net-pay card, the net
 * pay written out in words, and a signed footer.
 *
 * Tailwind colour mapping (design → available in pre-compiled CSS):
 * - blue-900 → blue-600 (bg) / blue-800 (text/border)
 * - red-900 → red-800
 * - slate-* → gray-*
 * - emerald-600 → green-600
 * - amber-500 → amber-500
 *
 * @param statement - The salary statement data to render. Accepts the
 * standard `SalaryStatement` shape; optional identity fields (employee
 * name, designation, department, employee code, PAN, pay period) are
 * rendered automatically when present.
 * @returns A full HTML document as a string.
 */
export function generateSalaryStatementHtml(statement: SalaryStatementWithIdentity): string {
  const { earnings, deductions } = splitEarningsAndDeductions(statement.s_data);
  const earningsHtml = buildSalarySection('Gross Earning', earnings, statement.totalEmolument);
  const deductionsHtml = buildSalarySection('Deduction', deductions, statement.totalPayItem);
  const identityBlockHtml = buildIdentityBlock({
    ...statement,
  });
  const generatedAt = formatGeneratedTimestamp();
  const waterMark = generateWatermark();

  const tricolorBar = `<table class="w-full border-collapse mb-2" role="presentation">
      <tr>
        <td class="h-1 p-0 border-none bg-amber-500" style="width:33.33%"></td>
        <td class="h-1 p-0 border-none bg-white" style="width:33.33%"></td>
        <td class="h-1 p-0 border-none bg-green-600" style="width:33.33%"></td>
      </tr>
    </table>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>NIC Salary Statement</title>
  <style>
    ${salaryStatementCss}

    @page {
      size: A4;
      margin:12mm;
    }

    body {
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
  </style>
</head>
<body class="m-0 p-0 bg-white text-gray-900 font-sans leading-relaxed" style="font-size:14px">

  <!-- Watermark -->
  ${waterMark}
  <!-- Main Container -->
  <div class="relative" style="z-index:1;padding:0; margin:0 auto">

    <!-- Top Tricolor Bar -->
    ${tricolorBar}

    <!-- Masthead Header -->
    <div class="mb-3 p-2 rounded-md" style="border:1.5px solid #1e40af">
      <table class="w-full border-collapse" role="presentation">
        <tr class="border-0 flex justify-between items-center flex-row">
          <td class="border-0 p-1">
            ${OFFICIAL_SEAL_SVG}
          </td>

          <td class="border-none p-1 text-center">
            <h1 class="m-0 font-serif text-xl tracking-wide text-blue-800 font-bold" style="letter-spacing:1px">GOVERNMENT OF MEGHALAYA</h1>
            <h2 class="m-0 text-sm tracking-wide text-gray-800 font-bold" style="margin-top:2px">Directorate of Treasuries</h2>
            <div class="inline-block mt-1 px-4 py-1 bg-blue-600 rounded-md text-white font-bold" style="font-size:13px;letter-spacing:2px">
              SALARY STATEMENT
            </div>
          </td>

          <td class="border-none p-1 text-right text-blue-800 leading-tight" style="font-size:12px">
            <span class="block text-red-800 font-bold uppercase tracking-wider">Statement No.</span>
            ${escapeHtml(statement.voucher_no)}

            <span class="block text-red-800 font-bold uppercase tracking-wider mt-1">Date</span>
            ${escapeHtml(statement.voucher_date)}
          </td>
        </tr>
      </table>
    </div>

    <!-- Identity Block -->
    ${identityBlockHtml}

    <!-- Info Table -->
    <table class="w-full border-collapse mb-1">
      <tr>
        <td class="font-bold bg-gray-100 text-blue-800 border border-gray-300 px-1 py-0.5" style="width:26%;font-size:13px">GPF Description</td>
        <td class="border border-gray-300 px-1 py-0.5" style="width:24%;font-size:13px">${escapeHtml(statement.gpf_desc)}</td>

        <td class="font-bold bg-gray-100 text-blue-800 border border-gray-300 px-1 py-0.5" style="width:26%;font-size:13px">GPF Number</td>
        <td class="border border-gray-300 px-1 py-0.5" style="width:24%;font-size:13px">${escapeHtml(statement.gpf_no)}</td>
      </tr>

      <tr>
        <td class="font-bold bg-gray-100 text-blue-800 border border-gray-300 px-1 py-0.5" style="font-size:13px">Bank Account Number</td>
        <td class="border border-gray-300 px-1 py-0.5" style="font-size:13px">${escapeHtml(statement.bank_no)}</td>

        <td class="font-bold bg-gray-100 text-blue-800 border border-gray-300 px-1 py-0.5" style="font-size:13px">Voucher Number</td>
        <td class="border border-gray-300 px-1 py-0.5" style="font-size:13px">${escapeHtml(statement.voucher_no)}</td>
      </tr>

      <tr>
        <td class="font-bold bg-gray-100 text-blue-800 border border-gray-300 px-1 py-0.5" style="font-size:13px">Voucher Date</td>
        <td class="border border-gray-300 px-1 py-0.5" style="font-size:13px">${escapeHtml(statement.voucher_date)}</td>

        <td class="font-bold bg-gray-100 text-blue-800 border border-gray-300 px-1 py-0.5" style="font-size:13px">Pay in Pay Band</td>
        <td class="border border-gray-300 px-1 py-0.5 tabular-nums" style="font-size:13px">₹ ${formatCurrency(statement.pay_in_pb)}</td>
      </tr>

      <tr>
        <td class="font-bold bg-gray-100 text-blue-800 border border-gray-300 px-1 py-0.5" style="font-size:13px">Grade Pay</td>
        <td class="border border-gray-300 px-1 py-0.5 text-left" style="font-size:13px">₹ ${formatCurrency(statement.grade_pay)}</td>

        <td class="border border-gray-300 px-1 py-0.5"></td>
        <td class="border border-gray-300 px-1 py-0.5"></td>
      </tr>
    </table>

    <!-- Gross Earning Section -->
    ${earningsHtml}

    <!-- Deduction Section -->
    ${deductionsHtml}

    <!-- Net Pay Summary Section Header -->
    <div class="font-bold uppercase text-red-800 mt-4 mb-1" style="font-size:13px;letter-spacing:1.6px;border-bottom:1.5px solid #991b1b;padding-bottom:4px">
      Net Pay Summary
    </div>

    <!-- Summary Card -->
    <div class="mt-1" style="border:1.5px solid #1e40af">
      <table class="w-full border-collapse" role="presentation">
        <tr class="bg-blue-600 text-white font-bold text-base">
          <td class="px-2 py-1">NET PAY</td>
          <td class="px-2 py-1 text-right tabular-nums">₹ ${formatCurrency(statement.net_pay)}</td>
        </tr>
      </table>
    </div>

    <!-- Amount in Words -->
    <div class="border border-gray-300 bg-gray-100 p-1 mt-3" style="font-size:14px;border-left:3px solid #991b1b;padding:6px">
      <span class="block font-bold uppercase text-red-800 mb-0" style="font-size:12px;letter-spacing:1.5px">Amount in Words</span>
      <strong>${escapeHtml(statement.net_pay_in_word)}</strong>
    </div>

    <!-- Footer Notes -->
    <div class="mt-4">
      <div class="font-bold" style="font-size:12px">
        This is a computer-generated, digitally signed salary statement.
      </div>

      <div class="text-gray-600" style="font-size:11px;margin-top:2px">
        In case of any discrepancy, please contact the concerned Treasury Office.
      </div>

      <div class="flex justify-between items-center mt-1 text-gray-500" style="font-size:10.5px">
        <div>Generated on: ${generatedAt}</div>
        <div class="text-right">Statement Ref: ${escapeHtml(statement.voucher_no)}</div>
      </div>
    </div>

  </div>

</body>
</html>`;
}
