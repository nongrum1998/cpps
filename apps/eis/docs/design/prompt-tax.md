# Google Stitch Prompt — Tax Screens

> **Design system:** See `design-system.md` for full token reference.
> **Platform:** React Native / Expo mobile (iOS 390×844), dark mode variants.

---

## Screen 1: Tax List

**Route:** `/tax`
**Purpose:** List income tax details per financial year with filing status.

### Header

- `SectionHeader`: "Income Tax" — `typography.display-xs` (20px/500)
- bg `--secondary` (#f7f7f7)

### List

- `FlatList` with `RefreshControl`
- Each item rendered as tax summary card:

  **Card layout:**
  - bg `--surface-card`, 16px radius, Soft Lift shadow, 16px padding
  - Financial year: "2026–27" — `typography.body-emphasis` (16px/500)
  - Employee name: "Jane Doe" — `typography.caption-md`, `--charcoal`
  - PAN: "ABCDE1234F" — `typography.caption-md`, `--graphite`
  - Regime badge: "New Regime" or "Old Regime" — bg `--primary-soft`, text `--primary`, 8px radius
  - Gross income: "₹12,00,000" — `typography.body-md`
  - Total tax: "₹1,17,000" — `typography.display-sm` (24px/500)
  - Filing status badge:
    - `FILED` / `PROCESSED`: bg `--semantic-up`, white text
    - `NOT_FILED`: bg `--accent-yellow`, white text

### States

| State         | Behaviour                     |
| ------------- | ----------------------------- |
| **Loading**   | 4 skeleton cards with shimmer |
| **Empty**     | "No tax records found"        |
| **Populated** | Full scrollable list          |

### Navigation

- Tap card → `/tax/[id]` (detail)
- FAB: Create new tax record → `/tax/create`

---

## Screen 2: Tax Detail

**Route:** `/tax/[id]`
**Purpose:** View full tax calculation breakdown for a financial year.

### Header

- Stack header: back arrow + "Tax 2026–27"
- Employee info strip: "Jane Doe" + "IT Department" + PAN "ABCDE1234F"

### Summary Card

- bg `--surface-card`, 16px radius, Soft Lift shadow
- Two columns or vertical stack:
  - Gross Annual Income: ₹12,00,000
  - Standard Deduction: ₹50,000
  - **Taxable Income**: ₹11,50,000
  - **Total Tax**: ₹1,17,000
  - Effective Tax Rate: 9.75%
  - TDS Deducted: ₹1,00,000
  - Tax Paid: ₹1,10,000
  - **Tax Payable**: ₹7,000

### Slab Breakdown (TaxSlabBreakdown[])

**Section title**: "Tax Slab Breakdown" — `typography.body-emphasis`

Table with rows:

| Slab                | Income Range          | Rate | Taxable Amount | Tax    |
| ------------------- | --------------------- | ---- | -------------- | ------ |
| 0–4,00,000          | 0 – 4,00,000          | 0%   | 4,00,000       | 0      |
| 4,00,001–8,00,000   | 4,00,001 – 8,00,000   | 5%   | 4,00,000       | 20,000 |
| 8,00,001–12,00,000  | 8,00,001 – 12,00,000  | 10%  | 3,50,000       | 35,000 |
| 12,00,001–16,00,000 | 12,00,001 – 16,00,000 | 15%  | 0              | 0      |
| 16,00,001–20,00,000 | 16,00,001 – 20,00,000 | 20%  | 0              | 0      |
| 20,00,001–24,00,000 | 20,00,001 – 24,00,000 | 25%  | 0              | 0      |
| Above 24,00,000     | 24,00,001+            | 30%  | 0              | 0      |

### Deductions Section

- 80C Deductions: ₹1,50,000
- 80D (Medical): ₹25,000
- HRA Exemption: ₹1,20,000
- LTA Exemption: ₹0
- Home Loan Interest: ₹0
- NPS Contribution: ₹50,000

### Tax Computation Summary

- Base Tax: ₹1,17,000
- Rebate u/s 87A: ₹0
- Surcharge: ₹0
- Cess (4%): ₹4,680
- **Total Tax Liability**: ₹1,21,680
- TDS Deducted: ₹1,00,000
- Tax Paid (advance): ₹10,000
- **Tax Payable / Refund**: ₹11,680

### Data Model

```typescript
EmployeeTaxDetail = {
  id: "tax-001"
  employeeId: "emp-123"
  employeeName: "Jane Doe"
  designation: "Software Engineer"
  department: "IT Department"
  panNumber: "ABCDE1234F"
  financialYear: "2026-27"
  grossAnnualIncome: 1200000
  standardDeduction: 50000
  taxableIncome: 1150000
  regime: "NEW"                    // NEW | OLD
  slabBreakdown: [
    { label: "0–4,00,000", minIncome: 0, maxIncome: 400000, rate: 0, taxableAmount: 400000, taxAtSlab: 0 },
    { label: "4,00,001–8,00,000", minIncome: 400001, maxIncome: 800000, rate: 5, taxableAmount: 400000, taxAtSlab: 20000 },
    // ... additional slabs
  ]
  baseTax: 117000
  rebate87A: 0
  surcharge: 0
  cess: 4680
  totalTax: 121680
  effectiveTaxRate: 9.75
  tdsDeducted: 100000
  taxPaid: 10000
  taxPayable: 11680
  deductions80C: 150000
  deductions80D: 25000
  hraExemption: 120000
  ltaExemption: 0
  homeLoanInterest: 0
  npsContribution: 50000
  filingStatus: "FILED"            // NOT_FILED | FILED | PROCESSED
}
```

---

## Screen 3: Create / Edit Tax

**Route:** `/tax/create` or `/tax/[id]/edit`
**Purpose:** Create new tax record or edit existing one.

### Form Fields

1. **Financial Year** — Picker (e.g., "2026-27", "2025-26")
2. **Regime** — Toggle: New Regime / Old Regime
3. **80C Deductions** — Text input, numeric, placeholder "₹1,50,000"
4. **80D Deductions** — Text input, numeric
5. **HRA Exemption** — Text input, numeric
6. **LTA Exemption** — Text input, numeric
7. **Home Loan Interest** — Text input, numeric
8. **NPS Contribution** — Text input, numeric

### Submit

- **Save button**: Full width, `--primary`

---

## Output Directive

Generate mobile UI mockup for React Native/Expo (iOS 390×844) with light and dark mode. Show list with 2 entries, detail with full tax slab breakdown table and deduction sections. Use `₹` for all amounts. HP Design System tokens.
