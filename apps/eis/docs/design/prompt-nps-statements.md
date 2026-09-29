# Google Stitch Prompt — NPS Statement Screen

> **Design system:** See `design-system.md` for full token reference.
> **Platform:** React Native / Expo mobile (iOS 390×844), dark mode variants.

---

## Screen 1: NPS Statement Detail

**Route:** `/nps-statements`
**Purpose:** View the employee's NPS (National Pension System) Tier-I Annexure-5 statement for a selected financial year, showing member details, monthly employee/government contribution data, and balance summary.

### Header

- `SectionHeader`: "NPS Statements" — `typography.display-xs` (20px/500), back arrow
- bg `--secondary` (#f7f7f7)

### Year Selector

- `<SelectSheet>`-based bottom sheet / inline picker for selecting financial year (pattern mirrors `GPFYearSelectSheet`)
- Label: "Select Financial Year" — `typography.caption-md`, `--charcoal`
- Selected year displayed as chip: "2025–2026" — `typography.body-md`, `--primary` bg `--primary-soft`
- Shown both in empty state and above the scrollable content
- Disabled (with spinner) while financial years are fetching

### Member Information Card

- `<Card variant="elevated">` — bg `--surface-card`, 16px radius, Soft Lift shadow, `p-lg` padding
- Icon + label/value rows in a `flex-row flex-wrap` grid (pattern mirrors GPF statement card):
  - Each row: 20px icon in `bg-primary-fixed/30` rounded square (`#024ad8` icon), label `--graphite`, value `--ink`
  - Icon suggestions: `UserSquareIcon` (Name), `IdentityCardIcon` (PRAN), `BadgeCheckIcon` (PPAN), `Calendar02Icon` (DoJ/Reg), `LandmarkIcon` (Office/Dept)
- Rows:

  | Label                  | Value                                                 |
  | ---------------------- | ----------------------------------------------------- |
  | Name                   | `fname` — `typography.body-emphasis`                  |
  | PRAN                   | `pran` — `typography.body-emphasis`                   |
  | PPAN                   | `ppan` — `typography.body-emphasis`                   |
  | Date of Joining        | `date_of_joining` — `typography.body-emphasis`        |
  | Date of Regularisation | `date_of_regularisation` — `typography.body-emphasis` |
  | Office                 | `office_name` — `typography.body-emphasis`            |
  | Designation            | `desig` — `typography.body-emphasis`                  |
  | Department             | `dept` — `typography.body-emphasis`                   |
  | DDO Code               | `ddo_code` — `typography.body-emphasis`               |

- Labels in `typography.caption-md`, `--graphite`; values `typography.body-emphasis` (16px/500), `--ink`, `numberOfLines={1}` truncation

### Monthly Contribution Section

**Section title**: "Monthly Contribution" — `typography.body-emphasis`, `--ink`, with bottom margin

### Monthly Contribution Table

- `<MonthlyTable>` — horizontally scrollable table inside `Card variant="bordered"`
- Column header row: bg `--secondary` (#f7f7f7), `typography.caption-bold`, `--charcoal`

  | Financial Month (110px) | Basic (90px) | DA (90px) | Employee (100px) | Government (110px) | Total (100px) | Type (70px) |

- Data rows (12 months, Apr–Mar of the selected financial year, derived from `fin_mmyyy`):
  - Alternating bg: even rows `--canvas` (#ffffff), odd rows `--secondary` (#f7f7f7)
  - Cell content: `typography.caption-md` (14px/400), `--ink`
  - Amount cells: `typography.caption-md` (14px/400), `--ink`, right-aligned
  - Empty cell fallback: `-` (en dash)
  - Row separator: 1px `--muted` (#e8e8e8)
  - Horizontal scroll: `ScrollView horizontal` with scroll indicator

### Summary Section

**Section title**: "Summary" — `typography.body-emphasis`, `--ink`, with top margin (24px) and bottom margin

### Summary Card

- `<Card variant="elevated">` — vertical label/value list (pattern mirrors `SummaryVerticalView`)
- Rows with 1px `--muted` separators, 16px horizontal / 12px vertical padding:

  | Label                       | Value                                       |
  | --------------------------- | ------------------------------------------- |
  | Opening Balance             | `opening_bal` — `typography.body-emphasis`  |
  | Total Employee Contribution | `tot_ampamt` — `typography.body-emphasis`   |
  | Total Govt. Contribution    | `tot_gvtamt` — `typography.body-emphasis`   |
  | Total Tier-I Amount         | `tot_tier1amt` — `typography.body-emphasis` |
  | Closing Balance             | `closing_bal` — `typography.body-emphasis`  |
  | Deposit                     | `deposit` — `typography.body-emphasis`      |

- Labels left (`--graphite`, `typography.caption-md`), values right `typography.body-emphasis` `--ink`

### States

| State            | Behaviour                                                                              |
| ---------------- | -------------------------------------------------------------------------------------- |
| **Loading**      | `<NpsStatementSkeleton>` — skeleton cards (member info + table + summary) with shimmer |
| **Empty**        | Year selector + `<EmptyScreen>` "No NPS Statement Found" with refresh button           |
| **Populated**    | Year selector + ScrollView with member info card, monthly table, summary card          |
| **Refreshing**   | Pull-to-refresh via `RefreshControl` on `ScrollView`                                   |
| **No PRAN/PPAN** | Query disabled — screen shows empty state prompting year selection / contact HR        |

### Scroll Behaviour

- Outer `ScrollView` wraps: member info card → monthly contribution section → monthly table → summary section → summary card
- Monthly table has its own internal horizontal `ScrollView`
- `RefreshControl` wired to `refetch` with `isFetching` spinner
- `showsVerticalScrollIndicator={false}`

### Data Model

```typescript
NPSAnnux5 = {
  pran: string                // e.g., "100002345678"
  ppan: string                // e.g., "PUN123456789"
  fname: string               // e.g., "Arun Kumar Sharma"
  date_of_joining: string     // e.g., "01/04/2010"
  date_of_regularisation: string // e.g., "01/07/2012"
  office_name: string         // e.g., "O/o Principal Accountant General"
  desig: string               // e.g., "Section Officer"
  dept: string                // e.g., "Finance Department"
  ddo_code: string            // e.g., "DDO-123"
  opening_bal: string         // e.g., "250000.00"
  closing_bal: string         // e.g., "285000.00"
  deposit: string             // e.g., "0.00"
  tot_ampamt: number          // total employee contribution, e.g., 15000
  tot_gvtamt: number          // total government contribution, e.g., 20000
  tot_tier1amt: number        // total Tier-I amount, e.g., 35000
  fin_mmyyy: string[]         // ["Apr 2025", "May 2025", ...] one per month
  basic: string[]             // monthly basic pay, e.g., ["40000", "40000"]
  da: string[]                // monthly DA, e.g., ["8000", "8000"]
  empamt: number[]            // monthly employee contribution, e.g., [1250, 1250]
  govt_amt: number[]          // monthly government contribution, e.g., [1667, 1667]
  total: number[]             // monthly total contribution, e.g., [2917, 2917]
  c_type: string[]            // contribution type, e.g., ["T", "T"] (Tier-I)
}
```

---

## Output Directive

Generate mobile UI mockup for React Native/Expo (iOS 390×844) with light and dark mode. Show the full screen with all sections visible: year selector chip, member information card (name, PRAN, PPAN, DoJ, regularisation, office, designation, department, DDO code), monthly contribution table with at least 6 rows visible (horizontal scroll hint), and the summary card at the bottom. Display sample data with realistic NPS values (₹ amounts). Use HP Design System tokens — `#024ad8` primary, `#1a1a1a` ink, `#f7f7f7` secondary surface.
